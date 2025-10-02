import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoingeckoPrice {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting DeFi pool sync...');

    // Fetch market data from CoinGecko
    const coingeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false'
    );

    if (!coingeckoResponse.ok) {
      throw new Error('Failed to fetch CoinGecko data');
    }

    const cryptoData: CoingeckoPrice[] = await coingeckoResponse.json();

    // Update existing pools or create new ones
    let poolsUpdated = 0;
    let poolsCreated = 0;

    for (let i = 0; i < cryptoData.length && i < 10; i++) {
      const crypto = cryptoData[i];
      const pairIndex = (i + 1) % cryptoData.length;
      const pair = cryptoData[pairIndex];

      const poolName = `${crypto.id.toUpperCase()}/${pair.id.toUpperCase()}`;
      
      // Calculate dynamic APY based on market conditions
      const volatility = Math.random() * 0.3 + 0.05; // 5-35% base
      const volumeFactor = Math.min(crypto.total_volume / 1000000000, 2); // Max 2x multiplier
      const apy = (15 + Math.random() * 35) * (1 + volatility) * (1 + volumeFactor * 0.5);

      // Check if pool exists
      const { data: existingPool } = await supabase
        .from('defi_pools')
        .select('id, tvl')
        .eq('name', poolName)
        .single();

      if (existingPool) {
        // Update existing pool
        const tvlFluctuation = (Math.random() - 0.5) * 0.1; // ±5% change
        const newTvl = existingPool.tvl * (1 + tvlFluctuation);

        const { error: updateError } = await supabase
          .from('defi_pools')
          .update({
            apy: Number(apy.toFixed(2)),
            tvl: Math.round(newTvl),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPool.id);

        if (updateError) {
          console.error(`Error updating pool ${poolName}:`, updateError);
        } else {
          poolsUpdated++;
        }
      } else {
        // Create new pool
        const poolType = i % 2 === 0 ? 'yield_farming' : 'liquidity_mining';
        const tvl = Math.round(crypto.total_volume * 0.001 + Math.random() * 5000000);

        const { error: insertError } = await supabase
          .from('defi_pools')
          .insert({
            name: poolName,
            type: poolType,
            base_token: crypto.id.toUpperCase(),
            quote_token: pair.id.toUpperCase(),
            rewards_token: crypto.id.toUpperCase(),
            apy: Number(apy.toFixed(2)),
            tvl,
            is_active: true,
          });

        if (insertError) {
          console.error(`Error creating pool ${poolName}:`, insertError);
        } else {
          poolsCreated++;
        }
      }
    }

    console.log(`Pool sync complete: ${poolsCreated} created, ${poolsUpdated} updated`);

    // Update staking programs APY
    const { data: programs } = await supabase
      .from('staking_programs')
      .select('*')
      .eq('is_active', true);

    let programsUpdated = 0;

    for (const program of programs || []) {
      // Dynamic APY adjustment based on market conditions
      const marketFactor = cryptoData.find(c => c.id === program.token_symbol.toLowerCase());
      const baseApy = program.apy;
      const volatilityBonus = marketFactor ? (marketFactor.total_volume / 1000000000) * 5 : 0;
      const newApy = Math.max(5, Math.min(150, baseApy + volatilityBonus + (Math.random() - 0.5) * 10));

      const { error: updateError } = await supabase
        .from('staking_programs')
        .update({
          apy: Number(newApy.toFixed(2)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (!updateError) {
        programsUpdated++;
      }
    }

    console.log(`Updated APY for ${programsUpdated} staking programs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        poolsCreated,
        poolsUpdated,
        programsUpdated,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Pool sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
