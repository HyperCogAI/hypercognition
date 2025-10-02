import { supabase } from '@/integrations/supabase/client';

export interface ChainMetrics {
  chain: 'solana' | 'ethereum' | 'base' | 'polygon';
  tvl: number;
  volume24h: number;
  transactions24h: number;
  activeAddresses24h: number;
  avgGasPrice: number;
  blockTime: number;
  tps: number; // transactions per second
  timestamp: Date;
}

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

export interface DeFiProtocolMetrics {
  protocol: string;
  tvl: number;
  volume24h: number;
  users24h: number;
  apy: number;
  chain: string;
}

export class RealTimeChainAnalytics {
  
  // Fetch live Solana chain metrics
  static async getSolanaMetrics(): Promise<ChainMetrics> {
    try {
      const { data, error } = await supabase
        .from('chain_metrics')
        .select('*')
        .eq('chain', 'solana')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        chain: 'solana',
        tvl: data?.tvl || 0,
        volume24h: data?.volume_24h || 0,
        transactions24h: data?.transactions_24h || 0,
        activeAddresses24h: data?.active_addresses_24h || 0,
        avgGasPrice: data?.avg_gas_price || 0.00001,
        blockTime: data?.block_time || 0.4,
        tps: data?.tps || 2500,
        timestamp: new Date(data?.timestamp || Date.now())
      };
    } catch (error) {
      console.error('Error fetching Solana metrics:', error);
      throw error;
    }
  }

  // Fetch live EVM chain metrics (Ethereum, Base, Polygon)
  static async getEVMMetrics(chain: 'ethereum' | 'base' | 'polygon'): Promise<ChainMetrics> {
    try {
      const { data, error } = await supabase
        .from('chain_metrics')
        .select('*')
        .eq('chain', chain)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        chain,
        tvl: data?.tvl || 0,
        volume24h: data?.volume_24h || 0,
        transactions24h: data?.transactions_24h || 0,
        activeAddresses24h: data?.active_addresses_24h || 0,
        avgGasPrice: data?.avg_gas_price || 0,
        blockTime: data?.block_time || 0,
        tps: data?.tps || 0,
        timestamp: new Date(data?.timestamp || Date.now())
      };
    } catch (error) {
      console.error(`Error fetching ${chain} metrics:`, error);
      throw error;
    }
  }

  // Get top tokens by volume across all chains
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

  // Get real-time liquidity pools data
  static async getLiquidityPools(chain?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('liquidity_pools')
        .select('*')
        .order('liquidity', { ascending: false })
        .limit(50);

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

  // Get cross-chain analytics
  static async getCrossChainAnalytics(): Promise<{
    totalTVL: number;
    totalVolume24h: number;
    chainDistribution: Array<{ chain: string; volume: number; percentage: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('cross_chain_analytics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      const chainDistribution = Array.isArray(data?.chain_distribution) 
        ? data.chain_distribution as Array<{ chain: string; volume: number; percentage: number }>
        : [];

      return {
        totalTVL: data?.total_tvl || 0,
        totalVolume24h: data?.total_volume_24h || 0,
        chainDistribution
      };
    } catch (error) {
      console.error('Error fetching cross-chain analytics:', error);
      throw error;
    }
  }

  // Get agent performance metrics
  static async getAgentPerformanceMetrics(limit: number = 10) {
    try {
      const { data: metrics, error } = await supabase
        .from('agent_performance_metrics')
        .select(`
          *,
          agents!inner (
            id,
            symbol,
            name,
            price,
            market_cap,
            volume_24h
          )
        `)
        .eq('period', '24h')
        .order('total_volume', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return metrics || [];
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      return [];
    }
  }
}
