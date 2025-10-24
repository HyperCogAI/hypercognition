import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      tx_hash,
      chain,
      contract_address,
      from_address,
      to_address,
      amount,
      token_address,
      escrow_id,
      acp_transaction_id,
    } = await req.json()

    if (!tx_hash || !contract_address || !from_address || !to_address || !amount || !token_address) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Record blockchain transaction
    const { data: blockchainTx, error: txError } = await supabaseClient
      .from('blockchain_transactions')
      .insert({
        user_id: user.id,
        tx_hash,
        chain: chain || 'base',
        contract_address,
        from_address,
        to_address,
        amount,
        token_address,
        status: 'pending',
      })
      .select()
      .single()

    if (txError) throw txError

    // Link to ACP transaction if provided
    if (acp_transaction_id) {
      const { error: updateError } = await supabaseClient
        .from('acp_transactions')
        .update({
          blockchain_tx_id: blockchainTx.id,
          escrow_id,
          is_blockchain: true,
        })
        .eq('id', acp_transaction_id)

      if (updateError) {
        console.error('Error linking to ACP transaction:', updateError)
        // Don't throw - blockchain transaction was still recorded
      }
    }

    return new Response(JSON.stringify({ success: true, transaction: blockchainTx }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in record-blockchain-transaction:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
