import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  agent_id: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  time_in_force?: 'GTC' | 'IOC' | 'FOK' | 'DAY';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderData: OrderRequest = await req.json();
    console.log('Processing order:', { user_id: user.id, ...orderData });

    // Validate required fields
    if (!orderData.agent_id || !orderData.type || !orderData.side || !orderData.amount) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: agent_id, type, side, amount' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For market orders, get current price. For limit orders, use provided price.
    let execution_price = orderData.price || 0;
    
    if (orderData.type === 'market') {
      const { data: agent, error: agentError } = await supabaseClient
        .from('agents')
        .select('price')
        .eq('id', orderData.agent_id)
        .single();

      if (agentError || !agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      execution_price = parseFloat(agent.price);
    }

    // Calculate total amount and fees
    const total_amount = orderData.amount * execution_price;
    const fee_rate = 0.001; // 0.1% fee
    const fees = total_amount * fee_rate;
    const net_amount = orderData.side === 'buy' ? total_amount + fees : total_amount - fees;

    // Check user balance for buy orders
    if (orderData.side === 'buy') {
      const { data: balance } = await supabaseClient
        .from('user_balances')
        .select('available_balance')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .single();

      if (!balance || balance.available_balance < net_amount) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient balance',
          required: net_amount,
          available: balance?.available_balance || 0
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // For sell orders, check if user has sufficient holdings
    if (orderData.side === 'sell') {
      const { data: holding } = await supabaseClient
        .from('user_holdings')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('agent_id', orderData.agent_id)
        .single();

      if (!holding || holding.quantity < orderData.amount) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient holdings',
          required: orderData.amount,
          available: holding?.quantity || 0
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        agent_id: orderData.agent_id,
        type: orderData.type,
        side: orderData.side,
        amount: orderData.amount,
        price: orderData.price,
        status: 'filled', // For demo, we'll instantly fill orders
        filled_amount: orderData.amount,
        average_fill_price: execution_price,
        fees: fees,
        time_in_force: orderData.time_in_force || 'GTC'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order created:', order.id);

    // Execute the trade by updating balances and holdings
    await executeTradeSettlement(supabaseClient, user.id, order, orderData, execution_price, fees);

    return new Response(JSON.stringify({ 
      success: true, 
      order: order,
      execution_price,
      fees,
      net_amount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Process order error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeTradeSettlement(
  supabaseClient: any,
  user_id: string,
  order: any,
  orderData: OrderRequest,
  execution_price: number,
  fees: number
) {
  const total_amount = orderData.amount * execution_price;

  try {
    if (orderData.side === 'buy') {
      // Update user balance (subtract payment + fees)
      await supabaseClient
        .from('user_balances')
        .update({ 
          available_balance: supabaseClient.raw(`available_balance - ${total_amount + fees}`)
        })
        .eq('user_id', user_id)
        .eq('currency', 'USD');

      // Update or create holdings
      const { data: existingHolding } = await supabaseClient
        .from('user_holdings')
        .select('*')
        .eq('user_id', user_id)
        .eq('agent_id', orderData.agent_id)
        .single();

      if (existingHolding) {
        // Update existing holding with weighted average price
        const new_quantity = existingHolding.quantity + orderData.amount;
        const new_total_invested = existingHolding.total_invested + total_amount;
        const new_average_price = new_total_invested / new_quantity;

        await supabaseClient
          .from('user_holdings')
          .update({
            quantity: new_quantity,
            average_buy_price: new_average_price,
            total_invested: new_total_invested
          })
          .eq('id', existingHolding.id);
      } else {
        // Create new holding
        await supabaseClient
          .from('user_holdings')
          .insert({
            user_id: user_id,
            agent_id: orderData.agent_id,
            quantity: orderData.amount,
            average_buy_price: execution_price,
            total_invested: total_amount
          });
      }

    } else { // sell
      // Update user balance (add proceeds - fees)
      await supabaseClient
        .from('user_balances')
        .update({ 
          available_balance: supabaseClient.raw(`available_balance + ${total_amount - fees}`)
        })
        .eq('user_id', user_id)
        .eq('currency', 'USD');

      // Update holdings
      const { data: holding } = await supabaseClient
        .from('user_holdings')
        .select('*')
        .eq('user_id', user_id)
        .eq('agent_id', orderData.agent_id)
        .single();

      if (holding) {
        const new_quantity = holding.quantity - orderData.amount;
        const realized_pnl = (execution_price - holding.average_buy_price) * orderData.amount;
        
        if (new_quantity <= 0) {
          // Delete holding if quantity becomes zero or negative
          await supabaseClient
            .from('user_holdings')
            .delete()
            .eq('id', holding.id);
        } else {
          // Update holding
          const remaining_invested = holding.total_invested * (new_quantity / holding.quantity);
          
          await supabaseClient
            .from('user_holdings')
            .update({
              quantity: new_quantity,
              total_invested: remaining_invested,
              realized_pnl: holding.realized_pnl + realized_pnl
            })
            .eq('id', holding.id);
        }
      }
    }

    // Create transaction record
    await supabaseClient
      .from('transactions')
      .insert({
        user_id: user_id,
        agent_id: orderData.agent_id,
        order_id: order.id,
        type: orderData.side,
        quantity: orderData.amount,
        price: execution_price,
        total_amount: total_amount,
        fees: fees,
        status: 'completed',
        metadata: {
          order_type: orderData.type,
          time_in_force: orderData.time_in_force
        }
      });

    console.log('Trade settlement completed for order:', order.id);

  } catch (error) {
    console.error('Trade settlement error:', error);
    throw new Error('Failed to settle trade: ' + error.message);
  }
}