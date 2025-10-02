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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limiting - max 5 agents per user per day
    const { data: recentAgents, error: rateLimitError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('creator_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    } else if (recentAgents && recentAgents.length >= 5) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'You can only create 5 agents per day. Please try again later.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateAgentRequest = await req.json()

    // Sanitize and validate input
    const agentName = body.name?.trim()
    const agentSymbol = body.symbol?.trim().toUpperCase()
    const agentDescription = body.description?.trim()
    const agentCategory = body.category?.trim()

    // Validate using database function
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_agent_creation', {
        agent_name: agentName,
        agent_symbol: agentSymbol,
        agent_description: agentDescription,
        agent_category: agentCategory
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

    // Validate numeric fields
    const initialSupply = parseFloat(body.initial_supply) || 1000000
    const initialPrice = parseFloat(body.initial_price) || 0.001

    if (initialSupply <= 0 || initialSupply > 1000000000000) {
      return new Response(
        JSON.stringify({ error: 'Initial supply must be between 0 and 1 trillion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (initialPrice <= 0 || initialPrice > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Initial price must be between 0 and 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate features
    if (!Array.isArray(body.features) || body.features.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one feature must be selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate chain
    const validChains = ['base', 'ethereum', 'polygon', 'arbitrum']
    if (!validChains.includes(body.chain?.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid blockchain selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate market cap
    const marketCap = initialSupply * initialPrice

    // Create agent using service role to bypass RLS
    const { data: agent, error: createError } = await supabaseAdmin
      .from('agents')
      .insert({
        name: agentName,
        symbol: agentSymbol,
        description: agentDescription,
        category: agentCategory,
        avatar_url: body.avatar_url || null,
        features: body.features,
        initial_supply: initialSupply,
        initial_price: initialPrice,
        chain: body.chain.toLowerCase(),
        price: initialPrice,
        market_cap: marketCap,
        creator_id: user.id,
        status: 'active', // Auto-approve for now, can add moderation later
        volume_24h: 0,
        change_24h: 0
      })
      .select()
      .single()

    if (createError) {
      console.error('Agent creation error:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create agent', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the creation request
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
      console.error('Failed to log creation request:', logError)
      // Don't fail the request if logging fails
    }

    // Return success response
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
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
