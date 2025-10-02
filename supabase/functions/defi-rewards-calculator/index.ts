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

    console.log('Starting DeFi rewards calculation...');

    // Calculate rewards for DeFi positions
    const { data: positions, error: posError } = await supabase
      .from('user_defi_positions')
      .select('*, defi_pools(*)');

    if (posError) {
      throw new Error(`Failed to fetch positions: ${posError.message}`);
    }

    let positionsUpdated = 0;

    for (const position of positions || []) {
      if (!position.defi_pools) continue;

      const pool = position.defi_pools;
      const hoursHeld = (Date.now() - new Date(position.created_at).getTime()) / (1000 * 60 * 60);
      const apy = pool.apy / 100; // Convert to decimal
      
      // Calculate rewards: (amount * APY * hours) / (365 * 24)
      const newRewards = (position.amount_deposited * apy * hoursHeld) / (365 * 24);
      const totalRewards = position.rewards_earned + newRewards;

      const { error: updateError } = await supabase
        .from('user_defi_positions')
        .update({
          rewards_earned: totalRewards,
          updated_at: new Date().toISOString(),
        })
        .eq('id', position.id);

      if (updateError) {
        console.error(`Error updating position ${position.id}:`, updateError);
      } else {
        positionsUpdated++;
      }
    }

    console.log(`Updated rewards for ${positionsUpdated} DeFi positions`);

    // Calculate rewards for staking positions
    const { data: stakes, error: stakesError } = await supabase
      .from('user_stakes')
      .select('*, staking_programs(*)')
      .eq('is_active', true);

    if (stakesError) {
      throw new Error(`Failed to fetch stakes: ${stakesError.message}`);
    }

    let stakesUpdated = 0;

    for (const stake of stakes || []) {
      if (!stake.staking_programs) continue;

      const program = stake.staking_programs;
      const hoursStaked = (Date.now() - new Date(stake.staked_at).getTime()) / (1000 * 60 * 60);
      const apy = program.apy / 100;
      
      // Calculate staking rewards
      const newRewards = (stake.amount_staked * apy * hoursStaked) / (365 * 24);
      const totalRewards = stake.rewards_earned + newRewards;

      const { error: updateError } = await supabase
        .from('user_stakes')
        .update({
          rewards_earned: totalRewards,
        })
        .eq('id', stake.id);

      if (updateError) {
        console.error(`Error updating stake ${stake.id}:`, updateError);
      } else {
        stakesUpdated++;
      }
    }

    console.log(`Updated rewards for ${stakesUpdated} stakes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        positionsUpdated,
        stakesUpdated,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rewards calculation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
