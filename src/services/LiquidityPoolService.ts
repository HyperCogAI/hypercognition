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
   * Get liquidity pools data
   */
  static async getLiquidityPools(chain?: string, limit: number = 50): Promise<LiquidityPool[]> {
    try {
      let query = supabase
        .from('liquidity_pools')
        .select('*')
        .order('liquidity', { ascending: false })
        .limit(limit);

      if (chain) {
        query = query.eq('chain', chain);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map((pool: any) => ({
        pair: pool.pair,
        liquidity: pool.liquidity,
        volume24h: pool.volume_24h,
        apy: pool.apy,
        fees24h: pool.fees_24h,
        chain: pool.chain
      })) || [];
    } catch (error) {
      console.error('Error fetching liquidity pools:', error);
      return [];
    }
  }

  /**
   * Get top liquidity pools by APY
   */
  static async getTopPoolsByAPY(limit: number = 10): Promise<LiquidityPool[]> {
    try {
      const { data, error } = await supabase
        .from('liquidity_pools')
        .select('*')
        .order('apy', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((pool: any) => ({
        pair: pool.pair,
        liquidity: pool.liquidity,
        volume24h: pool.volume_24h,
        apy: pool.apy,
        fees24h: pool.fees_24h,
        chain: pool.chain
      })) || [];
    } catch (error) {
      console.error('Error fetching top pools by APY:', error);
      return [];
    }
  }
}
