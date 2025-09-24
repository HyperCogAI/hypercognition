import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CopyTradeRequest {
  originalOrderId: string;
  traderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { originalOrderId, traderId } = await req.json() as CopyTradeRequest;
    
    console.log('Processing copy trade for order:', originalOrderId, 'trader:', traderId);

    // Get the original order details
    const { data: originalOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', originalOrderId)
      .eq('user_id', traderId)
      .single();

    if (orderError || !originalOrder) {
      console.error('Original order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Original order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only process filled orders
    if (originalOrder.status !== 'filled') {
      console.log('Order not filled yet, skipping copy trade');
      return new Response(
        JSON.stringify({ message: 'Order not filled, no copy trades executed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all active copy trading settings for this trader
    const { data: copySettings, error: settingsError } = await supabase
      .from('copy_trading_settings')
      .select('*')
      .eq('trader_id', traderId)
      .eq('is_active', true);

    if (settingsError) {
      console.error('Error fetching copy settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch copy settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!copySettings || copySettings.length === 0) {
      console.log('No active copy trading settings found for trader:', traderId);
      return new Response(
        JSON.stringify({ message: 'No active copy trading settings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const copyTradesExecuted = [];

    // Process each copy trading setting
    for (const setting of copySettings) {
      try {
        // Check if this trade type should be copied
        if (!setting.copy_types.includes(originalOrder.side)) {
          console.log(`Skipping copy trade - ${originalOrder.side} not in copy types for follower:`, setting.follower_id);
          continue;
        }

        // Check if this agent should be copied (if restrictions exist)
        if (setting.agents_to_copy && setting.agents_to_copy.length > 0) {
          if (!setting.agents_to_copy.includes(originalOrder.agent_id)) {
            console.log('Skipping copy trade - agent not in copy list for follower:', setting.follower_id);
            continue;
          }
        }

        // Check if this agent should be excluded
        if (setting.agents_to_exclude && setting.agents_to_exclude.includes(originalOrder.agent_id)) {
          console.log('Skipping copy trade - agent in exclude list for follower:', setting.follower_id);
          continue;
        }

        // Calculate copy trade amount
        const copyAmount = (originalOrder.filled_amount * setting.copy_percentage) / 100;
        
        // Check max amount per trade limit
        if (setting.max_amount_per_trade && copyAmount > setting.max_amount_per_trade) {
          console.log('Copy trade amount exceeds max limit for follower:', setting.follower_id);
          continue;
        }

        // Calculate stop loss and take profit prices if configured
        let stopLossPrice = null;
        let takeProfitPrice = null;

        if (setting.stop_loss_percentage) {
          const stopLossMultiplier = originalOrder.side === 'buy' 
            ? (1 - setting.stop_loss_percentage / 100)
            : (1 + setting.stop_loss_percentage / 100);
          stopLossPrice = originalOrder.price * stopLossMultiplier;
        }

        if (setting.take_profit_percentage) {
          const takeProfitMultiplier = originalOrder.side === 'buy'
            ? (1 + setting.take_profit_percentage / 100)
            : (1 - setting.take_profit_percentage / 100);
          takeProfitPrice = originalOrder.price * takeProfitMultiplier;
        }

        // Create the copy trade order
        const copyOrder = {
          user_id: setting.follower_id,
          agent_id: originalOrder.agent_id,
          type: originalOrder.type,
          side: originalOrder.side,
          amount: copyAmount,
          price: originalOrder.price,
          stop_loss_price: stopLossPrice,
          take_profit_price: takeProfitPrice,
          order_source: 'copy_trade',
          parent_order_id: originalOrderId,
          status: 'filled', // Simulate immediate execution for demo
          filled_amount: copyAmount,
          time_in_force: originalOrder.time_in_force
        };

        const { data: newOrder, error: orderCreationError } = await supabase
          .from('orders')
          .insert(copyOrder)
          .select()
          .single();

        if (orderCreationError) {
          console.error('Error creating copy order for follower:', setting.follower_id, orderCreationError);
          continue;
        }

        console.log('Copy trade executed successfully for follower:', setting.follower_id);
        copyTradesExecuted.push({
          followerId: setting.follower_id,
          orderId: newOrder.id,
          amount: copyAmount,
          price: originalOrder.price
        });

        // Create notification for the follower
        await supabase
          .from('notifications')
          .insert({
            user_id: setting.follower_id,
            type: 'copy_trade_executed',
            category: 'trading',
            priority: 'high',
            title: 'Copy Trade Executed',
            message: `Copy trade executed: ${originalOrder.side} ${copyAmount} of ${originalOrder.agent_id} at $${originalOrder.price}`,
            action_url: `/social-trading`,
            data: {
              original_order_id: originalOrderId,
              copy_order_id: newOrder.id,
              trader_id: traderId,
              amount: copyAmount,
              price: originalOrder.price
            }
          });

      } catch (error) {
        console.error('Error processing copy trade for follower:', setting.follower_id, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Copy trading processing completed',
        copyTradesExecuted: copyTradesExecuted.length,
        details: copyTradesExecuted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in copy trading engine:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});