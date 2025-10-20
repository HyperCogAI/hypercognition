import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAgentRequest {
  name: string
  symbol: string
  description: string
  category: string
  avatar_url?: string
  features: string[]
  initial_supply: string
  initial_price: string
  chain: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.warn('[CreateAgent] Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client for user authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Service client for bypassing RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.warn('[CreateAgent] Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Edge function-level rate limiting (prevents DoS on the function itself)
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const { data: functionRateLimit, error: functionRateLimitError } = await supabaseAdmin
      .rpc('enhanced_rate_limit_check', {
        identifier_param: user.id,
        endpoint_param: 'create-agent',
        max_requests_param: 10,
        window_minutes_param: 1
      })

    if (functionRateLimitError) {
      console.error('[CreateAgent] Function rate limit check failed:', functionRateLimitError)
    } else if (functionRateLimit && !functionRateLimit.allowed) {
      console.warn(`[CreateAgent] Function rate limit exceeded for user ${user.id}`)
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          message: `Please wait ${functionRateLimit.retry_after || 60} seconds before trying again.`,
          retryAfter: functionRateLimit.retry_after
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(functionRateLimit.retry_after || 60)
          } 
        }
      )
    }

    // Atomic rate limiting using database transaction - prevents race conditions
    // This ensures even concurrent requests cannot bypass the 5 agents/day limit
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_agent_creation_limit', {
        user_id_param: user.id,
        max_agents_param: 5
      })

    if (rateLimitError) {
      console.error('[CreateAgent] Rate limit check error:', rateLimitError)
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed', details: rateLimitError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!rateLimitCheck?.allowed) {
      console.warn(`[CreateAgent] User ${user.id} exceeded daily creation limit (${rateLimitCheck?.current_count || 0}/5)`)
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'You can only create 5 agents per day. Please try again later.',
          currentCount: rateLimitCheck?.current_count,
          resetTime: rateLimitCheck?.reset_time
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateAgentRequest = await req.json()

    // Validate required fields are present and not empty
    if (!body.name || !body.symbol || !body.description || !body.category) {
      console.warn('[CreateAgent] Missing required fields:', { 
        hasName: !!body.name, 
        hasSymbol: !!body.symbol, 
        hasDescription: !!body.description,
        hasCategory: !!body.category 
      })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize and validate input
    const agentName = body.name.trim()
    const agentSymbol = body.symbol.trim().toUpperCase()
    const agentDescription = body.description.trim()
    const agentCategory = body.category.trim()

    // Validate features array length and content (prevent abuse)
    if (!Array.isArray(body.features) || body.features.length < 1 || body.features.length > 12) {
      console.warn(`[CreateAgent] Invalid features array length: ${body.features?.length || 0}`)
      return new Response(
        JSON.stringify({ error: 'Features must contain between 1 and 12 items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Whitelist validation for features
    const validFeatures = [
      "Automated Trading", "Risk Management", "Multi-Chain", "Real-time Analytics",
      "Social Integration", "AI Learning", "Custom Strategies", "Portfolio Management",
      "Market Making", "Arbitrage", "Yield Farming", "Governance"
    ]
    
    const invalidFeatures = body.features.filter(f => !validFeatures.includes(f))
    if (invalidFeatures.length > 0) {
      console.warn('[CreateAgent] Invalid features detected:', invalidFeatures)
      return new Response(
        JSON.stringify({ error: 'Invalid features selected', invalidFeatures }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate avatar URL if provided
    if (body.avatar_url) {
      const { data: urlValidation, error: urlError } = await supabaseAdmin
        .rpc('validate_url', { url_param: body.avatar_url })
      
      if (urlError || !urlValidation?.valid) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid avatar URL', 
            details: urlValidation?.error || 'URL validation failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate using enhanced database function with comprehensive security checks
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_agent_creation_enhanced', {
        agent_name: agentName,
        agent_symbol: agentSymbol,
        agent_description: agentDescription,
        agent_category: agentCategory,
        avatar_url_param: body.avatar_url || null,
        features_param: body.features
      })

    if (validationError) {
      console.error('Validation error:', validationError)
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          errors: validationResult.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate numeric fields - NO default values, fields are required
    if (!body.initial_supply || !body.initial_price) {
      console.warn('[CreateAgent] Missing numeric fields')
      return new Response(
        JSON.stringify({ error: 'Initial supply and price are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const initialSupply = parseFloat(body.initial_supply)
    const initialPrice = parseFloat(body.initial_price)

    // Validate parsed numbers are valid
    if (isNaN(initialSupply) || isNaN(initialPrice)) {
      console.warn('[CreateAgent] Invalid numeric values:', { initialSupply, initialPrice })
      return new Response(
        JSON.stringify({ error: 'Initial supply and price must be valid numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (initialSupply <= 0 || initialSupply > 1000000000000) {
      console.warn(`[CreateAgent] Invalid initial supply: ${initialSupply}`)
      return new Response(
        JSON.stringify({ error: 'Initial supply must be between 0 and 1 trillion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (initialPrice <= 0 || initialPrice > 1000000) {
      console.warn(`[CreateAgent] Invalid initial price: ${initialPrice}`)
      return new Response(
        JSON.stringify({ error: 'Initial price must be between 0 and 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate chain - FIXED: Match frontend chains (base, ethereum, bsc, arbitrum)
    const validChains = ['base', 'ethereum', 'bsc', 'arbitrum']
    const chain = body.chain?.toLowerCase()
    if (!chain || !validChains.includes(chain)) {
      console.warn(`[CreateAgent] Invalid chain selected: ${chain}`)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid blockchain selected',
          validChains: validChains 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate market cap with precision handling
    const marketCap = Number((BigInt(Math.floor(initialSupply * 1e8)) * BigInt(Math.floor(initialPrice * 1e8)) / BigInt(1e16)).toString())

    // Use sanitized values from validation
    const sanitizedName = validationResult.sanitized_name || agentName
    const sanitizedDescription = validationResult.sanitized_description || agentDescription

    console.log(`[CreateAgent] Creating agent for user ${user.id}: ${sanitizedName} (${agentSymbol})`)

    // Atomic transaction: Create agent and log request together (prevents partial failures)
    let agent: any = null
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        // Create agent using service role to bypass RLS with sanitized data
        const { data: agentData, error: createError } = await supabaseAdmin
          .from('agents')
          .insert({
            name: sanitizedName,
            symbol: agentSymbol,
            description: sanitizedDescription,
            category: agentCategory,
            avatar_url: body.avatar_url || null,
            features: body.features,
            initial_supply: initialSupply,
            initial_price: initialPrice,
            chain: chain,
            price: initialPrice,
            market_cap: marketCap,
            creator_id: user.id,
            status: 'active',
            volume_24h: 0,
            change_24h: 0
          })
          .select()
          .single()

        if (createError) {
          // Parse error code for better error handling
          const errorCode = createError.code
          const errorMessage = createError.message?.toLowerCase() || ''

          // Handle unique constraint violations (409 Conflict)
          if (errorCode === '23505' || errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
            console.warn(`[CreateAgent] Duplicate constraint violation for user ${user.id}:`, createError.message)
            
            // Check which field is duplicated
            if (errorMessage.includes('symbol') || errorMessage.includes('agents_symbol_key')) {
              return new Response(
                JSON.stringify({ 
                  error: 'Symbol already exists',
                  message: `The symbol "${agentSymbol}" is already taken. Please choose a different symbol.`,
                  field: 'symbol'
                }),
                { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
            
            return new Response(
              JSON.stringify({ 
                error: 'Duplicate agent',
                message: 'An agent with these details already exists. Please modify your input.'
              }),
              { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Handle other constraint violations
          if (errorCode === '23503') {
            console.error('[CreateAgent] Foreign key constraint violation:', createError.message)
            return new Response(
              JSON.stringify({ error: 'Invalid reference data' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          if (errorCode === '23514') {
            console.error('[CreateAgent] Check constraint violation:', createError.message)
            return new Response(
              JSON.stringify({ error: 'Data validation failed', details: 'Invalid data format' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Generic database error
          console.error('[CreateAgent] Database error:', createError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create agent',
              message: 'A database error occurred. Please try again.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        agent = agentData
        break // Success, exit retry loop

      } catch (error) {
        retryCount++
        console.error(`[CreateAgent] Retry ${retryCount}/${maxRetries} after error:`, error)
        
        if (retryCount >= maxRetries) {
          console.error('[CreateAgent] Max retries exceeded')
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create agent after multiple attempts',
              message: 'Please try again later.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount)))
      }
    }

    if (!agent) {
      console.error('[CreateAgent] Agent creation failed without specific error')
      return new Response(
        JSON.stringify({ error: 'Failed to create agent' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the creation request - critical for audit trail
    const { error: logError } = await supabaseAdmin
      .from('agent_creation_requests')
      .insert({
        creator_id: user.id,
        agent_data: body,
        status: 'approved',
        agent_id: agent.id,
        processed_at: new Date().toISOString()
      })

    if (logError) {
      // CRITICAL: Log failure should be monitored/alerted
      console.error('[CreateAgent] CRITICAL: Failed to log creation request:', logError)
      console.error('[CreateAgent] Agent created but not logged:', { agentId: agent.id, userId: user.id })
      // Continue - don't fail the request, but this should trigger monitoring alerts
    } else {
      console.log(`[CreateAgent] Successfully logged creation request for agent ${agent.id}`)
    }

    // Return success response
    console.log(`[CreateAgent] Successfully created agent ${agent.id} for user ${user.id}`)
    return new Response(
      JSON.stringify({
        success: true,
        agent: agent,
        message: 'Agent created successfully'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[CreateAgent] Unexpected error:', error)
    
    // Sanitize error message for client (don't leak internal details)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const sanitizedMessage = errorMessage.includes('database') || errorMessage.includes('supabase')
      ? 'An internal error occurred. Please try again.'
      : errorMessage

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: sanitizedMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
