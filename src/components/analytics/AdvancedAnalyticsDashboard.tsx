import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { PriceChart } from '@/components/charts/PriceChart';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

interface MarketSentiment {
  symbol: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  indicators: TechnicalIndicator[];
  volume_trend: string;
  price_momentum: string;
  social_sentiment?: number;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  sentiment: MarketSentiment;
  last_updated: string;
  technical_analysis: {
    rsi: number;
    macd: number;
    bollinger_position: number;
    sma_20: number;
    sma_50: number;
    volume_sma: number;
  };
}

interface MarketOverview {
  total_market_cap: number;
  average_change_24h: number;
  bullish_sentiment_ratio: number;
  bearish_sentiment_ratio: number;
  active_trading_pairs: number;
  market_trend: 'BULLISH' | 'BEARISH';
  volatility_index: number;
  last_updated: string;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<MarketData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('realtime-market-data', {
        body: {
          symbols: [], // Empty array gets top 10 agents
          metrics: ['price', 'volume', 'sentiment', 'technical'],
          timeframe: '1h'
        }
      });

      if (error) throw error;

      if (data.success) {
        setMarketData(data.data);
        setMarketOverview(data.overview);
        if (!selectedAgent && data.data.length > 0) {
          setSelectedAgent(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMarketData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SELL': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'text-green-500 bg-green-500/10';
      case 'BEARISH': return 'text-red-500 bg-red-500/10';
      default: return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time market data and technical analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-500/10 text-green-500' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMarketData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      {marketOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Market Cap</span>
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(marketOverview.total_market_cap)}</p>
              <p className={`text-sm ${marketOverview.average_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(marketOverview.average_change_24h)} 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Market Sentiment</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {(marketOverview.bullish_sentiment_ratio * 100).toFixed(0)}% Bullish
              </p>
              <Progress 
                value={marketOverview.bullish_sentiment_ratio * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Volatility Index</span>
              </div>
              <p className="text-2xl font-bold mt-2">{marketOverview.volatility_index.toFixed(1)}</p>
              <Badge variant={marketOverview.volatility_index > 50 ? 'destructive' : 'secondary'} className="mt-2">
                {marketOverview.volatility_index > 50 ? 'High' : 'Moderate'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Active Pairs</span>
              </div>
              <p className="text-2xl font-bold mt-2">{marketOverview.active_trading_pairs}</p>
              <Badge variant="outline" className="mt-2">
                {marketOverview.market_trend}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent List */}
            <Card>
              <CardHeader>
                <CardTitle>Top AI Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.map((agent) => (
                    <div
                      key={agent.symbol}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAgent?.symbol === agent.symbol 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{agent.symbol}</span>
                            <Badge className={getSentimentColor(agent.sentiment.sentiment)}>
                              {agent.sentiment.sentiment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${agent.price.toFixed(4)}</p>
                          <p className={`text-sm ${agent.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(agent.change_24h)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedAgent ? `${selectedAgent.name} (${selectedAgent.symbol})` : 'Select an Agent'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAgent && (
                  <div className="h-[300px]">
                    <PriceChart 
                      agentId={selectedAgent.symbol}
                      symbol={selectedAgent.symbol}
                      currentPrice={selectedAgent.price}
                      change24h={selectedAgent.change_24h}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          {selectedAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAgent.sentiment.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getSignalIcon(indicator.signal)}
                          <span className="font-medium">{indicator.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{indicator.value.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {(indicator.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moving Averages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Current Price</span>
                      <span className="font-semibold">${selectedAgent.price.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SMA 20</span>
                      <span className={selectedAgent.price > selectedAgent.technical_analysis.sma_20 ? 'text-green-500' : 'text-red-500'}>
                        ${selectedAgent.technical_analysis.sma_20.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SMA 50</span>
                      <span className={selectedAgent.price > selectedAgent.technical_analysis.sma_50 ? 'text-green-500' : 'text-red-500'}>
                        ${selectedAgent.technical_analysis.sma_50.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>RSI</span>
                      <span className={selectedAgent.technical_analysis.rsi > 70 ? 'text-red-500' : selectedAgent.technical_analysis.rsi < 30 ? 'text-green-500' : 'text-yellow-500'}>
                        {selectedAgent.technical_analysis.rsi.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {marketData.map((agent) => (
              <Card key={agent.symbol}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.symbol}</span>
                    <Badge className={getSentimentColor(agent.sentiment.sentiment)}>
                      {agent.sentiment.sentiment}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sentiment Score</span>
                        <span>{agent.sentiment.score.toFixed(0)}%</span>
                      </div>
                      <Progress value={agent.sentiment.score} className="h-2" />
                    </div>
                    
                    {agent.sentiment.social_sentiment && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Social Sentiment</span>
                          <span>{agent.sentiment.social_sentiment.toFixed(0)}%</span>
                        </div>
                        <Progress value={agent.sentiment.social_sentiment} className="h-2" />
                      </div>
                    )}
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Volume Trend:</span>
                        <Badge variant="outline">{agent.sentiment.volume_trend}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Price Momentum:</span>
                        <Badge variant="outline">{agent.sentiment.price_momentum}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Price Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Price Alerts Coming Soon</h3>
                <p className="text-muted-foreground">
                  Set custom price alerts and get notified when your favorite AI agents hit target prices.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;