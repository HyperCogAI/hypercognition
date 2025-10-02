import { supabase } from '@/integrations/supabase/client';

export interface LiquidityPool {
  pair: string;
  liquidity: number;
  volume24h: number;
  apy: number;
  fees24h: number;
  chain: string;
}

export class LiquidityPoolService {
  /**
   * Get liquidity pools data from live DEXScreener API
   */
  static async getLiquidityPools(chain?: string, limit: number = 50): Promise<LiquidityPool[]> {
    try {
      console.log('[LiquidityPools] Fetching live liquidity pools from DEXScreener API...');
      
      // Use ai-agents-market edge function which includes DEXScreener data
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getTopAIAgents', limit, enrich: true }
      });

      if (error) {
        console.error('[LiquidityPools] Edge function error:', error);
        throw error;
      }

      // Transform AI agent data into liquidity pool format using only real DEX data
      const pools = (data || [])
        .filter((agent: any) => typeof agent.dex_liquidity === 'number' && typeof agent.dex_volume_24h === 'number')
        .map((agent: any) => ({
          pair: agent.dex_name ? String(agent.dex_name) : `${agent.symbol}/USDC`,
          liquidity: agent.dex_liquidity,
          volume24h: agent.dex_volume_24h,
          apy: 0, // No guessing — show 0 when unknown
          fees24h: agent.dex_volume_24h * 0.003, // 0.3% fee assumption
          chain: agent.dex_chain || agent.chain || 'Unknown'
        }));

      const filteredPools = chain 
        ? pools.filter(pool => pool.chain.toLowerCase() === chain.toLowerCase())
        : pools;

      console.log(`[LiquidityPools] Fetched ${filteredPools.length} pools from API`);
      return filteredPools.slice(0, limit);
    } catch (error) {
      console.error('Error fetching liquidity pools from API:', error);
      
      // Do not return mock data; surface empty to UI
      return [];
    }
  }

  /**
   * Get top liquidity pools by APY from live API data
   */
  static async getTopPoolsByAPY(limit: number = 10): Promise<LiquidityPool[]> {
    try {
      console.log('[LiquidityPools] Fetching top pools by APY from API...');
      
      const allPools = await this.getLiquidityPools(undefined, limit * 2);
      
      // Sort by APY (highest first)
      const sortedByAPY = allPools.sort((a, b) => b.apy - a.apy);
      
      console.log(`[LiquidityPools] Found ${sortedByAPY.length} pools, returning top ${limit} by APY`);
      return sortedByAPY.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top pools by APY from API:', error);
      
      // No mock fallback
      return [];
    }
  }
}
