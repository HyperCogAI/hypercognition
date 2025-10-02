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

    // Validate input
    if (!body.title || body.title.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Title must be at least 5 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.description || body.description.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Description must be at least 20 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.price || body.price <= 0) {
      return new Response(
        JSON.stringify({ error: 'Price must be greater than 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', body.agent_id)
      .eq('creator_id', user.id)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found or you do not own this agent' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create service
    const { data: service, error: createError } = await supabaseAdmin
      .from('acp_services')
      .insert({
        agent_id: body.agent_id,
        creator_id: user.id,
        title: body.title.trim(),
        description: body.description.trim(),
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
      return new Response(
        JSON.stringify({ error: 'Failed to create service', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Service created: ${service.id} by user ${user.id}`)

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
