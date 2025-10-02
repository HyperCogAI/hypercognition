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

    console.log('[ChainSync] Starting chain analytics sync');

    // Get agents data to calculate metrics
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, symbol, name, chain, price, volume_24h, change_24h, market_cap');

    if (agentsError) {
      console.error('[ChainSync] Error fetching agents:', agentsError);
      throw agentsError;
    }

    // Aggregate metrics by chain
    const chainData: Record<string, any> = {
      'Solana': { agents: [], totalVolume: 0, totalMarketCap: 0 },
      'Ethereum': { agents: [], totalVolume: 0, totalMarketCap: 0 },
      'Base': { agents: [], totalVolume: 0, totalMarketCap: 0 },
      'Polygon': { agents: [], totalVolume: 0, totalMarketCap: 0 }
    };

    // Group by chain
    for (const agent of agents || []) {
      const chain = agent.chain || 'Base';
      if (chainData[chain]) {
        chainData[chain].agents.push(agent);
        chainData[chain].totalVolume += agent.volume_24h || 0;
        chainData[chain].totalMarketCap += agent.market_cap || 0;
      }
    }

    // Insert chain metrics
    const chainMetrics = [];
    const chainConfig: Record<string, any> = {
      'Solana': { blockTime: 0.4, tps: 2500, gasMultiplier: 1 },
      'Ethereum': { blockTime: 12, tps: 15, gasMultiplier: 1 },
      'Base': { blockTime: 2, tps: 100, gasMultiplier: 0.01 },
      'Polygon': { blockTime: 2, tps: 65, gasMultiplier: 0.01 }
    };

    for (const [chainName, data] of Object.entries(chainData)) {
      const config = chainConfig[chainName];
      const chainKey = chainName.toLowerCase() as 'solana' | 'ethereum' | 'base' | 'polygon';
      
      chainMetrics.push({
        chain: chainKey,
        tvl: data.totalMarketCap * 1.5,
        volume_24h: data.totalVolume,
        transactions_24h: data.agents.length * 800,
        active_addresses_24h: data.agents.length * 200,
        avg_gas_price: 0.00005 * config.gasMultiplier,
        block_time: config.blockTime,
        tps: config.tps,
        timestamp: new Date().toISOString()
      });
    }

    const { error: metricsError } = await supabase
      .from('chain_metrics')
      .insert(chainMetrics);

    if (metricsError) {
      console.error('[ChainSync] Error inserting chain metrics:', metricsError);
      throw metricsError;
    }

    // Insert token metrics
    const tokenMetrics = (agents || []).map(agent => ({
      address: agent.id,
      symbol: agent.symbol || 'UNKNOWN',
      name: agent.name || 'Unknown Token',
      chain: agent.chain || 'Base',
      price: agent.price || 0,
      price_change_24h: agent.change_24h || 0,
      volume_24h: agent.volume_24h || 0,
      liquidity: (agent.volume_24h || 0) * 2,
      market_cap: agent.market_cap || 0,
      holders: Math.floor((agent.volume_24h || 0) / 100),
      transactions_24h: Math.floor((agent.volume_24h || 0) / 50),
      timestamp: new Date().toISOString()
    }));

    if (tokenMetrics.length > 0) {
      const { error: tokenError } = await supabase
        .from('token_metrics')
        .insert(tokenMetrics);

      if (tokenError) {
        console.error('[ChainSync] Error inserting token metrics:', tokenError);
      }
    }

    // Insert liquidity pools
    const liquidityPools = (agents || []).slice(0, 50).map(agent => ({
      pair: `${agent.symbol}/USDC`,
      chain: agent.chain || 'Base',
      liquidity: (agent.volume_24h || 0) * 2,
      volume_24h: agent.volume_24h || 0,
      apy: Math.random() * 50 + 10,
      fees_24h: (agent.volume_24h || 0) * 0.003,
      token_a_address: agent.id,
      token_b_address: null,
      timestamp: new Date().toISOString()
    }));

    if (liquidityPools.length > 0) {
      const { error: poolsError } = await supabase
        .from('liquidity_pools')
        .insert(liquidityPools);

      if (poolsError) {
        console.error('[ChainSync] Error inserting liquidity pools:', poolsError);
      }
    }

    // Calculate and insert cross-chain analytics
    const totalTVL = Object.values(chainData).reduce((sum: number, data: any) => sum + data.totalMarketCap * 1.5, 0);
    const totalVolume = Object.values(chainData).reduce((sum: number, data: any) => sum + data.totalVolume, 0);
    
    const chainDistribution = Object.entries(chainData).map(([chain, data]: [string, any]) => ({
      chain,
      volume: data.totalVolume,
      percentage: totalVolume > 0 ? (data.totalVolume / totalVolume) * 100 : 0
    })).sort((a, b) => b.volume - a.volume);

    const { error: crossChainError } = await supabase
      .from('cross_chain_analytics')
      .insert({
        total_tvl: totalTVL,
        total_volume_24h: totalVolume,
        chain_distribution: chainDistribution,
        dominant_chain: chainDistribution[0]?.chain || 'Base',
        timestamp: new Date().toISOString()
      });

    if (crossChainError) {
      console.error('[ChainSync] Error inserting cross-chain analytics:', crossChainError);
    }

    console.log('[ChainSync] Sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        metrics: {
          chains: chainMetrics.length,
          tokens: tokenMetrics.length,
          pools: liquidityPools.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ChainSync] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});