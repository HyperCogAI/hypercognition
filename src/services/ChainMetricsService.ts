import { supabase } from '@/integrations/supabase/client';

export interface ChainMetrics {
  chain: 'solana' | 'ethereum' | 'base' | 'polygon';
  tvl: number;
  volume24h: number;
  transactions24h: number;
  activeAddresses24h: number;
  avgGasPrice: number;
  blockTime: number;
  tps: number;
  timestamp: Date;
}

export class ChainMetricsService {
  /**
   * Fetch Solana chain metrics
   */
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

  /**
   * Fetch EVM chain metrics (Ethereum, Base, Polygon)
   */
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

  /**
   * Get cross-chain analytics summary
   */
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
}
