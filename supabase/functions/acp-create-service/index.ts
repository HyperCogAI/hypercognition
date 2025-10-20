import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateServiceRequest {
  agent_id: string
  title: string
  description: string
  category: string
  price: number
  currency?: string
  delivery_time_hours?: number
  requirements?: string[]
  features?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: CreateServiceRequest = await req.json()
    const startTime = Date.now()


    // Atomic rate limiting check
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_acp_rate_limit', {
        user_id_param: user.id,
        operation_type: 'create_service',
        max_requests: 10
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (rateLimitCheck && !rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: `You can only create ${rateLimitCheck.limit} services per day. ${rateLimitCheck.remaining || 0} remaining.`,
          reset_at: rateLimitCheck.reset_at
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate using enhanced database function with array and category validation
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_acp_service', {
        title_param: body.title?.trim(),
        description_param: body.description?.trim(),
        price_param: body.price,
        category_param: body.category?.trim(),
        features_param: body.features || null
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

    // Enhanced agent verification with status checks
    const { data: agentCheck, error: agentError } = await supabaseAdmin
      .rpc('verify_agent_eligibility', {
        agent_id_param: body.agent_id,
        user_id_param: user.id
      })

    if (agentError) {
      console.error('Agent verification error:', agentError)
      return new Response(
        JSON.stringify({ error: 'Agent verification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!agentCheck?.eligible) {
      return new Response(
        JSON.stringify({ 
          error: agentCheck.error || 'agent_ineligible',
          message: agentCheck.message || 'Agent is not eligible for service creation'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log warning if agent not verified
    if (agentCheck.warning) {
      console.warn(`Service creation warning: ${agentCheck.warning} - ${agentCheck.message}`)
    }

    // Create service with sanitized data
    const { data: service, error: createError } = await supabaseAdmin
      .from('acp_services')
      .insert({
        agent_id: body.agent_id,
        creator_id: user.id,
        title: validationResult.sanitized_title,
        description: validationResult.sanitized_description,
        category: body.category.trim(),
        price: body.price,
        currency: body.currency || 'USDC',
        delivery_time_hours: body.delivery_time_hours,
        requirements: body.requirements || [],
        features: body.features || [],
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('Service creation error:', createError)
      
      // Map database error to user-friendly message
      const { data: errorMapping } = await supabaseAdmin
        .rpc('map_database_error', {
          error_code: createError.code || '500',
          error_message: createError.message,
          table_name: 'acp_services'
        })
      
      return new Response(
        JSON.stringify({ 
          error: errorMapping?.user_message || 'Failed to create service',
          details: createError.message
        }),
        { status: errorMapping?.status_code || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Service created: ${service.id} by user ${user.id}`)

    // Log operation for monitoring
    await supabaseAdmin.rpc('log_acp_operation', {
      user_id_param: user.id,
      operation_param: 'create_service',
      operation_type_param: 'create',
      resource_type_param: 'acp_services',
      resource_id_param: service.id,
      status_param: 'success',
      execution_time_ms_param: Date.now() - startTime
    })


    return new Response(
      JSON.stringify({
        success: true,
        service: service,
        message: 'Service created successfully'
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
