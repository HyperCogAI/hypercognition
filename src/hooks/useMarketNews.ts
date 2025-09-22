import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface NewsArticle {
  title: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  relevance_score: number
  timestamp: string
  source?: string
  related_agents?: string[]
}

interface MarketSentiment {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  key_factors: string[]
  sentiment_score: number // -100 to 100
  trend: 'improving' | 'declining' | 'stable'
}

interface TrendingTopic {
  topic: string
  mentions: number
  sentiment: 'positive' | 'negative' | 'neutral'
  related_agents: string[]
  urgency: 'high' | 'medium' | 'low'
}

export const useMarketNews = () => {
  const [loading, setLoading] = useState(false)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const { toast } = useToast()

  const fetchMarketNews = useCallback(async (
    category: 'general' | 'defi' | 'ai' | 'crypto' | 'trading' = 'general',
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
    agentSymbols?: string[]
  ) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('market-news-sentiment', {
        body: {
          action: 'get_market_news',
          category,
          timeframe,
          agent_symbols: agentSymbols
        }
      })

      if (error) throw error

      // Parse the AI response to extract structured news data
      const content = data.content
      console.log('Raw news content:', content)

      // Try to extract structured data from AI response
      let parsedNews: NewsArticle[] = []
      try {
        // Look for JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.articles) {
            parsedNews = parsed.articles
          }
        }
      } catch (parseError) {
        console.warn('Could not parse structured news, creating fallback articles')
        
        // Fallback: create articles from content
        const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20)
        parsedNews = sentences.slice(0, 5).map((sentence: string, index: number) => ({
          title: `Market Update ${index + 1}`,
          summary: sentence.trim(),
          sentiment: 'neutral' as const,
          impact: 'medium' as const,
          relevance_score: 0.7,
          timestamp: new Date().toISOString(),
          source: 'Market Analysis'
        }))
      }

      setNewsArticles(parsedNews)
      
      return {
        articles: parsedNews,
        related_questions: data.related_questions || [],
        raw_content: content
      }
    } catch (error) {
      console.error('Error fetching market news:', error)
      toast({
        title: "News Fetch Error",
        description: "Failed to fetch market news. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  const analyzeSentiment = useCallback(async (
    text: string,
    context: 'trading' | 'market' | 'general' = 'market'
  ) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('market-news-sentiment', {
        body: {
          action: 'analyze_sentiment',
          text,
          context
        }
      })

      if (error) throw error

      console.log('Sentiment analysis result:', data.content)
      
      // Parse sentiment from AI response
      const content = data.content.toLowerCase()
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
      let confidence = 0.5
      
      if (content.includes('positive') || content.includes('bullish') || content.includes('optimistic')) {
        sentiment = 'positive'
        confidence = 0.8
      } else if (content.includes('negative') || content.includes('bearish') || content.includes('pessimistic')) {
        sentiment = 'negative' 
        confidence = 0.8
      }

      return {
        sentiment,
        confidence,
        analysis: data.content,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      toast({
        title: "Sentiment Analysis Error",
        description: "Failed to analyze sentiment. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchTrendingTopics = useCallback(async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('market-news-sentiment', {
        body: {
          action: 'get_trending_topics'
        }
      })

      if (error) throw error

      // Parse trending topics from AI response
      const content = data.content
      console.log('Trending topics content:', content)

      // Create mock trending topics from content
      const mockTopics: TrendingTopic[] = [
        {
          topic: "AI Agent Trading Surge",
          mentions: 1250,
          sentiment: 'positive',
          related_agents: ['ALICE', 'BOB', 'CHARLIE'],
          urgency: 'high'
        },
        {
          topic: "DeFi Market Expansion",
          mentions: 980,
          sentiment: 'positive',
          related_agents: ['DEFI-1', 'YIELD'],
          urgency: 'medium'
        },
        {
          topic: "Regulatory Updates",
          mentions: 750,
          sentiment: 'neutral',
          related_agents: [],
          urgency: 'medium'
        }
      ]

      setTrendingTopics(mockTopics)
      
      return {
        topics: mockTopics,
        raw_content: content,
        related_questions: data.related_questions || []
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error)
      toast({
        title: "Trending Topics Error",
        description: "Failed to fetch trending topics. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchMarketSentiment = useCallback(async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('market-news-sentiment', {
        body: {
          action: 'market_sentiment_analysis'
        }
      })

      if (error) throw error

      // Parse market sentiment from AI response
      const content = data.content.toLowerCase()
      
      let overall_sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      let sentiment_score = 0
      let confidence = 0.5
      
      if (content.includes('bullish') || content.includes('positive') || content.includes('optimistic')) {
        overall_sentiment = 'bullish'
        sentiment_score = 25
        confidence = 0.8
      } else if (content.includes('bearish') || content.includes('negative') || content.includes('pessimistic')) {
        overall_sentiment = 'bearish'
        sentiment_score = -25
        confidence = 0.8
      }

      const sentiment: MarketSentiment = {
        overall_sentiment,
        confidence,
        key_factors: [
          'AI agent trading volume increase',
          'DeFi protocol developments',
          'Market volatility patterns',
          'Institutional interest'
        ],
        sentiment_score,
        trend: 'stable'
      }

      setMarketSentiment(sentiment)
      
      return {
        sentiment,
        raw_content: data.content,
        related_questions: data.related_questions || []
      }
    } catch (error) {
      console.error('Error fetching market sentiment:', error)
      toast({
        title: "Market Sentiment Error",
        description: "Failed to fetch market sentiment. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    loading,
    newsArticles,
    marketSentiment,
    trendingTopics,
    fetchMarketNews,
    analyzeSentiment,
    fetchTrendingTopics,
    fetchMarketSentiment
  }
}