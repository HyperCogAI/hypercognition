import { supabase } from '@/integrations/supabase/client';

export interface SentimentData {
  overall: number; // -1 to 1 scale
  social: number;
  news: number;
  onChain: number;
  volume: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: number;
  source: string;
  url: string;
  publishedAt: string;
  relevanceScore: number;
  impact: 'low' | 'medium' | 'high';
}

export interface SocialMetrics {
  platform: 'twitter' | 'reddit' | 'telegram' | 'discord';
  mentions: number;
  sentiment: number;
  engagement: number;
  influencerScore: number;
  trendingTopics: string[];
}

export interface OnChainMetrics {
  activeAddresses: number;
  transactionVolume: number;
  whaleActivity: number;
  exchangeInflows: number;
  exchangeOutflows: number;
  stakingRatio: number;
  networkGrowth: number;
}

export interface MarketMood {
  fearGreedIndex: number;
  volatilityIndex: number;
  momentumScore: number;
  liquidityHealth: number;
  marketCap: number;
  dominanceIndex: number;
}

export const RealMarketSentimentService = {
  async getSentimentData(agentId?: string): Promise<SentimentData> {
    try {
      // Simulate real sentiment analysis aggregation
      const socialSentiment = this.generateSocialSentiment();
      const newsSentiment = this.generateNewsSentiment();
      const onChainSentiment = this.generateOnChainSentiment();
      
      const overall = (socialSentiment + newsSentiment + onChainSentiment) / 3;
      
      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (overall > 0.2) trend = 'bullish';
      else if (overall < -0.2) trend = 'bearish';
      
      const volume = this.determineVolumeLevel(overall);
      const confidence = this.calculateConfidence(socialSentiment, newsSentiment, onChainSentiment);

      return {
        overall,
        social: socialSentiment,
        news: newsSentiment,
        onChain: onChainSentiment,
        volume,
        trend,
        confidence,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      return {
        overall: 0,
        social: 0,
        news: 0,
        onChain: 0,
        volume: 'medium',
        trend: 'neutral',
        confidence: 50,
        timestamp: new Date().toISOString()
      };
    }
  },

  async getMarketNews(limit: number = 20): Promise<NewsItem[]> {
    try {
      // In production, this would fetch from news APIs like NewsAPI, CoinDesk, etc.
      const newsItems: NewsItem[] = [];
      
      const newsTemplates = [
        {
          title: "AI Trading Agents Show 40% Performance Improvement",
          summary: "Recent analysis reveals significant improvements in AI trading algorithms.",
          sentiment: 0.6,
          source: "CryptoTimes",
          impact: 'high' as const
        },
        {
          title: "Market Volatility Expected as Fed Decision Approaches",
          summary: "Traders anticipate increased volatility ahead of Federal Reserve announcement.",
          sentiment: -0.3,
          source: "Financial Herald",
          impact: 'medium' as const
        },
        {
          title: "Institutional Adoption of DeFi Protocols Accelerates",
          summary: "Major financial institutions increase their exposure to decentralized finance.",
          sentiment: 0.4,
          source: "DeFi Weekly",
          impact: 'high' as const
        },
        {
          title: "Regulatory Clarity Drives Market Optimism",
          summary: "New regulatory guidelines provide clearer framework for digital assets.",
          sentiment: 0.5,
          source: "Regulatory Review",
          impact: 'medium' as const
        },
        {
          title: "Technical Analysis Suggests Bullish Momentum Building",
          summary: "Multiple indicators point to potential upward price movement.",
          sentiment: 0.3,
          source: "Technical Trader",
          impact: 'medium' as const
        }
      ];

      for (let i = 0; i < Math.min(limit, newsTemplates.length * 4); i++) {
        const template = newsTemplates[i % newsTemplates.length];
        const hoursAgo = Math.floor(Math.random() * 24);
        const publishedAt = new Date();
        publishedAt.setHours(publishedAt.getHours() - hoursAgo);

        newsItems.push({
          id: `news_${i + 1}`,
          title: template.title,
          summary: template.summary,
          sentiment: template.sentiment + (Math.random() - 0.5) * 0.2,
          source: template.source,
          url: `https://example.com/news/${i + 1}`,
          publishedAt: publishedAt.toISOString(),
          relevanceScore: 70 + Math.random() * 30,
          impact: template.impact
        });
      }

      return newsItems.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching market news:', error);
      return [];
    }
  },

  async getSocialMetrics(): Promise<SocialMetrics[]> {
    try {
      const platforms: Array<'twitter' | 'reddit' | 'telegram' | 'discord'> = 
        ['twitter', 'reddit', 'telegram', 'discord'];
      
      return platforms.map(platform => ({
        platform,
        mentions: Math.floor(Math.random() * 10000) + 1000,
        sentiment: (Math.random() - 0.5) * 2, // -1 to 1
        engagement: Math.random() * 100,
        influencerScore: Math.random() * 100,
        trendingTopics: this.generateTrendingTopics()
      }));
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      return [];
    }
  },

  async getOnChainMetrics(): Promise<OnChainMetrics> {
    try {
      return {
        activeAddresses: Math.floor(Math.random() * 100000) + 50000,
        transactionVolume: Math.floor(Math.random() * 1000000) + 500000,
        whaleActivity: Math.random() * 100,
        exchangeInflows: Math.floor(Math.random() * 50000) + 10000,
        exchangeOutflows: Math.floor(Math.random() * 45000) + 8000,
        stakingRatio: 40 + Math.random() * 20, // 40-60%
        networkGrowth: (Math.random() - 0.5) * 10 // -5% to +5%
      };
    } catch (error) {
      console.error('Error fetching on-chain metrics:', error);
      return {
        activeAddresses: 75000,
        transactionVolume: 750000,
        whaleActivity: 50,
        exchangeInflows: 30000,
        exchangeOutflows: 25000,
        stakingRatio: 50,
        networkGrowth: 2.5
      };
    }
  },

  async getMarketMood(): Promise<MarketMood> {
    try {
      return {
        fearGreedIndex: Math.floor(Math.random() * 100), // 0-100
        volatilityIndex: Math.random() * 100,
        momentumScore: (Math.random() - 0.5) * 100,
        liquidityHealth: 60 + Math.random() * 40, // 60-100
        marketCap: 50000000000 + Math.random() * 20000000000, // $50B-$70B
        dominanceIndex: 40 + Math.random() * 20 // 40-60%
      };
    } catch (error) {
      console.error('Error fetching market mood:', error);
      return {
        fearGreedIndex: 50,
        volatilityIndex: 50,
        momentumScore: 0,
        liquidityHealth: 80,
        marketCap: 60000000000,
        dominanceIndex: 50
      };
    }
  },

  async analyzeAgentSentiment(agentId: string): Promise<SentimentData> {
    try {
      // Get agent-specific sentiment data
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (!agent) {
        return this.getSentimentData();
      }

      // Analyze agent-specific factors
      const priceChange24h = agent.change_24h || 0;
      const volume = agent.volume_24h || 0;
      
      // Sentiment influenced by recent performance
      const performanceSentiment = Math.tanh(priceChange24h / 10); // Normalize to -1, 1
      const volumeSentiment = volume > 1000000 ? 0.2 : volume > 500000 ? 0.1 : -0.1;
      
      const baseSentiment = await this.getSentimentData();
      
      return {
        ...baseSentiment,
        overall: (baseSentiment.overall + performanceSentiment + volumeSentiment) / 3,
        onChain: performanceSentiment,
        volume: volume > 1000000 ? 'high' : volume > 500000 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error analyzing agent sentiment:', error);
      return this.getSentimentData();
    }
  },

  // Private helper methods
  private generateSocialSentiment(): number {
    // Simulate aggregated social media sentiment
    return (Math.random() - 0.5) * 2; // -1 to 1
  },

  private generateNewsSentiment(): number {
    // Simulate news sentiment analysis
    return (Math.random() - 0.3) * 1.5; // Slightly more positive bias
  },

  private generateOnChainSentiment(): number {
    // Simulate on-chain data sentiment
    return (Math.random() - 0.4) * 1.2; // Based on network activity
  },

  private determineVolumeLevel(sentiment: number): 'low' | 'medium' | 'high' {
    const abs = Math.abs(sentiment);
    if (abs > 0.7) return 'high';
    if (abs > 0.3) return 'medium';
    return 'low';
  },

  private calculateConfidence(social: number, news: number, onChain: number): number {
    // Higher confidence when all sources agree
    const variance = Math.abs(social - news) + Math.abs(news - onChain) + Math.abs(onChain - social);
    const baseConfidence = 90 - (variance * 15);
    return Math.max(50, Math.min(95, baseConfidence));
  },

  private generateTrendingTopics(): string[] {
    const topics = [
      'AI Trading', 'DeFi Yields', 'Market Volatility', 'Regulatory News',
      'Institutional Adoption', 'Technical Analysis', 'Whale Activity',
      'Staking Rewards', 'Protocol Updates', 'Market Sentiment'
    ];
    
    const numTopics = 3 + Math.floor(Math.random() * 3); // 3-5 topics
    return topics.sort(() => Math.random() - 0.5).slice(0, numTopics);
  }
};