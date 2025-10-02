import { supabase } from '@/integrations/supabase/client'

interface AIAgentMarketData {
  id: string
  symbol: string
  name: string
  description?: string
  price: number
  change_24h: number
  change_percent_24h: number
  change_percent_7d?: number
  volume_24h: number
  market_cap: number
  high_24h: number
  low_24h: number
  category: string
  blockchain?: string
  chain?: string
  launch_date?: string
  performance_score?: number
  total_trades?: number
  active_users?: number
  avatar_url?: string
  rank?: number
  circulating_supply?: number
  total_supply?: number
}

interface AIAgentPriceHistory {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

class AIAgentMarketAPI {
  async getTopAIAgents(limit: number = 100): Promise<AIAgentMarketData[]> {
    try {
      console.log('[AIAgentMarketAPI] Fetching top AI agents from CoinGecko...');
      
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getTopAIAgents', limit }
      });

      if (error) {
        console.error('[AIAgentMarketAPI] Edge function error:', error);
        throw error;
      }

      console.log('[AIAgentMarketAPI] Fetched', data?.length || 0, 'AI agents');
      return data || [];
    } catch (error) {
      console.error('[AIAgentMarketAPI] Error fetching top AI agents:', error);
      return [];
    }
  }

  async getAIAgentById(id: string): Promise<AIAgentMarketData | null> {
    try {
      console.log('[AIAgentMarketAPI] Fetching agent by ID:', id);
      
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getAIAgentById', id }
      });

      if (error) {
        console.error('[AIAgentMarketAPI] Edge function error:', error);
        throw error;
      }

      console.log('[AIAgentMarketAPI] Fetched agent:', data?.name);
      return data || null;
    } catch (error) {
      console.error('[AIAgentMarketAPI] Error fetching AI agent by ID:', error);
      return null;
    }
  }

  async getAIAgentPriceHistory(id: string, days: number = 30): Promise<AIAgentPriceHistory[]> {
    try {
      const { data: agent } = await supabase
        .from('agents')
        .select('price, market_cap, volume_24h, created_at')
        .eq('id', id)
        .single()

      if (!agent) return []

      // Generate historical data based on current values (placeholder)
      const history: AIAgentPriceHistory[] = []
      const now = Date.now()
      
      for (let i = days; i >= 0; i--) {
        history.push({
          timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
          price: agent.price,
          volume: agent.volume_24h,
          market_cap: agent.market_cap
        })
      }
      
      return history
    } catch (error) {
      console.error('Error fetching price history from database:', error)
      return []
    }
  }

  async searchAIAgents(query: string): Promise<AIAgentMarketData[]> {
    try {
      console.log('[AIAgentMarketAPI] Searching AI agents:', query);
      
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'searchAIAgents' }
      });

      if (error) {
        console.error('[AIAgentMarketAPI] Edge function error:', error);
        throw error;
      }

      // Client-side filtering
      const filtered = (data || []).filter((agent: AIAgentMarketData) =>
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);

      console.log('[AIAgentMarketAPI] Found', filtered.length, 'matching agents');
      return filtered;
    } catch (error) {
      console.error('[AIAgentMarketAPI] Error searching AI agents:', error);
      return [];
    }
  }

  async getTrendingAIAgents(): Promise<AIAgentMarketData[]> {
    try {
      console.log('[AIAgentMarketAPI] Fetching trending AI agents...');
      
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getTrendingAIAgents' }
      });

      if (error) {
        console.error('[AIAgentMarketAPI] Edge function error:', error);
        throw error;
      }

      console.log('[AIAgentMarketAPI] Fetched', data?.length || 0, 'trending agents');
      return data || [];
    } catch (error) {
      console.error('[AIAgentMarketAPI] Error fetching trending AI agents:', error);
      return [];
    }
  }

  async getMarketStats(): Promise<{
    totalMarketCap: number
    totalVolume24h: number
    activeAgents: number
    avgChange24h: number
  }> {
    try {
      console.log('[AIAgentMarketAPI] Fetching market stats...');
      
      const { data, error } = await supabase.functions.invoke('ai-agents-market', {
        body: { action: 'getMarketStats' }
      });

      if (error) {
        console.error('[AIAgentMarketAPI] Edge function error:', error);
        throw error;
      }

      console.log('[AIAgentMarketAPI] Market stats:', data);
      return data || {
        totalMarketCap: 0,
        totalVolume24h: 0,
        activeAgents: 0,
        avgChange24h: 0
      };
    } catch (error) {
      console.error('[AIAgentMarketAPI] Error fetching market stats:', error);
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        activeAgents: 0,
        avgChange24h: 0
      };
    }
  }
}

export const aiAgentMarketApi = new AIAgentMarketAPI()
export type { AIAgentMarketData, AIAgentPriceHistory }