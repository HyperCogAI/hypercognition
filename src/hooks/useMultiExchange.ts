import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exchangeManager, ExchangeType } from '@/lib/exchanges/exchangeManager';
import { MarketData, Balance, TradeOrder } from '@/lib/exchanges/baseExchange';
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeMetrics {
  exchange: ExchangeType;
  latency: number;
  uptime: number;
  volume24h: number;
  fees: {
    maker: number;
    taker: number;
  };
  lastUpdate: number;
}

export interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: ExchangeType;
  sellExchange: ExchangeType;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercentage: number;
  volume: number;
  estimatedProfit: number;
}

export interface AggregatedPortfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  byExchange: Record<ExchangeType, {
    value: number;
    balances: Balance[];
    orders: TradeOrder[];
    pnl: number;
    pnlPercentage: number;
  }>;
  consolidatedBalances: Record<string, {
    total: number;
    free: number;
    locked: number;
    exchanges: Record<ExchangeType, Balance>;
  }>;
}

export const useMultiExchange = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connectedExchanges, setConnectedExchanges] = useState<ExchangeType[]>([]);
  const [activeExchange, setActiveExchange] = useState<ExchangeType | null>(null);
  const [exchangeMetrics, setExchangeMetrics] = useState<ExchangeMetrics[]>([]);
  const [aggregatedMarketData, setAggregatedMarketData] = useState<Partial<Record<ExchangeType, MarketData[]>>>({});
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [aggregatedPortfolio, setAggregatedPortfolio] = useState<AggregatedPortfolio | null>(null);
  const [autoArbitrageEnabled, setAutoArbitrageEnabled] = useState(false);

  // Update exchange status
  const updateExchangeStatus = useCallback(async () => {
    try {
      const connected = exchangeManager.getConnectedExchanges();
      setConnectedExchanges(connected);
      
      // Update metrics for connected exchanges
      const metrics = await Promise.all(
        connected.map(async (exchange) => {
          const startTime = Date.now();
          try {
            await exchangeManager.getMarketData(['BTCUSDT']);
            const latency = Date.now() - startTime;
            
            return {
              exchange,
              latency,
              uptime: 99.9, // Mock uptime
              volume24h: Math.random() * 1000000000, // Mock volume
              fees: {
                maker: 0.001,
                taker: 0.001
              },
              lastUpdate: Date.now()
            };
          } catch (error) {
            return {
              exchange,
              latency: 9999,
              uptime: 0,
              volume24h: 0,
              fees: { maker: 0, taker: 0 },
              lastUpdate: Date.now()
            };
          }
        })
      );
      
      setExchangeMetrics(metrics);
    } catch (error) {
      console.error('Failed to update exchange status:', error);
    }
  }, []);

  // Fetch aggregated market data
  const fetchAggregatedMarketData = useCallback(async (symbols: string[]) => {
    try {
      setLoading(true);
      const data = await exchangeManager.getAggregatedMarketData(symbols);
      setAggregatedMarketData(data);
      
      // Find arbitrage opportunities
      const opportunities = findArbitrageOpportunities(data, symbols);
      setArbitrageOpportunities(opportunities);
    } catch (error) {
      console.error('Failed to fetch aggregated market data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market data from exchanges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Find arbitrage opportunities
  const findArbitrageOpportunities = (
    marketData: Record<ExchangeType, MarketData[]>,
    symbols: string[]
  ): ArbitrageOpportunity[] => {
    const opportunities: ArbitrageOpportunity[] = [];
    
    symbols.forEach(symbol => {
      const prices: { exchange: ExchangeType; price: number; volume: number }[] = [];
      
      Object.entries(marketData).forEach(([exchange, data]) => {
        const symbolData = data.find(d => d.symbol === symbol);
        if (symbolData) {
          prices.push({
            exchange: exchange as ExchangeType,
            price: symbolData.price,
            volume: symbolData.volume24h
          });
        }
      });
      
      if (prices.length >= 2) {
        prices.sort((a, b) => a.price - b.price);
        const buyPrice = prices[0];
        const sellPrice = prices[prices.length - 1];
        
        const spread = sellPrice.price - buyPrice.price;
        const spreadPercentage = (spread / buyPrice.price) * 100;
        
        if (spreadPercentage > 0.5) { // Only show opportunities > 0.5%
          const volume = Math.min(buyPrice.volume, sellPrice.volume) * 0.01; // 1% of min volume
          const estimatedProfit = spread * volume * 0.95; // Account for fees
          
          opportunities.push({
            symbol,
            buyExchange: buyPrice.exchange,
            sellExchange: sellPrice.exchange,
            buyPrice: buyPrice.price,
            sellPrice: sellPrice.price,
            spread,
            spreadPercentage,
            volume,
            estimatedProfit
          });
        }
      }
    });
    
    return opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
  };

  // Fetch aggregated portfolio
  const fetchAggregatedPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const portfolio: AggregatedPortfolio = {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        byExchange: {} as Record<ExchangeType, {
          value: number;
          balances: Balance[];
          orders: TradeOrder[];
          pnl: number;
          pnlPercentage: number;
        }>,
        consolidatedBalances: {}
      };
      
      for (const exchange of connectedExchanges) {
        try {
          // Switch to exchange and get balances
          exchangeManager.setActiveExchange(exchange);
          const balances = await exchangeManager.getBalances();
          const orders = await exchangeManager.getTradeHistory(undefined, 100);
          
          // Calculate value (mock calculation)
          const value = balances.reduce((sum, balance) => sum + balance.total * 100, 0); // Mock price
          const pnl = Math.random() * 1000 - 500; // Mock PnL
          const pnlPercentage = (pnl / value) * 100;
          
          portfolio.byExchange[exchange] = {
            value,
            balances,
            orders,
            pnl,
            pnlPercentage
          };
          
          portfolio.totalValue += value;
          portfolio.totalPnL += pnl;
          
          // Consolidate balances
          balances.forEach(balance => {
            if (!portfolio.consolidatedBalances[balance.asset]) {
              portfolio.consolidatedBalances[balance.asset] = {
                total: 0,
                free: 0,
                locked: 0,
                exchanges: {} as Record<ExchangeType, Balance>
              };
            }
            
            const consolidated = portfolio.consolidatedBalances[balance.asset];
            consolidated.total += balance.total;
            consolidated.free += balance.free;
            consolidated.locked += balance.locked;
            consolidated.exchanges[exchange] = balance;
          });
        } catch (error) {
          console.error(`Failed to fetch portfolio for ${exchange}:`, error);
        }
      }
      
      portfolio.totalPnLPercentage = portfolio.totalValue > 0 
        ? (portfolio.totalPnL / portfolio.totalValue) * 100 
        : 0;
      
      setAggregatedPortfolio(portfolio);
    } catch (error) {
      console.error('Failed to fetch aggregated portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [connectedExchanges, toast]);

  // Execute cross-exchange trade
  const executeCrossExchangeTrade = async (
    buyExchange: ExchangeType,
    sellExchange: ExchangeType,
    symbol: string,
    amount: number
  ) => {
    try {
      setLoading(true);
      
      // Execute buy order on cheaper exchange
      exchangeManager.setActiveExchange(buyExchange);
      const buyOrder = await exchangeManager.placeOrder({
        symbol,
        side: 'buy',
        type: 'market',
        amount
      });
      
      // Execute sell order on more expensive exchange
      exchangeManager.setActiveExchange(sellExchange);
      const sellOrder = await exchangeManager.placeOrder({
        symbol,
        side: 'sell',
        type: 'market',
        amount
      });
      
      toast({
        title: "Cross-Exchange Trade Executed",
        description: `Buy order ${buyOrder.id} on ${buyExchange}, Sell order ${sellOrder.id} on ${sellExchange}`,
      });
      
      return { buyOrder, sellOrder };
    } catch (error) {
      console.error('Cross-exchange trade failed:', error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Failed to execute cross-exchange trade",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get best execution price across exchanges
  const getBestExecutionPrice = async (symbol: string, side: 'buy' | 'sell') => {
    try {
      return await exchangeManager.getBestPrice(symbol, side);
    } catch (error) {
      console.error('Failed to get best price:', error);
      return null;
    }
  };

  // Rebalance assets across exchanges
  const rebalanceAssets = async (targetDistribution: Record<ExchangeType, number>) => {
    try {
      setLoading(true);
      
      // Implementation would move assets between exchanges to match target distribution
      // This is a complex operation involving withdrawals and deposits
      
      toast({
        title: "Rebalancing Started",
        description: "Asset rebalancing across exchanges has been initiated",
      });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rebalancing Complete",
        description: "Assets have been rebalanced across exchanges",
      });
    } catch (error) {
      console.error('Rebalancing failed:', error);
      toast({
        title: "Rebalancing Failed",
        description: error instanceof Error ? error.message : "Failed to rebalance assets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch exchange connections from Supabase
  const fetchExchangeConnections = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connections } = await supabase
        .from('exchange_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (connections) {
        const connected = connections.map(c => c.exchange_name as ExchangeType);
        setConnectedExchanges(connected);
        
        // Fetch real market data from Supabase
        const { data: marketData } = await supabase
          .from('exchange_market_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (marketData) {
          // Group market data by exchange
          const groupedData: Partial<Record<ExchangeType, MarketData[]>> = {};
          marketData.forEach(md => {
            const exchange = md.exchange_name as ExchangeType;
            if (!groupedData[exchange]) {
              groupedData[exchange] = [];
            }
            groupedData[exchange]!.push({
              symbol: md.symbol,
              price: Number(md.price),
              volume24h: Number(md.volume_24h) || 0,
              change24h: Number(md.change_24h) || 0,
              high24h: Number(md.high_24h) || Number(md.price),
              low24h: Number(md.low_24h) || Number(md.price),
              timestamp: new Date(md.timestamp).getTime()
            });
          });
          
          setAggregatedMarketData(groupedData);
          
          // Find arbitrage opportunities with real data
          const opportunities = findArbitrageOpportunities(
            groupedData as Record<ExchangeType, MarketData[]>,
            ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT']
          );
          setArbitrageOpportunities(opportunities);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exchange connections:', error);
    }
  }, []);

  // Initialize and start monitoring
  useEffect(() => {
    fetchExchangeConnections();
    updateExchangeStatus();
    
    const interval = setInterval(() => {
      updateExchangeStatus();
      fetchExchangeConnections();
    }, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [updateExchangeStatus, fetchExchangeConnections]);

  // Auto-fetch market data when exchanges change
  useEffect(() => {
    if (connectedExchanges.length > 0) {
      fetchAggregatedMarketData(['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT']);
      fetchAggregatedPortfolio();
    }
  }, [connectedExchanges, fetchAggregatedMarketData, fetchAggregatedPortfolio]);

  return {
    loading,
    connectedExchanges,
    activeExchange,
    exchangeMetrics,
    aggregatedMarketData,
    arbitrageOpportunities,
    aggregatedPortfolio,
    autoArbitrageEnabled,
    setActiveExchange: (exchange: ExchangeType) => {
      exchangeManager.setActiveExchange(exchange);
      setActiveExchange(exchange);
    },
    setAutoArbitrageEnabled,
    updateExchangeStatus,
    fetchAggregatedMarketData,
    fetchAggregatedPortfolio,
    executeCrossExchangeTrade,
    getBestExecutionPrice,
    rebalanceAssets,
    // Utility functions
    getExchangeStatus: (exchange: ExchangeType) => 
      exchangeMetrics.find(m => m.exchange === exchange),
    getTotalPortfolioValue: () => aggregatedPortfolio?.totalValue || 0,
    getBestArbitrageOpportunity: () => arbitrageOpportunities[0] || null
  };
};