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

    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_acp_rate_limit', {
        user_id_param: user.id,
        operation_type: 'create_job'
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    } else if (rateLimitCheck && typeof rateLimitCheck === 'object') {
      const limitData = rateLimitCheck as any
      if (!limitData.allowed) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `You can only create ${limitData.limit} jobs per day. Please try again later.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate using database function
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_acp_job', {
        title_param: body.title?.trim(),
        description_param: body.description?.trim(),
        budget_param: body.budget
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

    // Create job with sanitized data
    const { data: job, error: createError } = await supabaseAdmin
      .from('acp_jobs')
      .insert({
        poster_id: user.id,
        agent_id: body.agent_id || null,
        title: validationResult.sanitized_title,
        description: validationResult.sanitized_description,
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
