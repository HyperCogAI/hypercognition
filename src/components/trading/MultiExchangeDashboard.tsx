import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useMultiExchange } from '@/hooks/useMultiExchange';
import { ExchangeSelector } from './ExchangeSelector';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowLeftRight, 
  Target, 
  BarChart3, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  PieChart,
  Settings
} from 'lucide-react';

export const MultiExchangeDashboard = () => {
  const {
    loading,
    connectedExchanges,
    activeExchange,
    exchangeMetrics,
    aggregatedMarketData,
    arbitrageOpportunities,
    aggregatedPortfolio,
    autoArbitrageEnabled,
    setAutoArbitrageEnabled,
    fetchAggregatedMarketData,
    fetchAggregatedPortfolio,
    executeCrossExchangeTrade,
    getBestExecutionPrice,
    rebalanceAssets
  } = useMultiExchange();

  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null);

  const handleExecuteArbitrage = async (opportunityIndex: number) => {
    const opportunity = arbitrageOpportunities[opportunityIndex];
    if (!opportunity) return;

    try {
      await executeCrossExchangeTrade(
        opportunity.buyExchange,
        opportunity.sellExchange,
        opportunity.symbol,
        opportunity.volume
      );
    } catch (error) {
      console.error('Failed to execute arbitrage:', error);
    }
  };

  const getExchangeStatusColor = (exchange: string) => {
    const metrics = exchangeMetrics.find(m => m.exchange === exchange);
    if (!metrics) return 'gray';
    if (metrics.latency > 1000) return 'red';
    if (metrics.latency > 500) return 'yellow';
    return 'green';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
            Multi-Exchange{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Trading
            </span>
          </h1>
          <p className="text-muted-foreground">
            Trade across multiple exchanges with unified portfolio management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={connectedExchanges.length > 0 ? "default" : "secondary"}>
            {connectedExchanges.length} Exchange{connectedExchanges.length !== 1 ? 's' : ''} Connected
          </Badge>
          <Button 
            variant={autoArbitrageEnabled ? "default" : "outline"}
            onClick={() => setAutoArbitrageEnabled(!autoArbitrageEnabled)}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Auto Arbitrage {autoArbitrageEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${aggregatedPortfolio?.totalValue.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={aggregatedPortfolio && aggregatedPortfolio.totalPnLPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                    {aggregatedPortfolio?.totalPnLPercentage >= 0 ? "+" : ""}
                    {aggregatedPortfolio?.totalPnLPercentage.toFixed(2) || 0}%
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Exchanges</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedExchanges.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeExchange ? `Active: ${activeExchange}` : 'No active exchange'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arbitrage Opportunities</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{arbitrageOpportunities.length}</div>
                <p className="text-xs text-muted-foreground">
                  Best: {arbitrageOpportunities[0]?.spreadPercentage.toFixed(2) || 0}% spread
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exchangeMetrics.length > 0 
                    ? Math.round(exchangeMetrics.reduce((sum, m) => sum + m.latency, 0) / exchangeMetrics.length)
                    : 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {exchangeMetrics.length} exchanges
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button 
                onClick={() => fetchAggregatedMarketData(['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT'])}
                disabled={loading}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Refresh Market Data
              </Button>
              <Button 
                onClick={fetchAggregatedPortfolio}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <PieChart className="h-4 w-4" />
                Update Portfolio
              </Button>
              <Button 
                onClick={() => rebalanceAssets({ binance: 40, coinbase: 35, kraken: 25 })}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Rebalance Assets
              </Button>
            </CardContent>
          </Card>

          {/* Exchange Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exchangeMetrics.map((metrics) => (
                  <div key={metrics.exchange} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        getExchangeStatusColor(metrics.exchange) === 'green' ? 'bg-green-500' :
                        getExchangeStatusColor(metrics.exchange) === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium capitalize">{metrics.exchange}</p>
                        <p className="text-sm text-muted-foreground">
                          {metrics.latency}ms • {metrics.uptime}% uptime
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${(metrics.volume24h / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-muted-foreground">24h Volume</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-6">
          <ExchangeSelector />
          
          {/* Exchange Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Exchange</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Latency</th>
                      <th className="text-left p-2">24h Volume</th>
                      <th className="text-left p-2">Fees</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchangeMetrics.map((metrics) => (
                      <tr key={metrics.exchange} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{metrics.exchange}</span>
                            {activeExchange === metrics.exchange && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Connected</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`text-sm ${
                            metrics.latency > 1000 ? 'text-red-500' :
                            metrics.latency > 500 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {metrics.latency}ms
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="text-sm">
                            ${(metrics.volume24h / 1000000).toFixed(1)}M
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="text-sm">
                            {(metrics.fees.maker * 100).toFixed(3)}%
                          </span>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arbitrage Tab */}
        <TabsContent value="arbitrage" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Arbitrage Opportunities</CardTitle>
              <Badge variant={autoArbitrageEnabled ? "default" : "secondary"}>
                Auto-execution {autoArbitrageEnabled ? 'enabled' : 'disabled'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arbitrageOpportunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No arbitrage opportunities found</p>
                    <p className="text-sm">Connect more exchanges to find opportunities</p>
                  </div>
                ) : (
                  arbitrageOpportunities.map((opportunity, index) => (
                    <div 
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOpportunity === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedOpportunity(selectedOpportunity === index ? null : index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{opportunity.symbol}</h3>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            +{opportunity.spreadPercentage.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            ${opportunity.estimatedProfit.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Est. Profit</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Buy on {opportunity.buyExchange}</p>
                          <p className="font-medium">${opportunity.buyPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sell on {opportunity.sellExchange}</p>
                          <p className="font-medium">${opportunity.sellPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      {selectedOpportunity === index && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Volume: {opportunity.volume.toFixed(4)} • 
                              Spread: ${opportunity.spread.toFixed(2)}
                            </div>
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteArbitrage(index);
                              }}
                              disabled={loading}
                              className="gap-2"
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                              Execute Trade
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {aggregatedPortfolio ? (
            <>
              {/* Portfolio Summary */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${aggregatedPortfolio.totalValue.toLocaleString()}
                    </div>
                    <p className={`text-sm ${aggregatedPortfolio.totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {aggregatedPortfolio.totalPnLPercentage >= 0 ? '+' : ''}
                      {aggregatedPortfolio.totalPnLPercentage.toFixed(2)}% (${aggregatedPortfolio.totalPnL.toFixed(2)})
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Object.keys(aggregatedPortfolio.consolidatedBalances).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Across {connectedExchanges.length} exchanges
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(aggregatedPortfolio.byExchange).map(([exchange, data]) => (
                        <div key={exchange} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{exchange}</span>
                          <span className="text-sm font-medium">
                            {((data.value / aggregatedPortfolio.totalValue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Consolidated Balances */}
              <Card>
                <CardHeader>
                  <CardTitle>Consolidated Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(aggregatedPortfolio.consolidatedBalances).map(([asset, balance]) => (
                      <div key={asset} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{asset}</h3>
                          <div className="text-right">
                            <p className="font-medium">{balance.total.toFixed(6)}</p>
                            <p className="text-xs text-muted-foreground">
                              Free: {balance.free.toFixed(6)} • Locked: {balance.locked.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {Object.entries(balance.exchanges).map(([exchange, exchangeBalance]) => (
                            <div key={exchange} className="text-center p-2 bg-muted/30 rounded">
                              <p className="text-xs text-muted-foreground capitalize">{exchange}</p>
                              <p className="font-medium">{exchangeBalance.total.toFixed(4)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No portfolio data available</p>
                <p className="text-sm text-muted-foreground">Connect exchanges to view your portfolio</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {exchangeMetrics.map((metrics) => (
                  <div key={metrics.exchange} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium capitalize">{metrics.exchange}</h3>
                      <Badge variant="outline">{metrics.uptime}% uptime</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="font-medium">{metrics.latency}ms</p>
                        <Progress 
                          value={Math.max(0, 100 - (metrics.latency / 10))} 
                          className="mt-1 h-2"
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-medium">${(metrics.volume24h / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Maker Fee</p>
                        <p className="font-medium">{(metrics.fees.maker * 100).toFixed(3)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taker Fee</p>
                        <p className="font-medium">{(metrics.fees.taker * 100).toFixed(3)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Data Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Market Data Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(aggregatedMarketData).map(([exchange, data]) => (
                  <div key={exchange} className="space-y-2">
                    <h3 className="font-medium capitalize">{exchange}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {data.slice(0, 4).map((market) => (
                        <div key={market.symbol} className="p-3 border rounded-lg">
                          <p className="font-medium">{market.symbol}</p>
                          <p className="text-2xl font-bold">${market.price.toLocaleString()}</p>
                          <p className={`text-sm ${market.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {market.change24h >= 0 ? '+' : ''}{((market.change24h / market.price) * 100).toFixed(2)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};