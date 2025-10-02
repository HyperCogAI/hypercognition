import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessTransactionRequest {
  transaction_type: 'service_payment' | 'job_payment' | 'tip' | 'refund' | 'escrow_release' | 'subscription'
  to_user_id: string
  agent_id?: string
  service_id?: string
  job_id?: string
  amount: number
  currency?: string
  payment_method?: string
  escrow_days?: number
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

    const body: ProcessTransactionRequest = await req.json()

    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_acp_rate_limit', {
        user_id_param: user.id,
        operation_type: 'create_transaction'
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    } else if (rateLimitCheck && typeof rateLimitCheck === 'object') {
      const limitData = rateLimitCheck as any
      if (!limitData.allowed) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `Transaction limit reached. Please try again later.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate input
    if (!body.amount || body.amount <= 0 || body.amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between 0 and $1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.to_user_id) {
      return new Response(
        JSON.stringify({ error: 'Recipient user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify recipient exists
    const { data: recipientExists, error: recipientError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', body.to_user_id)
      .single()

    if (recipientError || !recipientExists) {
      return new Response(
        JSON.stringify({ error: 'Recipient user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate platform fee (2.5%)
    const platformFee = body.amount * 0.025

    // Calculate escrow date if needed
    let escrowUntil = null
    if (body.escrow_days && body.escrow_days > 0) {
      const escrowDate = new Date()
      escrowDate.setDate(escrowDate.getDate() + body.escrow_days)
      escrowUntil = escrowDate.toISOString()
    }

    // Create transaction
    const { data: transaction, error: createError } = await supabaseAdmin
      .from('acp_transactions')
      .insert({
        transaction_type: body.transaction_type,
        from_user_id: user.id,
        to_user_id: body.to_user_id,
        agent_id: body.agent_id || null,
        service_id: body.service_id || null,
        job_id: body.job_id || null,
        amount: body.amount,
        currency: body.currency || 'USDC',
        fee: platformFee,
        status: escrowUntil ? 'processing' : 'pending',
        payment_method: body.payment_method || 'wallet',
        escrow_until: escrowUntil,
        metadata: {
          created_by_function: true,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (createError) {
      console.error('Transaction creation error:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to process transaction', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update related records
    if (body.service_id) {
      await supabaseAdmin
        .from('acp_services')
        .update({ 
          total_orders: supabaseAdmin.raw('total_orders + 1')
        })
        .eq('id', body.service_id)
    }

    // Create earnings record
    await supabaseAdmin
      .from('agents_earnings')
      .insert({
        agent_id: body.agent_id || null,
        user_id: body.to_user_id,
        amount: body.amount - platformFee,
        earnings_type: body.transaction_type,
        currency: body.currency || 'USDC',
        source_transaction_id: transaction.id,
        description: `Payment from ${body.transaction_type.replace(/_/g, ' ')}`
      })

    console.log(`Transaction processed: ${transaction.id} from ${user.id} to ${body.to_user_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        transaction: transaction,
        platform_fee: platformFee,
        recipient_receives: body.amount - platformFee,
        message: 'Transaction processed successfully'
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
