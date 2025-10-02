import { supabase } from '@/integrations/supabase/client';

export interface KaitoAttentionScore {
  id: string;
  agent_id: string | null;
  twitter_user_id: string | null;
  twitter_username: string;
  yaps_24h: number;
  yaps_48h: number;
  yaps_7d: number;
  yaps_30d: number;
  yaps_3m: number;
  yaps_6m: number;
  yaps_12m: number;
  yaps_all: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface KaitoSyncRequest {
  agentIds?: string[];
  usernames?: string[];
  mode?: 'on-demand' | 'scheduled';
}

export interface KaitoSyncResult {
  message: string;
  stats: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
  results: {
    success: Array<{ username: string; yaps_all: number }>;
    failed: Array<{ username: string; error: string }>;
    skipped: Array<{ username: string; reason: string }>;
  };
}

export class KaitoService {
  /**
   * Sync Kaito attention scores for specific agents or usernames
   */
  static async syncAttentionScores(request: KaitoSyncRequest): Promise<KaitoSyncResult> {
    try {
      const { data, error } = await supabase.functions.invoke('kaito-sync', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing Kaito attention scores:', error);
      throw error;
    }
  }

  /**
   * Get attention scores for a specific agent
   */
  static async getAgentAttentionScore(agentId: string): Promise<KaitoAttentionScore | null> {
    try {
      const { data, error } = await supabase
        .from('kaito_attention_scores')
        .select('*')
        .eq('agent_id', agentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching agent attention score:', error);
      return null;
    }
  }

  /**
   * Get attention scores for a Twitter username
   */
  static async getAttentionScoreByUsername(username: string): Promise<KaitoAttentionScore | null> {
    try {
      const { data, error } = await supabase
        .from('kaito_attention_scores')
        .select('*')
        .eq('twitter_username', username)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching attention score by username:', error);
      return null;
    }
  }

  /**
   * Get top agents by attention score
   */
  static async getTopAgentsByAttention(limit: number = 10, period: '24h' | '7d' | '30d' | 'all' = '30d'): Promise<KaitoAttentionScore[]> {
    try {
      const field = `yaps_${period}`;
      
      const { data, error } = await supabase
        .from('kaito_attention_scores')
        .select('id, agent_id, twitter_user_id, twitter_username, yaps_24h, yaps_48h, yaps_7d, yaps_30d, yaps_3m, yaps_6m, yaps_12m, yaps_all, created_at, updated_at, metadata')
        .not(field, 'is', null)
        .gt(field, 0)
        .order(field, { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top agents by attention:', error);
      return [];
    }
  }

  /**
   * Get recent attention score updates
   */
  static async getRecentUpdates(limit: number = 20): Promise<KaitoAttentionScore[]> {
    try {
      const { data, error } = await supabase
        .from('kaito_attention_scores')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent updates:', error);
      return [];
    }
  }

  /**
   * Check if data needs refresh (older than 6 hours)
   */
  static needsRefresh(score: KaitoAttentionScore | null): boolean {
    if (!score) return true;
    
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const lastUpdate = new Date(score.updated_at);
    
    return lastUpdate < sixHoursAgo;
  }

  /**
   * Format Yaps score for display
   */
  static formatYaps(yaps: number): string {
    if (yaps >= 1000000) {
      return `${(yaps / 1000000).toFixed(2)}M`;
    } else if (yaps >= 1000) {
      return `${(yaps / 1000).toFixed(2)}K`;
    } else {
      return yaps.toFixed(2);
    }
  }

  /**
   * Get influence tier based on Yaps score
   */
  static getInfluenceTier(yaps: number): { tier: string; color: string; description: string } {
    if (yaps >= 10000) {
      return { 
        tier: 'Legendary', 
        color: 'text-amber-500',
        description: 'Top-tier crypto influencer'
      };
    } else if (yaps >= 5000) {
      return { 
        tier: 'Elite', 
        color: 'text-purple-500',
        description: 'Major thought leader'
      };
    } else if (yaps >= 1000) {
      return { 
        tier: 'Prominent', 
        color: 'text-blue-500',
        description: 'Notable voice in crypto'
      };
    } else if (yaps >= 100) {
      return { 
        tier: 'Rising', 
        color: 'text-green-500',
        description: 'Growing influence'
      };
    } else {
      return { 
        tier: 'Emerging', 
        color: 'text-gray-500',
        description: 'Building presence'
      };
    }
  }
}
