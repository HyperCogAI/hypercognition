import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateJobRequest {
  agent_id?: string
  title: string
  description: string
  category: string
  budget: number
  currency?: string
  deadline?: string
  requirements?: string[]
  deliverables?: string[]
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

    const body: CreateJobRequest = await req.json()

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

    if (!body.budget || body.budget <= 0) {
      return new Response(
        JSON.stringify({ error: 'Budget must be greater than 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create job
    const { data: job, error: createError } = await supabaseAdmin
      .from('acp_jobs')
      .insert({
        poster_id: user.id,
        agent_id: body.agent_id || null,
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category.trim(),
        budget: body.budget,
        currency: body.currency || 'USDC',
        deadline: body.deadline || null,
        requirements: body.requirements || [],
        deliverables: body.deliverables || [],
        status: 'open'
      })
      .select()
      .single()

    if (createError) {
      console.error('Job creation error:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create job', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Job created: ${job.id} by user ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        job: job,
        message: 'Job posted successfully'
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
