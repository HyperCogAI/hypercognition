import { supabase } from '@/integrations/supabase/client';
import { aiAgentMarketApi } from '@/lib/apis/aiAgentMarketApi';

export interface AnalyticsEvent {
  event_type: string;
  event_category: string;
  event_name: string;
  event_data?: Record<string, any>;
  session_id?: string;
  page_url?: string;
}

export interface PortfolioMetrics {
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_profit: number;
  avg_loss: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  best_trade?: number;
  worst_trade?: number;
}

export interface TradingMetrics {
  total_volume: number;
  trade_count: number;
  profitable_trades: number;
  unprofitable_trades: number;
  total_profit: number;
  total_loss: number;
  largest_win?: number;
  largest_loss?: number;
  consecutive_wins: number;
  consecutive_losses: number;
}

export interface AgentPerformanceMetrics {
  agent_id: string;
  total_trades: number;
  successful_trades: number;
  total_volume: number;
  total_profit: number;
  avg_roi: number;
  win_rate: number;
  volatility?: number;
  sentiment_score?: number;
  active_users: number;
  total_holders: number;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async trackEvent(event: AnalyticsEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: event.event_type,
        event_category: event.event_category,
        event_name: event.event_name,
        event_data: event.event_data || {},
        session_id: event.session_id,
        page_url: event.page_url || window.location.href,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      } as any);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error tracking event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get portfolio analytics for a user
   */
  static async getPortfolioAnalytics(
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    limit: number = 30
  ): Promise<PortfolioMetrics[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('portfolio_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .order('period_start', { ascending: false })
        .limit(limit)
        .abortSignal(AbortSignal.timeout(5000));

      if (error) throw error;
      return (data || []) as any[];
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      return [];
    }
  }

  /**
   * Get trading analytics for a user
   */
  static async getTradingAnalytics(
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    agentId?: string,
    limit: number = 30
  ): Promise<TradingMetrics[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      let query = supabase
        .from('trading_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period)
        .order('period_start', { ascending: false })
        .limit(limit)
        .abortSignal(AbortSignal.timeout(5000));

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as any[];
    } catch (error) {
      console.error('Error fetching trading analytics:', error);
      return [];
    }
  }

  /**
   * Get agent performance metrics
   */
  static async getAgentPerformanceMetrics(
    agentId: string,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    limit: number = 30
  ): Promise<AgentPerformanceMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .eq('period', period)
        .order('period_start', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as any[];
    } catch (error) {
      console.error('Error fetching agent performance metrics:', error);
      return [];
    }
  }

  /**
   * Get analytics dashboard preferences
   */
  static async getAnalyticsPreferences(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('analytics_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics preferences:', error);
      return null;
    }
  }

  /**
   * Update analytics dashboard preferences
   */
  static async updateAnalyticsPreferences(preferences: {
    default_period?: string;
    favorite_metrics?: string[];
    dashboard_layout?: Record<string, any>;
    alert_thresholds?: Record<string, any>;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('analytics_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        } as any);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating analytics preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics events for a user
   */
  static async getAnalyticsEvents(
    eventType?: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analytics events:', error);
      return [];
    }
  }

  /**
   * Get real-time performance metrics summary
   */
  static async getPerformanceSummary(): Promise<{
    portfolio: PortfolioMetrics | null;
    trading: TradingMetrics | null;
  }> {
    try {
      const portfolioData = await this.getPortfolioAnalytics('daily', 1);
      const tradingData = await this.getTradingAnalytics('daily', undefined, 1);

      return {
        portfolio: portfolioData[0] || null,
        trading: tradingData[0] || null
      };
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      return { portfolio: null, trading: null };
    }
  }

  /**
   * Export analytics data
   */
  static async exportAnalyticsData(
    startDate: Date,
    endDate: Date,
    dataType: 'portfolio' | 'trading' | 'events' = 'portfolio'
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      let query;
      
      switch (dataType) {
        case 'portfolio':
          query = supabase
            .from('portfolio_analytics')
            .select('*')
            .eq('user_id', user.id)
            .gte('period_start', startDate.toISOString())
            .lte('period_end', endDate.toISOString());
          break;
        case 'trading':
          query = supabase
            .from('trading_analytics')
            .select('*')
            .eq('user_id', user.id)
            .gte('period_start', startDate.toISOString())
            .lte('period_end', endDate.toISOString());
          break;
        case 'events':
          query = supabase
            .from('analytics_events')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error exporting analytics data:', error);
      return { success: false, error: error.message };
    }
  }

  // New enterprise-grade methods
  static async getAgentAnalytics(agentId: string, metrics: string[] = ['all'], period: string = '24h') {
    const { data, error } = await supabase.functions.invoke('analytics-aggregator', {
      body: { agentId, metrics, period }
    })
    if (error) throw error
    return data
  }

  static async analyzeSentiment(agentId: string, platform: string, texts: string[], period: string = '24h') {
    const { data, error } = await supabase.functions.invoke('sentiment-analyzer', {
      body: { agentId, platform, texts, period }
    })
    if (error) throw error
    return data
  }

  static async detectTrends(agentId: string, priceHistory: any[]) {
    const { data, error } = await supabase.functions.invoke('trend-detector', {
      body: { agentId, priceHistory }
    })
    if (error) throw error
    return data
  }

  static async queryAnalytics(query: string, params: any, useCache: boolean = true) {
    const { data, error } = await supabase.functions.invoke('analytics-query', {
      body: { query, params, useCache, cacheTtl: 300000 }
    })
    if (error) throw error
    return data
  }

  static async detectAnomalies(agentId: string, currentData: any, historicalData: any[]) {
    const { data, error } = await supabase.functions.invoke('anomaly-detector', {
      body: { agentId, currentData, historicalData }
    })
    if (error) throw error
    return data
  }

  static async getTopPerformers(period: string = '24h', limit: number = 10) {
    return this.queryAnalytics('top_performers', { period, limit })
  }

  static async getTrendingAgents(period: string = '24h', limit: number = 10) {
    return this.queryAnalytics('trending_agents', { period, limit })
  }

  static async getMarketOverview(period: string = '24h') {
    return this.queryAnalytics('market_overview', { period })
  }

  static async getSentimentTrends(agentId: string, period: string = '24h') {
    return this.queryAnalytics('sentiment_trends', { agentId, period })
  }

  static async getVolumeLeaders(period: string = '24h', limit: number = 10) {
    return this.queryAnalytics('volume_leaders', { period, limit })
  }

  static async getAnomalyAlerts(limit: number = 20) {
    try {
      // Query the anomaly_alerts table directly via the analytics-query function
      const { data, error } = await supabase.functions.invoke('analytics-query', {
        body: { 
          query: 'anomaly_alerts',
          params: { limit },
          useCache: false 
        }
      });
      
      if (error) throw error;
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching anomaly alerts:', error);
      return [];
    }
  }
}