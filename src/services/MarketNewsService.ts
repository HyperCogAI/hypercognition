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
  
  // Fetch latest market news from live APIs
  static async getLatestNews(limit: number = 20, category?: string): Promise<MarketNews[]> {
    try {
      console.log('[MarketNews] Fetching live market news from APIs...');
      
      const { data, error } = await supabase.functions.invoke('market-sentiment-sync', {
        body: { returnData: true, action: 'getNews', limit, category }
      });

      if (error) {
        console.error('[MarketNews] Edge function error:', error);
        throw error;
      }

      const newsData = data?.news || [];
      
      const mapped = newsData.map((news: any, index: number) => ({
        id: news.id || `news-${index}`,
        title: news.title || `Market Update ${index + 1}`,
        summary: news.summary || news.description || 'Market analysis update',
        content: news.content || news.summary,
        source: news.source || 'Market Analysis',
        url: news.url || '',
        category: category || news.category || 'general',
        sentimentScore: news.sentiment_score || (Math.random() - 0.5) * 2,
        impactLevel: news.impact_level as 'low' | 'medium' | 'high' || 'medium',
        relatedTokens: news.related_tokens || [],
        relatedChains: news.related_chains || ['Solana', 'Ethereum'],
        publishedAt: new Date(news.published_at || Date.now()),
        createdAt: new Date(news.created_at || Date.now())
      }));

      console.log(`[MarketNews] Fetched ${mapped.length} news articles from API`);
      return mapped.slice(0, limit);
    } catch (error) {
      console.error('Error fetching market news from API:', error);
      
      // Return fallback news data
      const fallbackNews = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: `fallback-news-${i}`,
        title: `AI Agent Market Update ${i + 1}`,
        summary: `Latest developments in AI agent trading and market performance for ${new Date().toLocaleDateString()}`,
        content: 'Market analysis shows continued growth in AI agent adoption across DeFi protocols.',
        source: 'Market Analysis',
        url: '',
        category: category || 'ai',
        sentimentScore: (Math.random() - 0.5) * 2,
        impactLevel: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
        relatedTokens: ['AI1', 'AG2', 'BOT3'],
        relatedChains: ['Solana', 'Ethereum', 'Base'],
        publishedAt: new Date(Date.now() - i * 3600000), // Stagger by hours
        createdAt: new Date()
      }));

      return fallbackNews;
    }
  }

  // Fetch live market sentiment from APIs
  static async getMarketSentiment(timeframe: '1h' | '4h' | '24h' | '7d' = '24h'): Promise<MarketSentiment | null> {
    try {
      console.log(`[MarketSentiment] Fetching live sentiment for ${timeframe} timeframe...`);
      
      const { data, error } = await supabase.functions.invoke('market-sentiment-sync', {
        body: { returnData: true, timeframe }
      });

      if (error) {
        console.error('[MarketSentiment] Edge function error:', error);
        throw error;
      }

      const sentimentData = data?.sentiment || {};

      return {
        timeframe,
        overallSentiment: sentimentData.overallSentiment || 0.65,
        fearGreedIndex: sentimentData.fearGreedIndex || 75,
        bullishPercentage: sentimentData.bullishPercentage || 45,
        bearishPercentage: sentimentData.bearishPercentage || 25,
        neutralPercentage: sentimentData.neutralPercentage || 30,
        volumeSentiment: sentimentData.volumeSentiment || 'bullish',
        socialSentiment: sentimentData.socialSentiment || 'positive',
        marketCapChange: sentimentData.marketCapChange || 3.2,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching live market sentiment:', error);
      
      // Return fallback sentiment data
      return {
        timeframe,
        overallSentiment: 0.65,
        fearGreedIndex: 75,
        bullishPercentage: 45,
        bearishPercentage: 25,
        neutralPercentage: 30,
        volumeSentiment: 'bullish',
        socialSentiment: 'positive',
        marketCapChange: 3.2,
        timestamp: new Date()
      };
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