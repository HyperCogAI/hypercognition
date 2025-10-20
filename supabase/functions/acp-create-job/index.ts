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
    const startTime = Date.now()


    // Atomic rate limiting check
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_acp_rate_limit', {
        user_id_param: user.id,
        operation_type: 'create_job',
        max_requests: 5
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
          message: `You can only create ${rateLimitCheck.limit} jobs per day. ${rateLimitCheck.remaining || 0} remaining.`,
          reset_at: rateLimitCheck.reset_at
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate using enhanced database function with category whitelist
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_acp_job', {
        title_param: body.title?.trim(),
        description_param: body.description?.trim(),
        budget_param: body.budget,
        category_param: body.category?.trim(),
        requirements_param: body.requirements || null,
        deliverables_param: body.deliverables || null
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

    // Validate deadline if provided
    if (body.deadline) {
      const { data: deadlineCheck, error: deadlineError } = await supabaseAdmin
        .rpc('validate_deadline', {
          deadline_param: body.deadline,
          max_days_future: 365
        })

      if (deadlineError) {
        console.error('Deadline validation error:', deadlineError)
      } else if (!deadlineCheck?.valid) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid deadline',
            message: deadlineCheck.error
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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
      
      // Map database error to user-friendly message
      const { data: errorMapping } = await supabaseAdmin
        .rpc('map_database_error', {
          error_code: createError.code || '500',
          error_message: createError.message,
          table_name: 'acp_jobs'
        })
      
      return new Response(
        JSON.stringify({ 
          error: errorMapping?.user_message || 'Failed to create job',
          details: createError.message
        }),
        { status: errorMapping?.status_code || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Job created: ${job.id} by user ${user.id}`)

    // Log operation for monitoring
    await supabaseAdmin.rpc('log_acp_operation', {
      user_id_param: user.id,
      operation_param: 'create_job',
      operation_type_param: 'create',
      resource_type_param: 'acp_jobs',
      resource_id_param: job.id,
      status_param: 'success',
      execution_time_ms_param: Date.now() - startTime
    })


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
