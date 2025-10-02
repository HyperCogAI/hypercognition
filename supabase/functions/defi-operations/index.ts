import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { operation, poolId, amount, positionId } = await req.json();

    console.log(`DeFi operation: ${operation} for user ${user.id}`);

    switch (operation) {
      case 'deposit': {
        // Get pool details
        const { data: pool, error: poolError } = await supabase
          .from('defi_pools')
          .select('*')
          .eq('id', poolId)
          .single();

        if (poolError || !pool) {
          throw new Error('Pool not found');
        }

        // Check if user already has a position
        const { data: existingPosition } = await supabase
          .from('user_defi_positions')
          .select('*')
          .eq('user_id', user.id)
          .eq('pool_id', poolId)
          .single();

        if (existingPosition) {
          // Update existing position
          const newAmount = existingPosition.amount_deposited + amount;
          const newShares = existingPosition.shares + amount; // Simplified 1:1 ratio

          const { error: updateError } = await supabase
            .from('user_defi_positions')
            .update({
              amount_deposited: newAmount,
              shares: newShares,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingPosition.id);

          if (updateError) throw updateError;
        } else {
          // Create new position
          const { error: insertError } = await supabase
            .from('user_defi_positions')
            .insert({
              user_id: user.id,
              pool_id: poolId,
              amount_deposited: amount,
              shares: amount, // Simplified 1:1 ratio
              rewards_earned: 0,
            });

          if (insertError) throw insertError;
        }

        // Update pool TVL
        const { error: tvlError } = await supabase
          .from('defi_pools')
          .update({
            tvl: pool.tvl + amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', poolId);

        if (tvlError) throw tvlError;

        console.log(`Deposited ${amount} to pool ${poolId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Deposit successful',
            amount 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'withdraw': {
        const { data: position, error: posError } = await supabase
          .from('user_defi_positions')
          .select('*, defi_pools(*)')
          .eq('id', positionId)
          .eq('user_id', user.id)
          .single();

        if (posError || !position) {
          throw new Error('Position not found');
        }

        if (amount > position.amount_deposited) {
          throw new Error('Insufficient balance');
        }

        const remainingAmount = position.amount_deposited - amount;
        const remainingShares = (remainingAmount / position.amount_deposited) * position.shares;

        if (remainingAmount === 0) {
          // Delete position if fully withdrawn
          const { error: deleteError } = await supabase
            .from('user_defi_positions')
            .delete()
            .eq('id', positionId);

          if (deleteError) throw deleteError;
        } else {
          // Update position
          const { error: updateError } = await supabase
            .from('user_defi_positions')
            .update({
              amount_deposited: remainingAmount,
              shares: remainingShares,
              updated_at: new Date().toISOString(),
            })
            .eq('id', positionId);

          if (updateError) throw updateError;
        }

        // Update pool TVL
        const { error: tvlError } = await supabase
          .from('defi_pools')
          .update({
            tvl: Math.max(0, (position.defi_pools?.tvl || 0) - amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', position.pool_id);

        if (tvlError) throw tvlError;

        console.log(`Withdrawn ${amount} from position ${positionId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Withdrawal successful',
            amount 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'claim': {
        const { data: position, error: posError } = await supabase
          .from('user_defi_positions')
          .select('*')
          .eq('id', positionId)
          .eq('user_id', user.id)
          .single();

        if (posError || !position) {
          throw new Error('Position not found');
        }

        if (position.rewards_earned <= 0) {
          throw new Error('No rewards to claim');
        }

        const rewardsClaimed = position.rewards_earned;

        // Reset rewards
        const { error: updateError } = await supabase
          .from('user_defi_positions')
          .update({
            rewards_earned: 0,
            last_claim_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', positionId);

        if (updateError) throw updateError;

        console.log(`Claimed ${rewardsClaimed} rewards from position ${positionId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Rewards claimed successfully',
            rewards: rewardsClaimed 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('DeFi operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
