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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Market Dashboard</h2>
          </div>
          <p className="text-muted-foreground">Real-time market data and technical analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-10 ${autoRefresh ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMarketData}
            disabled={isLoading}
            className="h-10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      {marketOverview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Total Market Cap</span>
              </div>
              <p className="text-3xl font-bold mb-2">{formatCurrency(marketOverview.total_market_cap)}</p>
              <p className={`text-sm font-medium ${marketOverview.average_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(marketOverview.average_change_24h)} 24h
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span className="text-sm font-medium">Market Sentiment</span>
              </div>
              <p className="text-3xl font-bold mb-3">
                {(marketOverview.bullish_sentiment_ratio * 100).toFixed(0)}% Bullish
              </p>
              <Progress 
                value={marketOverview.bullish_sentiment_ratio * 100} 
                className="h-3"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">Volatility Index</span>
              </div>
              <p className="text-3xl font-bold mb-3">{marketOverview.volatility_index.toFixed(1)}</p>
              <Badge variant={marketOverview.volatility_index > 50 ? 'destructive' : 'secondary'} className="text-xs">
                {marketOverview.volatility_index > 50 ? 'High' : 'Moderate'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                <span className="text-sm font-medium">Active Pairs</span>
              </div>
              <p className="text-3xl font-bold mb-3">{marketOverview.active_trading_pairs}</p>
              <Badge variant="outline" className="text-xs">
                {marketOverview.market_trend}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-12">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Technical Analysis
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Price Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Agent List */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Top AI Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.map((agent) => (
                    <div
                      key={agent.symbol}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedAgent?.symbol === agent.symbol 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">{agent.symbol}</span>
                            <Badge className={`${getSentimentColor(agent.sentiment.sentiment)} font-medium`}>
                              {agent.sentiment.sentiment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.name}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-lg">${agent.price.toFixed(4)}</p>
                          <p className={`text-sm font-medium ${agent.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  {selectedAgent ? `${selectedAgent.name} (${selectedAgent.symbol})` : 'Select an Agent'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAgent ? (
                  <div className="h-[400px]">
                    <PriceChart 
                      agentId={selectedAgent.symbol}
                      symbol={selectedAgent.symbol}
                      currentPrice={selectedAgent.price}
                      change24h={selectedAgent.change_24h}
                    />
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center space-y-3">
                      <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-muted-foreground">No Agent Selected</h3>
                        <p className="text-sm text-muted-foreground">Select an agent to view price chart</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          {selectedAgent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAgent.sentiment.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getSignalIcon(indicator.signal)}
                          <span className="font-medium">{indicator.name}</span>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold">{indicator.value.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {(indicator.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Moving Averages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Current Price</span>
                      <span className="font-bold text-lg">${selectedAgent.price.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">SMA 20</span>
                      <span className={`font-semibold ${selectedAgent.price > selectedAgent.technical_analysis.sma_20 ? 'text-green-500' : 'text-red-500'}`}>
                        ${selectedAgent.technical_analysis.sma_20.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">SMA 50</span>
                      <span className={`font-semibold ${selectedAgent.price > selectedAgent.technical_analysis.sma_50 ? 'text-green-500' : 'text-red-500'}`}>
                        ${selectedAgent.technical_analysis.sma_50.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">RSI</span>
                      <div className="text-right">
                        <span className={`font-semibold ${selectedAgent.technical_analysis.rsi > 70 ? 'text-red-500' : selectedAgent.technical_analysis.rsi < 30 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {selectedAgent.technical_analysis.rsi.toFixed(1)}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedAgent.technical_analysis.rsi > 70 ? 'Overbought' : selectedAgent.technical_analysis.rsi < 30 ? 'Oversold' : 'Neutral'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-muted-foreground">No Agent Selected</h3>
                    <p className="text-muted-foreground">Select an agent from the Market Overview tab to view technical analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {marketData.map((agent) => (
              <Card key={agent.symbol} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{agent.symbol}</span>
                    <Badge className={`${getSentimentColor(agent.sentiment.sentiment)} font-medium px-3 py-1`}>
                      {agent.sentiment.sentiment}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Sentiment Score</span>
                        <span className="font-semibold">{agent.sentiment.score.toFixed(0)}%</span>
                      </div>
                      <Progress value={agent.sentiment.score} className="h-3" />
                    </div>
                    
                    {agent.sentiment.social_sentiment && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Social Sentiment</span>
                          <span className="font-semibold">{agent.sentiment.social_sentiment.toFixed(0)}%</span>
                        </div>
                        <Progress value={agent.sentiment.social_sentiment} className="h-3" />
                      </div>
                    )}
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Volume Trend:</span>
                        <Badge variant="outline" className="font-medium">{agent.sentiment.volume_trend}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Price Momentum:</span>
                        <Badge variant="outline" className="font-medium">{agent.sentiment.price_momentum}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="h-6 w-6" />
                Price Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <AlertTriangle className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Price Alerts Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Set custom price alerts and get notified when your favorite AI agents hit target prices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;