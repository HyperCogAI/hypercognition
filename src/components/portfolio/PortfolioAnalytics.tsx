import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  PieChart, 
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347']

export function PortfolioAnalytics() {
  const {
    holdings,
    performanceHistory,
    portfolioMetrics,
    assetAllocation,
    rebalanceRecommendations,
    isLoading,
    timeframe,
    setTimeframe,
    exportPortfolioData
  } = usePortfolioAnalytics()

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!holdings?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
          <p className="text-muted-foreground mb-4">
            Start trading AI agents to see your portfolio analytics
          </p>
          <Button>Start Trading</Button>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low', color: 'bg-green-500', variant: 'default' as const }
    if (score < 70) return { label: 'Medium', color: 'bg-yellow-500', variant: 'secondary' as const }
    return { label: 'High', color: 'bg-red-500', variant: 'destructive' as const }
  }

  const riskLevel = portfolioMetrics ? getRiskLevel(portfolioMetrics.riskScore) : null

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of your AI agent investments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPortfolioData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className={`flex items-center ${portfolioMetrics.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioMetrics.dailyChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(portfolioMetrics.dailyChangePercentage)}
                </span>
                <span className="text-muted-foreground ml-1">today</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                  <p className={`text-2xl font-bold ${portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioMetrics.totalPnL)}
                  </p>
                </div>
                {portfolioMetrics.totalPnL >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="mt-2">
                <span className={`text-sm ${portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(portfolioMetrics.totalPnLPercentage)} total return
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{portfolioMetrics.riskScore.toFixed(0)}/100</p>
                    {riskLevel && <Badge variant={riskLevel.variant}>{riskLevel.label}</Badge>}
                  </div>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Progress value={portfolioMetrics.riskScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diversification</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.diversificationScore.toFixed(0)}/100</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Progress value={portfolioMetrics.diversificationScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Analysis */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'portfolio_value' ? formatCurrency(value) : formatPercentage(value),
                      name === 'portfolio_value' ? 'Portfolio Value' : 'Return %'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="portfolio_value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Portfolio Value"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative_return" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Cumulative Return %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Asset Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ agent_symbol, allocation_percentage }) => 
                      `${agent_symbol} ${allocation_percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="allocation_percentage"
                  >
                    {assetAllocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Rebalancing Recommendations */}
      {rebalanceRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Rebalancing Recommendations
              <Badge variant="secondary">{rebalanceRecommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rebalanceRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      rec.rebalance_action === 'buy' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{rec.agent_symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {rec.allocation_percentage.toFixed(1)}% | 
                        Target: {rec.target_allocation?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={rec.rebalance_action === 'buy' ? 'default' : 'destructive'}>
                      {rec.rebalance_action.toUpperCase()} {formatCurrency(rec.rebalance_amount || 0)}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button className="w-full">
                Apply Rebalancing Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Metrics */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <h4 className="font-medium mb-2">Sharpe Ratio</h4>
              <p className="text-2xl font-bold">{portfolioMetrics.sharpeRatio.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Risk-adjusted return</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h4 className="font-medium mb-2">Volatility</h4>
              <p className="text-2xl font-bold">{formatPercentage(portfolioMetrics.volatility)}</p>
              <p className="text-sm text-muted-foreground">Price fluctuation</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h4 className="font-medium mb-2">Max Drawdown</h4>
              <p className="text-2xl font-bold text-red-600">{formatPercentage(-portfolioMetrics.maxDrawdown)}</p>
              <p className="text-sm text-muted-foreground">Largest peak-to-trough decline</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}