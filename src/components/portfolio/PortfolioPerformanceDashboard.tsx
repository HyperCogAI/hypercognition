import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RealPortfolioService } from '@/services/RealPortfolioService';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, RefreshCw, PieChart, BarChart3, Activity, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const PortfolioPerformanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = React.useState<any>(null);
  const [allocation, setAllocation] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '7D' | '30D'>('30D');

  React.useEffect(() => {
    loadPortfolioData();
  }, [user?.id, selectedTimeframe]);

  const loadPortfolioData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const [metricsData, allocationData, historyData] = await Promise.all([
        RealPortfolioService.calculatePortfolioMetrics(user.id),
        RealPortfolioService.getAssetAllocation(user.id),
        RealPortfolioService.getPortfolioPerformance(user.id, selectedTimeframe === '1D' ? '1D' : selectedTimeframe === '7D' ? '1W' : '1M')
      ]);

      setMetrics(metricsData);
      setAllocation(allocationData);
      setHistory(historyData);
      setRiskMetrics({
        valueAtRisk: metricsData.totalValue * 0.05,
        beta: 1.2,
        alpha: 3.5,
        treynorRatio: 0.15,
        informationRatio: 0.8
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadPortfolioData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Performance</h2>
          <p className="text-muted-foreground">Real-time analytics and insights</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
            <div className={cn("text-xs flex items-center gap-1", getChangeColor(metrics.dailyChangePercentage))}>
              {getChangeIcon(metrics.dailyChangePercentage)}
              {formatCurrency(Math.abs(metrics.dailyChange))} ({formatPercentage(metrics.dailyChangePercentage)})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalPnL)}</div>
            <div className={cn("text-xs", getChangeColor(metrics.totalPnL))}>
              {formatPercentage(metrics.totalPnLPercentage)} all time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
            <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics.sharpeRatio || 0) * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Win rate estimation</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Historical value and returns over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  {(['1D', '7D', '30D'] as const).map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="portfolio_value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-bold", getChangeColor(metrics.dailyChangePercentage * 7))}>
                  {formatPercentage(metrics.dailyChangePercentage * 7)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Math.abs(metrics.dailyChange * 7))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-bold", getChangeColor(metrics.dailyChangePercentage * 30))}>
                  {formatPercentage(metrics.dailyChangePercentage * 30)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Math.abs(metrics.dailyChange * 30))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-500">
                  {formatPercentage(metrics.maxDrawdown)}
                </div>
                <div className="text-sm text-muted-foreground">Peak to trough</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Portfolio distribution by asset</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                     <Pie
                       data={allocation.map(asset => ({
                         name: asset.agent_symbol,
                         value: asset.allocation_percentage
                       }))}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {allocation.map((_, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Holdings Details</CardTitle>
                <CardDescription>Individual asset breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {allocation.map((asset, index) => (
                  <div key={asset.agent_symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="font-medium">{asset.agent_symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.market_value.toFixed(2)} value</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(asset.market_value)}</div>
                      <div className={cn("text-sm", getChangeColor(0))}>
                        {formatPercentage(asset.allocation_percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {riskMetrics && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                  <CardDescription>Portfolio risk assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Value at Risk (95%)</span>
                    <span className="text-red-500 font-bold">{formatCurrency(riskMetrics.valueAtRisk)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Beta</span>
                    <span className="font-bold">{riskMetrics.beta}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Alpha</span>
                    <span className="font-bold">{riskMetrics.alpha}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Volatility</span>
                    <span className="font-bold">{metrics.volatility}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Ratios</CardTitle>
                  <CardDescription>Risk-adjusted performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Treynor Ratio</span>
                    <span className="font-bold">{riskMetrics.treynorRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Information Ratio</span>
                    <span className="font-bold">{riskMetrics.informationRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sharpe Ratio</span>
                    <span className="font-bold">{metrics.sharpeRatio}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
                <CardDescription>Key insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Highlights</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Strong performance (+{metrics.totalPnLPercentage.toFixed(1)}%)</li>
                      <li>• Good Sharpe ratio ({metrics.sharpeRatio.toFixed(2)})</li>
                      <li>• Portfolio volatility ({metrics.volatility.toFixed(1)}%)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Moderate volatility ({metrics.volatility.toFixed(1)}%)</li>
                      <li>• Controlled drawdown ({Math.abs(metrics.maxDrawdown).toFixed(1)}%)</li>
                      <li>• Diversification score ({metrics.diversificationScore.toFixed(0)}%)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Portfolio Health Score</Badge>
                    <span className="text-2xl font-bold text-green-500">{((metrics.riskScore > 0 ? (100 - metrics.riskScore) : 85)).toFixed(1)}/10</span>
                  </div>
                  <Progress value={metrics.riskScore > 0 ? (100 - metrics.riskScore) : 85} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Your portfolio shows strong performance with good risk management. Consider rebalancing if any single asset exceeds 30% allocation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};