import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { orderId, action, txHash, blockchainVerified } = await req.json()
    console.log(`[ProcessOrder] User ${user.id} - Action: ${action}, Order: ${orderId}`)

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'execute') {
      // NON-CUSTODIAL: Require blockchain transaction verification
      if (!txHash || !blockchainVerified) {
        return new Response(JSON.stringify({ 
          error: 'Blockchain verification required',
          message: 'All trades must be executed on-chain with verified transaction hash'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: agent } = await supabaseClient
        .from('agents')
        .select('name, symbol, price')
        .eq('id', order.agent_id)
        .single()

      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const executionPrice = order.type === 'market' ? agent.price : (order.price || 0)

      // Update order as filled
      await supabaseClient
        .from('orders')
        .update({
          status: 'filled',
          filled_amount: order.amount,
          average_fill_price: executionPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      // Create trade record
      const { data: trade } = await supabaseClient
        .from('trades')
        .insert({
          user_id: user.id,
          order_id: orderId,
          agent_id: order.agent_id,
          side: order.side,
          quantity: order.amount,
          price: executionPrice,
          total_amount: order.amount * executionPrice,
          fees: order.fees || 0
        })
        .select()
        .single()

      // Update portfolio holdings
      if (order.side === 'buy') {
        const { data: existing } = await supabaseClient
          .from('portfolio_holdings')
          .select('*')
          .eq('user_id', user.id)
          .eq('asset_id', order.agent_id)
          .eq('asset_type', 'agent')
          .maybeSingle()

        if (existing) {
          const newQuantity = parseFloat(existing.quantity) + order.amount
          const newTotalInvested = parseFloat(existing.total_invested) + (order.amount * executionPrice) + (order.fees || 0)
          const newAverageBuyPrice = newTotalInvested / newQuantity

          await supabaseClient
            .from('portfolio_holdings')
            .update({
              quantity: newQuantity,
              average_buy_price: newAverageBuyPrice,
              total_invested: newTotalInvested,
              current_value: newQuantity * executionPrice,
              last_updated: new Date().toISOString()
            })
            .eq('id', existing.id)
        } else {
          await supabaseClient
            .from('portfolio_holdings')
            .insert({
              user_id: user.id,
              asset_id: order.agent_id,
              asset_type: 'agent',
              asset_name: agent.name,
              asset_symbol: agent.symbol,
              quantity: order.amount,
              average_buy_price: executionPrice,
              total_invested: (order.amount * executionPrice) + (order.fees || 0),
              current_value: order.amount * executionPrice,
              unrealized_pnl: 0,
              realized_pnl: 0
            })
        }
      } else {
        // Sell side
        const { data: holding } = await supabaseClient
          .from('portfolio_holdings')
          .select('*')
          .eq('user_id', user.id)
          .eq('asset_id', order.agent_id)
          .eq('asset_type', 'agent')
          .maybeSingle()

        if (holding && parseFloat(holding.quantity) >= order.amount) {
          const newQuantity = parseFloat(holding.quantity) - order.amount
          const proportionSold = order.amount / parseFloat(holding.quantity)
          const costBasis = parseFloat(holding.total_invested) * proportionSold
          const saleProceeds = (order.amount * executionPrice) - (order.fees || 0)
          const realizedPnl = saleProceeds - costBasis

          if (newQuantity === 0) {
            await supabaseClient
              .from('portfolio_holdings')
              .delete()
              .eq('id', holding.id)
          } else {
            await supabaseClient
              .from('portfolio_holdings')
              .update({
                quantity: newQuantity,
                total_invested: parseFloat(holding.total_invested) - costBasis,
                realized_pnl: parseFloat(holding.realized_pnl) + realizedPnl,
                current_value: newQuantity * executionPrice,
                last_updated: new Date().toISOString()
              })
              .eq('id', holding.id)
          }
        }
      }

      // Record blockchain transaction
      await supabaseClient
        .from('blockchain_transactions')
        .insert({
          user_id: user.id,
          tx_hash: txHash,
          chain: 'base',
          status: 'confirmed',
          metadata: {
            order_id: orderId,
            trade_id: trade?.id,
            agent_id: order.agent_id,
            side: order.side,
            amount: order.amount,
            price: executionPrice
          }
        })

      // Create notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'order_filled',
          category: 'trading',
          priority: 'medium',
          title: 'Order Filled',
          message: `Your ${order.side} order for ${order.amount} units has been filled at $${executionPrice.toFixed(4)}`,
          data: { order_id: orderId, trade_id: trade?.id, tx_hash: txHash }
        })

      console.log(`[ProcessOrder] Order ${orderId} executed successfully with tx ${txHash}`)

      return new Response(JSON.stringify({ 
        success: true, 
        order: { ...order, status: 'filled' },
        trade,
        tx_hash: txHash
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (action === 'cancel') {
      await supabaseClient
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      console.log(`[ProcessOrder] Order ${orderId} cancelled`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ProcessOrder] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
