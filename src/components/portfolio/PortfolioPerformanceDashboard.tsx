import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePortfolioPerformance } from '@/hooks/usePortfolioPerformance';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, RefreshCw, PieChart, BarChart3, Activity, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const PortfolioPerformanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { metrics, allocation, history, riskMetrics, isLoading, refreshData } = usePortfolioPerformance(user?.id);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '7D' | '30D'>('30D');

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
            <div className={cn("text-xs flex items-center gap-1", getChangeColor(metrics.dailyChange))}>
              {getChangeIcon(metrics.dailyChange)}
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
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalReturn)}</div>
            <div className={cn("text-xs", getChangeColor(metrics.totalReturn))}>
              {formatPercentage(metrics.totalReturnPercentage)} all time
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
            <div className="text-2xl font-bold">{metrics.winRate}%</div>
            <div className="text-xs text-muted-foreground">Successful trades</div>
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
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
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
                <div className={cn("text-xl font-bold", getChangeColor(metrics.weeklyChange))}>
                  {formatPercentage(metrics.weeklyChangePercentage)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Math.abs(metrics.weeklyChange))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-bold", getChangeColor(metrics.monthlyChange))}>
                  {formatPercentage(metrics.monthlyChangePercentage)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Math.abs(metrics.monthlyChange))}
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
                      data={allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="percentage"
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
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.quantity} tokens</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(asset.value)}</div>
                      <div className={cn("text-sm", getChangeColor(asset.change24h))}>
                        {formatPercentage(asset.change24h)}
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
                      <li>• Strong monthly performance (+{metrics.monthlyChangePercentage.toFixed(1)}%)</li>
                      <li>• Excellent Sharpe ratio ({metrics.sharpeRatio})</li>
                      <li>• High win rate ({metrics.winRate}%)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Moderate volatility ({metrics.volatility}%)</li>
                      <li>• Controlled drawdown ({Math.abs(metrics.maxDrawdown)}%)</li>
                      <li>• Well-diversified portfolio</li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Portfolio Health Score</Badge>
                    <span className="text-2xl font-bold text-green-500">8.5/10</span>
                  </div>
                  <Progress value={85} className="w-full" />
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