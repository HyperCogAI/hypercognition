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

    const { operation, programId, amount, stakeId } = await req.json();

    console.log(`Staking operation: ${operation} for user ${user.id}`);

    switch (operation) {
      case 'stake': {
        const { data: program, error: programError } = await supabase
          .from('staking_programs')
          .select('*')
          .eq('id', programId)
          .eq('is_active', true)
          .single();

        if (programError || !program) {
          throw new Error('Staking program not found');
        }

        if (amount < program.min_stake) {
          throw new Error(`Minimum stake is ${program.min_stake}`);
        }

        // Create stake
        const { error: insertError } = await supabase
          .from('user_stakes')
          .insert({
            user_id: user.id,
            program_id: programId,
            amount_staked: amount,
            rewards_earned: 0,
            is_active: true,
            staked_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        console.log(`Staked ${amount} ${program.token_symbol}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Tokens staked successfully',
            amount,
            token: program.token_symbol
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unstake': {
        const { data: stake, error: stakeError } = await supabase
          .from('user_stakes')
          .select('*, staking_programs(*)')
          .eq('id', stakeId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (stakeError || !stake) {
          throw new Error('Stake not found');
        }

        // Check lock period
        const stakedAt = new Date(stake.staked_at);
        const now = new Date();
        const daysSinceStake = (now.getTime() - stakedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceStake < stake.staking_programs.lock_period_days) {
          throw new Error(`Lock period not met. You can unstake after ${stake.staking_programs.lock_period_days} days`);
        }

        // Deactivate stake
        const { error: updateError } = await supabase
          .from('user_stakes')
          .update({
            is_active: false,
            unstaked_at: new Date().toISOString(),
          })
          .eq('id', stakeId);

        if (updateError) throw updateError;

        console.log(`Unstaked ${stake.amount_staked} ${stake.staking_programs.token_symbol}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Tokens unstaked successfully',
            amount: stake.amount_staked,
            rewards: stake.rewards_earned
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'claim_rewards': {
        const { data: stake, error: stakeError } = await supabase
          .from('user_stakes')
          .select('*, staking_programs(*)')
          .eq('id', stakeId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (stakeError || !stake) {
          throw new Error('Stake not found');
        }

        if (stake.rewards_earned <= 0) {
          throw new Error('No rewards to claim');
        }

        const rewardsClaimed = stake.rewards_earned;

        // Reset rewards
        const { error: updateError } = await supabase
          .from('user_stakes')
          .update({
            rewards_earned: 0,
            last_reward_claim_at: new Date().toISOString(),
          })
          .eq('id', stakeId);

        if (updateError) throw updateError;

        console.log(`Claimed ${rewardsClaimed} ${stake.staking_programs.rewards_token}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Rewards claimed successfully',
            rewards: rewardsClaimed,
            token: stake.staking_programs.rewards_token
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('Staking operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
