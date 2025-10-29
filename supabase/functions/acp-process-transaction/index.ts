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
  metadata?: Record<string, any>
  idempotency_key?: string
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
    const startTime = Date.now()

    // Atomic rate limiting check
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_acp_rate_limit', {
        user_id_param: user.id,
        operation_type: 'process_transaction',
        max_requests: 50
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
          message: `You can only process ${rateLimitCheck.limit} transactions per day. ${rateLimitCheck.remaining || 0} remaining.`,
          reset_at: rateLimitCheck.reset_at
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check idempotency to prevent duplicate transactions
    if (body.idempotency_key) {
      const { data: idempotencyCheck, error: idempotencyError } = await supabaseAdmin
        .rpc('check_transaction_idempotency', {
          idempotency_key_param: body.idempotency_key,
          user_id_param: user.id
        })

      if (idempotencyError) {
        console.error('Idempotency check error:', idempotencyError)
      } else if (idempotencyCheck?.is_duplicate) {
        console.log('Duplicate transaction detected, returning existing:', body.idempotency_key)
        const existingTx = idempotencyCheck.transaction
        return new Response(
          JSON.stringify({
            success: true,
            transaction: existingTx,
            platform_fee: existingTx.fee,
            recipient_receives: existingTx.amount - existingTx.fee,
            message: 'Transaction already processed (idempotent)',
            duplicate: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate amount
    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount', message: 'Amount must be greater than 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount', message: 'Amount cannot exceed 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.to_user_id) {
      return new Response(
        JSON.stringify({ error: 'Recipient user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate currency
    const validCurrencies = ['USDC', 'SOL']
    const currency = body.currency || 'USDC'
    if (!validCurrencies.includes(currency)) {
      return new Response(
        JSON.stringify({ error: 'Invalid currency', message: `Currency must be one of: ${validCurrencies.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate escrow_days
    if (body.escrow_days) {
      if (body.escrow_days < 0 || body.escrow_days > 90) {
        return new Response(
          JSON.stringify({ error: 'Invalid escrow period', message: 'Escrow days must be between 0 and 90' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Verify recipient exists
    const { data: recipientExists, error: recipientError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, wallet_address')
      .eq('user_id', body.to_user_id)
      .single()

    if (recipientError || !recipientExists) {
      return new Response(
        JSON.stringify({ error: 'Recipient user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get sender wallet address
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_address')
      .eq('user_id', user.id)
      .single()

    if (!senderProfile?.wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Sender wallet not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate platform fee (2.5%) using precise arithmetic
    const amount = BigInt(Math.floor(body.amount * 1000000)) // Convert to micro-units
    const platformFeeAmount = (amount * BigInt(25)) / BigInt(1000) // 2.5%
    const netAmountBigInt = amount - platformFeeAmount
    
    const platformFee = Number(platformFeeAmount) / 1000000
    const netAmount = Number(netAmountBigInt) / 1000000

    // Calculate escrow date if needed
    let escrowUntil = null
    if (body.escrow_days && body.escrow_days > 0) {
      const escrowDate = new Date()
      escrowDate.setDate(escrowDate.getDate() + body.escrow_days)
      escrowUntil = escrowDate.toISOString()
    }

    // NON-CUSTODIAL: Create pending transaction that awaits blockchain confirmation
    const transactionData = {
      transaction_type: body.transaction_type,
      from_user_id: user.id,
      to_user_id: body.to_user_id,
      agent_id: body.agent_id || null,
      service_id: body.service_id || null,
      job_id: body.job_id || null,
      amount: body.amount,
      currency: currency,
      fee: platformFee,
      status: 'pending', // Always pending until blockchain confirmation
      payment_method: 'blockchain',
      escrow_until: escrowUntil,
      is_blockchain: true,
      idempotency_key: body.idempotency_key || null,
      metadata: {
        created_by_function: true,
        timestamp: new Date().toISOString(),
        requires_blockchain_execution: true,
        sender_wallet: senderProfile.wallet_address,
        recipient_wallet: recipientExists.wallet_address,
        net_amount: netAmount,
        ...(body.metadata || {})
      }
    }

    const { data: txResult, error: txError } = await supabaseAdmin
      .rpc('create_acp_transaction_atomic', {
        transaction_data: transactionData,
        service_id_param: body.service_id || null,
        agent_id_param: body.agent_id || null
      })

    if (txError || !txResult?.success) {
      console.error('CRITICAL: Atomic transaction failed:', txError || txResult?.error)
      return new Response(
        JSON.stringify({ 
          error: 'Transaction creation failed',
          message: 'Failed to create transaction record. Please contact support.',
          details: txError?.message || txResult?.error
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transaction = txResult.transaction

    console.log(`NON-CUSTODIAL: Transaction ${transaction.id} created, awaiting blockchain execution`)

    // Log operation for monitoring
    await supabaseAdmin.rpc('log_acp_operation', {
      user_id_param: user.id,
      operation_param: 'process_transaction',
      operation_type_param: 'create',
      resource_type_param: 'acp_transactions',
      resource_id_param: transaction.id,
      status_param: 'success',
      execution_time_ms_param: Date.now() - startTime
    })

    return new Response(
      JSON.stringify({
        success: true,
        transaction: transaction,
        platform_fee: platformFee,
        recipient_receives: body.amount - platformFee,
        blockchain_details: {
          sender_wallet: senderProfile.wallet_address,
          recipient_wallet: recipientExists.wallet_address,
          amount_to_send: netAmount,
          currency: currency,
          chain: 'base',
        },
        message: 'Transaction created. Please execute on blockchain and submit transaction hash.',
        requires_blockchain_confirmation: true
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
