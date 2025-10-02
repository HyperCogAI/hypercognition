import { useState, useEffect } from 'react';
import { MarketNewsService, MarketNews, MarketSentiment } from '@/services/MarketNewsService';
import { useToast } from '@/hooks/use-toast';

export function useMarketNewsData() {
  const [loading, setLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState<MarketNews[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '24h' | '7d'>('24h');
  const { toast } = useToast();

  const fetchNews = async (category?: string, limit: number = 20) => {
    try {
      setLoading(true);
      const news = await MarketNewsService.getLatestNews(limit, category);
      setNewsArticles(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentiment = async (timeframe: '1h' | '4h' | '24h' | '7d' = '24h') => {
    try {
      const sentiment = await MarketNewsService.getMarketSentiment(timeframe);
      setMarketSentiment(sentiment);
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market sentiment",
        variant: "destructive"
      });
    }
  };

  const fetchNewsByImpact = async (impactLevel: 'low' | 'medium' | 'high', limit: number = 10) => {
    try {
      setLoading(true);
      const news = await MarketNewsService.getNewsByImpact(impactLevel, limit);
      setNewsArticles(news);
    } catch (error) {
      console.error('Error fetching news by impact:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsByChains = async (chains: string[], limit: number = 20) => {
    try {
      setLoading(true);
      const news = await MarketNewsService.getNewsByChains(chains, limit);
      setNewsArticles(news);
    } catch (error) {
      console.error('Error fetching news by chains:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchNews(selectedCategory === 'all' ? undefined : selectedCategory),
      fetchSentiment(selectedTimeframe)
    ]);
  };

  useEffect(() => {
    refreshAll();
    
    // Refresh every 5 minutes
    const interval = setInterval(refreshAll, 300000);
    
    return () => clearInterval(interval);
  }, [selectedCategory, selectedTimeframe]);

  return {
    loading,
    newsArticles,
    marketSentiment,
    selectedCategory,
    setSelectedCategory,
    selectedTimeframe,
    setSelectedTimeframe,
    fetchNews,
    fetchSentiment,
    fetchNewsByImpact,
    fetchNewsByChains,
    refreshAll
  };
}