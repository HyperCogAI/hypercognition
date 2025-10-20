import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRefundRequest {
  transaction_id: string
  refund_amount?: number
  refund_reason: string
  dispute_id?: string
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

    const body: ProcessRefundRequest = await req.json()

    // Get transaction details
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('acp_transactions')
      .select('*')
      .eq('id', body.transaction_id)
      .single()

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is involved in transaction
    if (user.id !== transaction.from_user_id && user.id !== transaction.to_user_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to request refund for this transaction' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine refund amount (full or partial)
    const refundAmount = body.refund_amount || transaction.amount

    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > transaction.amount) {
      return new Response(
        JSON.stringify({ error: 'Invalid refund amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check auto-approval eligibility
    const { data: autoApprovalCheck } = await supabaseAdmin
      .rpc('check_auto_refund_eligibility', {
        transaction_id_param: body.transaction_id
      })

    const autoApproved = autoApprovalCheck?.eligible || false

    // Create refund record
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('acp_refunds')
      .insert({
        transaction_id: body.transaction_id,
        dispute_id: body.dispute_id || null,
        requested_by: user.id,
        refund_amount: refundAmount,
        refund_reason: body.refund_reason,
        status: autoApproved ? 'approved' : 'pending',
        auto_approved: autoApproved,
        approved_by: autoApproved ? user.id : null
      })
      .select()
      .single()

    if (refundError) {
      console.error('Refund creation error:', refundError)
      return new Response(
        JSON.stringify({ error: 'Failed to create refund request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If auto-approved, process refund immediately
    if (autoApproved) {
      // Process wallet refund
      const { data: walletResult, error: walletError } = await supabaseAdmin
        .rpc('process_wallet_transaction', {
          from_user_id: transaction.to_user_id,
          to_user_id: transaction.from_user_id,
          amount_param: refundAmount,
          currency_param: transaction.currency,
          transaction_id_param: refund.id
        })

      if (walletError || !walletResult?.success) {
        // Mark refund as failed
        await supabaseAdmin
          .from('acp_refunds')
          .update({ status: 'failed' })
          .eq('id', refund.id)

        return new Response(
          JSON.stringify({ 
            error: 'Refund approved but processing failed',
            refund_id: refund.id
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update refund as processed
      await supabaseAdmin
        .from('acp_refunds')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', refund.id)

      // Create notification
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: transaction.from_user_id,
          type: 'refund_processed',
          category: 'transactions',
          priority: 'high',
          title: 'Refund Processed',
          message: `Your refund of ${refundAmount} ${transaction.currency} has been processed`,
          action_url: `/transactions/${transaction.id}`,
          data: {
            refund_id: refund.id,
            transaction_id: transaction.id,
            amount: refundAmount,
            currency: transaction.currency
          }
        })
    } else {
      // Create notification for admin review
      await supabaseAdmin
        .from('compliance_alerts')
        .insert({
          alert_type: 'refund_review_required',
          severity: 'medium',
          title: 'Refund Request Requires Review',
          description: `Refund request for ${refundAmount} ${transaction.currency} requires manual review`,
          metadata: {
            refund_id: refund.id,
            transaction_id: transaction.id,
            requested_by: user.id
          }
        })
    }

    console.log(`Refund ${autoApproved ? 'processed' : 'requested'}: ${refund.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        refund: refund,
        auto_approved: autoApproved,
        message: autoApproved 
          ? 'Refund processed successfully'
          : 'Refund request submitted for review'
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
