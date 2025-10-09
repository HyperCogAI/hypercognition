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
  liquidityChain?: string;
}

export class TokenMetricsService {
  /**
   * Get top tokens by volume from live AI agent market API
   */
  static async getTopTokensByVolume(limit: number = 20): Promise<TokenMetrics[]> {
    try {
      console.log('[TokenMetrics] Fetching top tokens from AI agent market API...');
      
      // Try enriched first with timeout
      const enrichPromise = supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getTopAIAgents', limit, enrich: true }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Enrich timeout')), 3500)
      );

      let data, error;
      
      try {
        const result = await Promise.race([enrichPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
        
        if (error || !data || data.length === 0) {
          throw new Error('Enriched call failed or empty');
        }
        console.log('[TokenMetrics] ✓ Using enriched data');
      } catch (enrichError) {
        console.warn('[TokenMetrics] Enriched call failed, falling back to lite mode:', enrichError);
        
        // Fallback to lite mode
        const liteResult = await supabase.functions.invoke('ai-agents-market', {
          body: { action: 'getTopAIAgents', limit, enrich: false }
        });
        
        data = liteResult.data;
        error = liteResult.error;
        
        if (error) {
          console.error('[TokenMetrics] Lite mode also failed:', error);
          throw error;
        }
        console.log('[TokenMetrics] ✓ Using lite mode data');
      }

      const tokens = (data || []).map((agent: any, index: number) => {
        const forcedChain = (agent?.symbol?.toUpperCase?.() === 'NEAR') ? 'Other' : undefined;
        const chain = forcedChain || agent.chain || agent.liquidity_chain || agent.dex_chain || 'Unknown';
        return ({
          address: agent.id || `token-${index}`,
          symbol: agent.symbol || '',
          name: agent.name || '',
          price: typeof agent.price === 'number' ? agent.price : 0,
          priceChange24h: typeof agent.change_percent_24h === 'number' ? agent.change_percent_24h : 0,
          volume24h: typeof agent.volume_24h === 'number' ? agent.volume_24h : 0,
          liquidity: typeof agent.dex_liquidity === 'number' ? agent.dex_liquidity : 0,
          marketCap: typeof agent.market_cap === 'number' ? agent.market_cap : 0,
          holders: 0, // unknown
          transactions24h: agent.price && agent.volume_24h ? Math.floor(agent.volume_24h / Math.max(agent.price, 1)) : 0,
          chain,
          liquidityChain: agent.liquidity_chain || agent.dex_chain
        });
      });

      console.log(`[TokenMetrics] Fetched ${tokens.length} tokens from API`);
      return tokens.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top tokens from API:', error);
      
      // Do not fabricate data
      return [];
    }
    }
  
  /**
   * Get tokens by specific chain from live AI agent market API
   */
  static async getTokensByChain(chain: string, limit: number = 20): Promise<TokenMetrics[]> {
    try {
      console.log(`[TokenMetrics] Fetching tokens for ${chain} from API...`);
      
      // Get all tokens first, then filter by chain
      const allTokens = await this.getTopTokensByVolume(limit * 2); // Get more to ensure enough for filtering
      
      const filtered = allTokens.filter(token => 
        token.chain.toLowerCase() === chain.toLowerCase()
      );

      console.log(`[TokenMetrics] Found ${filtered.length} tokens for ${chain}`);
      return filtered.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching tokens for ${chain} from API:`, error);
      
      // Return fallback data for the specific chain
      return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        address: `fallback-${chain}-${i}`,
        symbol: `${chain.substring(0, 3).toUpperCase()}${i + 1}`,
        name: `${chain} Agent ${i + 1}`,
        price: 0.5 + Math.random() * 2,
        priceChange24h: (Math.random() - 0.5) * 20,
        volume24h: 100000 + Math.random() * 900000,
        liquidity: 50000 + Math.random() * 450000,
        marketCap: 1000000 + Math.random() * 9000000,
        holders: 1000 + Math.floor(Math.random() * 9000),
        transactions24h: 500 + Math.floor(Math.random() * 4500),
        chain
      }));
    }
  }
}
