import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioMetrics {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  weeklyChange: number;
  weeklyChangePercentage: number;
  monthlyChange: number;
  monthlyChangePercentage: number;
  totalReturn: number;
  totalReturnPercentage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  change24h: number;
  quantity: number;
}

export interface PerformanceHistory {
  date: string;
  value: number;
  return: number;
  benchmark?: number;
}

export interface RiskMetrics {
  valueAtRisk: number; // VaR at 95% confidence
  beta: number; // correlation with market
  alpha: number; // excess return
  treynorRatio: number;
  informationRatio: number;
}

export const usePortfolioPerformance = (userId?: string) => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPortfolioData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch current holdings
      const { data: holdings, error: holdingsError } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agents (
            symbol,
            name,
            market_cap
          )
        `)
        .eq('user_id', userId);

      if (holdingsError) throw holdingsError;

      // Calculate portfolio metrics using mock data for demonstration
      const totalValue = holdings?.reduce((sum, holding) => 
        sum + (holding.total_amount || 0), 0) || 50000; // Mock total value

      // Generate mock performance data for demonstration
      const mockMetrics: PortfolioMetrics = {
        totalValue,
        dailyChange: totalValue * 0.025, // 2.5% daily change
        dailyChangePercentage: 2.5,
        weeklyChange: totalValue * 0.087, // 8.7% weekly change
        weeklyChangePercentage: 8.7,
        monthlyChange: totalValue * 0.156, // 15.6% monthly change
        monthlyChangePercentage: 15.6,
        totalReturn: totalValue * 0.234, // 23.4% total return
        totalReturnPercentage: 23.4,
        sharpeRatio: 1.85,
        maxDrawdown: -12.3,
        volatility: 18.2,
        winRate: 67.8
      };

      // Calculate asset allocation with mock data
      const mockAllocation: AssetAllocation[] = holdings?.map((holding, index) => ({
        symbol: holding.agents?.symbol || `AGENT${index + 1}`,
        name: holding.agents?.name || `Agent ${index + 1}`,
        value: holding.total_amount || Math.random() * 10000,
        percentage: ((holding.total_amount || Math.random() * 10000) / totalValue) * 100,
        change24h: (Math.random() - 0.5) * 20, // Mock 24h change
        quantity: Math.floor(holding.total_amount / 100) || Math.floor(Math.random() * 1000)
      })) || [
        { symbol: 'BTC-AGENT', name: 'Bitcoin Trading Agent', value: 15000, percentage: 30, change24h: 5.2, quantity: 150 },
        { symbol: 'ETH-AGENT', name: 'Ethereum Trading Agent', value: 12500, percentage: 25, change24h: -2.1, quantity: 125 },
        { symbol: 'SOL-AGENT', name: 'Solana Trading Agent', value: 10000, percentage: 20, change24h: 8.7, quantity: 100 },
        { symbol: 'ADA-AGENT', name: 'Cardano Trading Agent', value: 7500, percentage: 15, change24h: 3.4, quantity: 75 },
        { symbol: 'DOT-AGENT', name: 'Polkadot Trading Agent', value: 5000, percentage: 10, change24h: -1.8, quantity: 50 }
      ];

      // Generate performance history (last 30 days)
      const mockHistory: PerformanceHistory[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily variation
        const baseValue = totalValue * (1 + (i - 15) * 0.02); // Trending upward
        
        return {
          date: date.toISOString().split('T')[0],
          value: baseValue + baseValue * randomChange,
          return: randomChange * 100,
          benchmark: (Math.random() - 0.5) * 0.08 * 100 // Random benchmark performance
        };
      });

      // Calculate risk metrics
      const mockRiskMetrics: RiskMetrics = {
        valueAtRisk: totalValue * 0.045, // 4.5% VaR
        beta: 1.12,
        alpha: 3.2,
        treynorRatio: 0.18,
        informationRatio: 0.65
      };

      setMetrics(mockMetrics);
      setAllocation(mockAllocation);
      setHistory(mockHistory);
      setRiskMetrics(mockRiskMetrics);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      toast({
        title: "Error",
        description: "Failed to fetch portfolio performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const refreshData = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  useEffect(() => {
    fetchPortfolioData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchPortfolioData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  return {
    metrics,
    allocation,
    history,
    riskMetrics,
    isLoading,
    error,
    refreshData
  };
};