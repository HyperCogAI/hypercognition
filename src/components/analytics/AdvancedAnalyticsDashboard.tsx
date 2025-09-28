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
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/components/ui/use-toast';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { priceData, topAgents, marketStats, isLoading, formatCurrency, refetch } = useAnalytics();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (topAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(topAgents[0]);
    }
  }, [topAgents, selectedAgent]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refetch, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSentimentColor = (change24h: number) => {
    if (change24h > 0) return 'text-green-500 bg-green-500/10';
    if (change24h < 0) return 'text-red-500 bg-red-500/10';
    return 'text-yellow-500 bg-yellow-500/10';
  };

  const getSentimentLabel = (change24h: number) => {
    if (change24h > 0) return 'BULLISH';
    if (change24h < 0) return 'BEARISH';
    return 'NEUTRAL';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">AI Agents Analytics</h2>
          </div>
          <p className="text-muted-foreground">Real-time AI agent performance and market data</p>
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
            onClick={refetch}
            disabled={isLoading}
            className="h-10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Total Market Cap</span>
            </div>
            <p className="text-3xl font-bold mb-2">{formatCurrency(marketStats.totalMarketCap)}</p>
            <p className={`text-sm font-medium ${marketStats.avgChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(marketStats.avgChange24h)} 24h
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Total Volume</span>
            </div>
            <p className="text-3xl font-bold mb-2">{formatCurrency(marketStats.totalVolume24h)}</p>
            <p className="text-sm text-muted-foreground">24h volume</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Active Agents</span>
            </div>
            <p className="text-3xl font-bold mb-2">{marketStats.activeAgents}</p>
            <p className="text-sm text-muted-foreground">AI agents</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">Avg Change</span>
            </div>
            <p className={`text-3xl font-bold mb-2 ${marketStats.avgChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(marketStats.avgChange24h)}
            </p>
            <p className="text-sm text-muted-foreground">24h average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Price Charts
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
                  {topAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedAgent?.id === agent.id 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">{agent.symbol}</span>
                            <Badge className={`${getSentimentColor(agent.change_24h)} font-medium`}>
                              {getSentimentLabel(agent.change_24h)}
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
                      agentId={selectedAgent.id}
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

        <TabsContent value="charts" className="space-y-6">
          {selectedAgent ? (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  {selectedAgent.name} ({selectedAgent.symbol}) - Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="font-semibold">{formatCurrency(selectedAgent.market_cap)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="font-semibold">{formatCurrency(selectedAgent.volume_24h)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p className={`font-semibold ${selectedAgent.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(selectedAgent.change_24h)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="font-bold">${selectedAgent.price.toFixed(4)}</p>
                  </div>
                </div>
                <div className="h-[400px]">
                  <PriceChart 
                    agentId={selectedAgent.id}
                    symbol={selectedAgent.symbol}
                    currentPrice={selectedAgent.price}
                    change24h={selectedAgent.change_24h}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-muted-foreground">No Agent Selected</h3>
                    <p className="text-sm text-muted-foreground">Select an agent to view detailed charts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;