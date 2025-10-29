import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tradeId, traderId } = await req.json()

    console.log('Processing copy trade:', { tradeId, traderId })

    // Get the original trade
    const { data: trade, error: tradeError } = await supabaseClient
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single()

    if (tradeError || !trade) {
      throw new Error('Trade not found')
    }

    // Get all active copy settings for this trader
    const { data: copySettings, error: settingsError } = await supabaseClient
      .from('copy_trading_settings')
      .select('*')
      .eq('trader_id', traderId)
      .eq('is_active', true)

    if (settingsError) {
      throw new Error('Failed to fetch copy settings')
    }

    console.log(`Found ${copySettings?.length || 0} followers`)

    const results = []

    for (const setting of copySettings || []) {
      try {
        // Check if agent should be copied
        if (setting.agents_to_exclude?.includes(trade.agent_id)) {
          console.log(`Skipping excluded agent for follower ${setting.follower_id}`)
          continue
        }

        if (setting.agents_to_copy && !setting.agents_to_copy.includes(trade.agent_id)) {
          console.log(`Agent not in copy list for follower ${setting.follower_id}`)
          continue
        }

        // Check if trade type should be copied
        if (!setting.copy_types?.includes(trade.side)) {
          console.log(`Trade type ${trade.side} not enabled for follower ${setting.follower_id}`)
          continue
        }

        // Calculate copy amount
        let copyAmount = (trade.quantity * setting.copy_percentage) / 100
        if (setting.max_amount_per_trade) {
          copyAmount = Math.min(copyAmount, setting.max_amount_per_trade)
        }

        // NON-CUSTODIAL: Get follower's wallet address for balance check
        const { data: followerProfile } = await supabaseClient
          .from('profiles')
          .select('wallet_address')
          .eq('user_id', setting.follower_id)
          .single()

        if (!followerProfile?.wallet_address) {
          console.log(`No wallet connected for follower ${setting.follower_id}`)
          continue
        }

        // NOTE: In production, you would query blockchain here to verify wallet balance
        // For now, we'll create a pending order that requires blockchain confirmation
        console.log(`Follower ${setting.follower_id} wallet: ${followerProfile.wallet_address}`)

        // Create copy order (pending blockchain execution)
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            user_id: setting.follower_id,
            agent_id: trade.agent_id,
            order_type: 'market',
            side: trade.side,
            amount: copyAmount,
            status: 'pending',
            order_source: 'copy_trade',
            parent_order_id: tradeId,
            stop_loss_price: setting.stop_loss_percentage 
              ? trade.price * (1 - setting.stop_loss_percentage / 100)
              : null,
            take_profit_price: setting.take_profit_percentage
              ? trade.price * (1 + setting.take_profit_percentage / 100)
              : null,
          })
          .select()
          .single()

        if (orderError) {
          console.error(`Failed to create order for follower ${setting.follower_id}:`, orderError)
          continue
        }

        // NON-CUSTODIAL: Order created, follower must execute on blockchain
        results.push({
          followerId: setting.follower_id,
          orderId: order.id,
          amount: copyAmount,
          success: true,
          requiresBlockchainExecution: true,
        })

        console.log(`Copy trade order created for follower ${setting.follower_id}, awaiting blockchain execution`)

      } catch (error) {
        console.error(`Error processing copy trade for follower ${setting.follower_id}:`, error)
        results.push({
          followerId: setting.follower_id,
          success: false,
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        totalFollowers: copySettings?.length || 0,
        successfulCopies: results.filter(r => r.success).length,
        message: 'Copy trade orders created. Followers must execute on blockchain.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Copy trading engine error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
