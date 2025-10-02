import { supabase } from '@/integrations/supabase/client';

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  url?: string;
  category: string;
  sentimentScore?: number;
  impactLevel?: 'low' | 'medium' | 'high';
  relatedTokens?: string[];
  relatedChains?: string[];
  publishedAt: Date;
  createdAt: Date;
}

export interface MarketSentiment {
  timeframe: '1h' | '4h' | '24h' | '7d';
  overallSentiment: number;
  fearGreedIndex: number;
  bullishPercentage: number;
  bearishPercentage: number;
  neutralPercentage: number;
  volumeSentiment?: string;
  socialSentiment?: string;
  marketCapChange?: number;
  timestamp: Date;
}

export class MarketNewsService {
  
  // Fetch latest market news
  static async getLatestNews(limit: number = 20, category?: string): Promise<MarketNews[]> {
    try {
      let query = supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary,
        content: news.content,
        source: news.source,
        url: news.url,
        category: news.category,
        sentimentScore: news.sentiment_score,
        impactLevel: news.impact_level as 'low' | 'medium' | 'high' | undefined,
        relatedTokens: news.related_tokens,
        relatedChains: news.related_chains,
        publishedAt: new Date(news.published_at),
        createdAt: new Date(news.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching market news:', error);
      return [];
    }
  }

  // Fetch market sentiment for a specific timeframe
  static async getMarketSentiment(timeframe: '1h' | '4h' | '24h' | '7d' = '24h'): Promise<MarketSentiment | null> {
    try {
      const { data, error } = await supabase
        .from('market_sentiment')
        .select('*')
        .eq('timeframe', timeframe)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        timeframe: data.timeframe as '1h' | '4h' | '24h' | '7d',
        overallSentiment: data.overall_sentiment,
        fearGreedIndex: data.fear_greed_index,
        bullishPercentage: data.bullish_percentage,
        bearishPercentage: data.bearish_percentage,
        neutralPercentage: data.neutral_percentage,
        volumeSentiment: data.volume_sentiment,
        socialSentiment: data.social_sentiment,
        marketCapChange: data.market_cap_change,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      return null;
    }
  }

  // Fetch news by impact level
  static async getNewsByImpact(impactLevel: 'low' | 'medium' | 'high', limit: number = 10): Promise<MarketNews[]> {
    try {
      const { data, error } = await supabase
        .from('market_news')
        .select('*')
        .eq('impact_level', impactLevel)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary,
        content: news.content,
        source: news.source,
        url: news.url,
        category: news.category,
        sentimentScore: news.sentiment_score,
        impactLevel: news.impact_level as 'low' | 'medium' | 'high' | undefined,
        relatedTokens: news.related_tokens,
        relatedChains: news.related_chains,
        publishedAt: new Date(news.published_at),
        createdAt: new Date(news.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching news by impact:', error);
      return [];
    }
  }

  // Fetch news related to specific tokens
  static async getNewsByTokens(tokens: string[], limit: number = 20): Promise<MarketNews[]> {
    try {
      const { data, error } = await supabase
        .from('market_news')
        .select('*')
        .contains('related_tokens', tokens)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary,
        content: news.content,
        source: news.source,
        url: news.url,
        category: news.category,
        sentimentScore: news.sentiment_score,
        impactLevel: news.impact_level as 'low' | 'medium' | 'high' | undefined,
        relatedTokens: news.related_tokens,
        relatedChains: news.related_chains,
        publishedAt: new Date(news.published_at),
        createdAt: new Date(news.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching news by tokens:', error);
      return [];
    }
  }

  // Fetch news related to specific chains
  static async getNewsByChains(chains: string[], limit: number = 20): Promise<MarketNews[]> {
    try {
      const { data, error } = await supabase
        .from('market_news')
        .select('*')
        .contains('related_chains', chains)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary,
        content: news.content,
        source: news.source,
        url: news.url,
        category: news.category,
        sentimentScore: news.sentiment_score,
        impactLevel: news.impact_level as 'low' | 'medium' | 'high' | undefined,
        relatedTokens: news.related_tokens,
        relatedChains: news.related_chains,
        publishedAt: new Date(news.published_at),
        createdAt: new Date(news.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching news by chains:', error);
      return [];
    }
  }

  // Fetch sentiment history for trend analysis
  static async getSentimentHistory(
    timeframe: '1h' | '4h' | '24h' | '7d',
    limit: number = 24
  ): Promise<MarketSentiment[]> {
    try {
      const { data, error } = await supabase
        .from('market_sentiment')
        .select('*')
        .eq('timeframe', timeframe)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(sentiment => ({
        timeframe: sentiment.timeframe as '1h' | '4h' | '24h' | '7d',
        overallSentiment: sentiment.overall_sentiment,
        fearGreedIndex: sentiment.fear_greed_index,
        bullishPercentage: sentiment.bullish_percentage,
        bearishPercentage: sentiment.bearish_percentage,
        neutralPercentage: sentiment.neutral_percentage,
        volumeSentiment: sentiment.volume_sentiment,
        socialSentiment: sentiment.social_sentiment,
        marketCapChange: sentiment.market_cap_change,
        timestamp: new Date(sentiment.timestamp)
      })) || [];
    } catch (error) {
      console.error('Error fetching sentiment history:', error);
      return [];
    }
  }
}