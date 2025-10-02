import { supabase } from '@/integrations/supabase/client';

export interface TokenMetrics {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  chain: string;
}

export class TokenMetricsService {
  /**
   * Get top tokens by volume across all chains
   */
  static async getTopTokensByVolume(limit: number = 20): Promise<TokenMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('token_metrics')
        .select('*')
        .order('volume_24h', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((token: any) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        price: token.price,
        priceChange24h: token.price_change_24h,
        volume24h: token.volume_24h,
        liquidity: token.liquidity,
        marketCap: token.market_cap,
        holders: token.holders,
        transactions24h: token.transactions_24h,
        chain: token.chain
      })) || [];
    } catch (error) {
      console.error('Error fetching top tokens:', error);
      return [];
    }
  }

  /**
   * Get tokens by specific chain
   */
  static async getTokensByChain(chain: string, limit: number = 20): Promise<TokenMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('token_metrics')
        .select('*')
        .eq('chain', chain)
        .order('volume_24h', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((token: any) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        price: token.price,
        priceChange24h: token.price_change_24h,
        volume24h: token.volume_24h,
        liquidity: token.liquidity,
        marketCap: token.market_cap,
        holders: token.holders,
        transactions24h: token.transactions_24h,
        chain: token.chain
      })) || [];
    } catch (error) {
      console.error('Error fetching tokens by chain:', error);
      return [];
    }
  }
}
