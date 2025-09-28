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
          summary: "Recent analysis reveals significant improvements in AI trading algorithms with enhanced pattern recognition capabilities.",
          sentiment: 0.6,
          source: "CryptoTimes",
          impact: 'high' as const
        },
        {
          title: "Market Volatility Expected as Fed Decision Approaches",
          summary: "Traders anticipate increased volatility ahead of Federal Reserve announcement on interest rate policy.",
          sentiment: -0.3,
          source: "Financial Herald",
          impact: 'medium' as const
        },
        {
          title: "Institutional Adoption of DeFi Protocols Accelerates",
          summary: "Major financial institutions increase their exposure to decentralized finance, driving mainstream adoption.",
          sentiment: 0.4,
          source: "DeFi Weekly",
          impact: 'high' as const
        },
        {
          title: "Regulatory Clarity Drives Market Optimism",
          summary: "New regulatory guidelines provide clearer framework for digital assets, boosting investor confidence.",
          sentiment: 0.5,
          source: "Regulatory Review",
          impact: 'medium' as const
        },
        {
          title: "Technical Analysis Suggests Bullish Momentum Building",
          summary: "Multiple indicators point to potential upward price movement across major cryptocurrency markets.",
          sentiment: 0.3,
          source: "Technical Trader",
          impact: 'medium' as const
        },
        {
          title: "Blockchain Infrastructure Upgrades Show Promising Results",
          summary: "Recent network improvements demonstrate enhanced scalability and reduced transaction costs.",
          sentiment: 0.4,
          source: "Blockchain Today",
          impact: 'medium' as const
        },
        {
          title: "Trading Volume Surges Across Major Exchanges",
          summary: "24-hour trading volumes reach new monthly highs as market participation increases.",
          sentiment: 0.2,
          source: "Exchange Monitor",
          impact: 'low' as const
        },
        {
          title: "Smart Contract Security Audits Show Improvement",
          summary: "Latest security audit reports indicate significant improvements in protocol safety measures.",
          sentiment: 0.3,
          source: "Security Watch",
          impact: 'medium' as const
        },
        {
          title: "Cross-Chain Bridge Technology Advances",
          summary: "New interoperability solutions enable seamless asset transfers between blockchain networks.",
          sentiment: 0.4,
          source: "Interop News",
          impact: 'high' as const
        },
        {
          title: "Yield Farming Strategies Evolve with Market Conditions",
          summary: "DeFi protocols adapt their reward mechanisms to changing market dynamics and user behavior.",
          sentiment: 0.1,
          source: "Yield Analytics",
          impact: 'low' as const
        },
        {
          title: "NFT Market Shows Signs of Recovery",
          summary: "Non-fungible token trading activity increases with new utility-focused projects gaining traction.",
          sentiment: 0.2,
          source: "NFT Report",
          impact: 'low' as const
        },
        {
          title: "Central Bank Digital Currency Pilots Expand Globally",
          summary: "Multiple countries advance their CBDC testing programs, exploring digital currency implementation.",
          sentiment: 0.1,
          source: "Global Finance",
          impact: 'medium' as const
        },
        {
          title: "Layer 2 Solutions Demonstrate Scalability Benefits",
          summary: "Second-layer blockchain solutions show significant improvements in transaction throughput and cost efficiency.",
          sentiment: 0.3,
          source: "Layer2 Today",
          impact: 'medium' as const
        },
        {
          title: "Algorithmic Trading Bots Achieve New Efficiency Milestones",
          summary: "Automated trading systems demonstrate improved performance metrics across multiple market conditions.",
          sentiment: 0.4,
          source: "Algo Trading Weekly",
          impact: 'medium' as const
        },
        {
          title: "Staking Rewards Reach Competitive Levels",
          summary: "Proof-of-stake networks offer attractive yields as more validators join the ecosystem.",
          sentiment: 0.3,
          source: "Staking Report",
          impact: 'low' as const
        }
      ];

      // Ensure unique news items by limiting to available templates and using Set to track IDs
      const maxItems = Math.min(limit, newsTemplates.length);
      const usedTemplates = new Set<number>();
      
      for (let i = 0; i < maxItems; i++) {
        let templateIndex;
        do {
          templateIndex = Math.floor(Math.random() * newsTemplates.length);
        } while (usedTemplates.has(templateIndex));
        
        usedTemplates.add(templateIndex);
        const template = newsTemplates[templateIndex];
        
        const hoursAgo = Math.floor(Math.random() * 24);
        const publishedAt = new Date();
        publishedAt.setHours(publishedAt.getHours() - hoursAgo);

        newsItems.push({
          id: `news_${templateIndex}_${Date.now()}_${i}`,
          title: template.title,
          summary: template.summary,
          sentiment: template.sentiment + (Math.random() - 0.5) * 0.2,
          source: template.source,
          url: `https://example.com/news/${templateIndex}`,
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

  // Helper methods
  generateSocialSentiment(): number {
    // Simulate aggregated social media sentiment
    return (Math.random() - 0.5) * 2; // -1 to 1
  },

  generateNewsSentiment(): number {
    // Simulate news sentiment analysis
    return (Math.random() - 0.3) * 1.5; // Slightly more positive bias
  },

  generateOnChainSentiment(): number {
    // Simulate on-chain data sentiment
    return (Math.random() - 0.4) * 1.2; // Based on network activity
  },

  determineVolumeLevel(sentiment: number): 'low' | 'medium' | 'high' {
    const abs = Math.abs(sentiment);
    if (abs > 0.7) return 'high';
    if (abs > 0.3) return 'medium';
    return 'low';
  },

  calculateConfidence(social: number, news: number, onChain: number): number {
    // Higher confidence when all sources agree
    const variance = Math.abs(social - news) + Math.abs(news - onChain) + Math.abs(onChain - social);
    const baseConfidence = 90 - (variance * 15);
    return Math.max(50, Math.min(95, baseConfidence));
  },

  generateTrendingTopics(): string[] {
    const topics = [
      'AI Trading', 'DeFi Yields', 'Market Volatility', 'Regulatory News',
      'Institutional Adoption', 'Technical Analysis', 'Whale Activity',
      'Staking Rewards', 'Protocol Updates', 'Market Sentiment'
    ];
    
    const numTopics = 3 + Math.floor(Math.random() * 3); // 3-5 topics
    return topics.sort(() => Math.random() - 0.5).slice(0, numTopics);
  }
};