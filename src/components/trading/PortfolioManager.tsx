import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { RealPortfolioService } from '@/services/RealPortfolioService'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Target, AlertTriangle, DollarSign } from 'lucide-react'

interface Asset {
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
  targetAllocation?: number
}

interface PortfolioMetrics {
  totalValue: number
  totalChange24h: number
  totalChangePercent: number
  diversificationScore: number
  sharpeRatio: number
  maxDrawdown: number
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

export const PortfolioManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      const [holdings, portfolioMetrics] = await Promise.all([
        RealPortfolioService.getPortfolioHoldings('current_user'),
        RealPortfolioService.calculatePortfolioMetrics('current_user')
      ]);

      // Transform holdings to assets format
      const transformedAssets: Asset[] = holdings.map(holding => ({
        symbol: holding.agent_symbol,
        name: `Agent ${holding.agent_symbol}`,
        balance: holding.amount,
        value: holding.market_value,
        price: holding.current_price,
        change24h: holding.pnl,
        allocation: holding.allocation_percentage
      }));

      setAssets(transformedAssets);
      setMetrics({
        totalValue: portfolioMetrics.totalValue,
        totalChange24h: portfolioMetrics.dailyChange,
        totalChangePercent: portfolioMetrics.dailyChangePercentage,
        diversificationScore: portfolioMetrics.diversificationScore,
        sharpeRatio: portfolioMetrics.sharpeRatio,
        maxDrawdown: portfolioMetrics.maxDrawdown
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rebalancePortfolio = async () => {
    setIsRebalancing(true)
    try {
      // Simulate rebalancing process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update assets with new allocations
      const rebalancedAssets = assets.map(asset => ({
        ...asset,
        allocation: asset.targetAllocation || asset.allocation
      }))
      
      setAssets(rebalancedAssets)
      toast({
        title: "Portfolio Rebalanced",
        description: "Your portfolio has been successfully rebalanced to target allocations."
      })
    } catch (error) {
      toast({
        title: "Rebalancing Failed",
        description: "There was an error rebalancing your portfolio. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRebalancing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getChangeIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  const needsRebalancing = assets.some(asset => 
    asset.targetAllocation && Math.abs(asset.allocation - asset.targetAllocation) > rebalanceThreshold
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Manager</h2>
          <p className="text-muted-foreground">Manage and optimize your portfolio allocation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPortfolioData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {needsRebalancing && (
            <Button 
              onClick={rebalancePortfolio} 
              disabled={isRebalancing}
              size="sm"
            >
              {isRebalancing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rebalancing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Rebalance
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
            <div className={`text-xs flex items-center gap-1 ${getChangeColor(metrics.totalChange24h)}`}>
              {getChangeIcon(metrics.totalChange24h)}
              {formatCurrency(Math.abs(metrics.totalChange24h))} ({formatPercentage(metrics.totalChangePercent)})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.diversificationScore.toFixed(0)}/100</div>
            <Progress value={metrics.diversificationScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatPercentage(metrics.maxDrawdown)}</div>
            <div className="text-xs text-muted-foreground">Worst performance period</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Portfolio Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Current asset distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assets}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="allocation"
                    >
                      {assets.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
                <CardDescription>Your current positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assets.map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground">{asset.balance.toFixed(4)} tokens</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(asset.value)}</div>
                        <div className={`text-sm ${getChangeColor(asset.change24h)}`}>
                          {formatPercentage((asset.change24h / asset.value) * 100)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation Management</CardTitle>
              <CardDescription>Set target allocations and rebalance your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div key={asset.symbol} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{asset.symbol}</span>
                      </div>
                      <div className="text-sm">
                        Current: {asset.allocation.toFixed(1)}%
                        {asset.targetAllocation && ` | Target: ${asset.targetAllocation}%`}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={asset.allocation} className="h-2" />
                      {asset.targetAllocation && (
                        <Progress value={asset.targetAllocation} className="h-1 opacity-50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {needsRebalancing && (
                <div className="mt-6 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-600">Rebalancing Recommended</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Some assets have drifted more than {rebalanceThreshold}% from their target allocation.
                  </p>
                  <Button 
                    onClick={rebalancePortfolio} 
                    disabled={isRebalancing}
                    size="sm"
                    className="w-full"
                  >
                    {isRebalancing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Rebalancing Portfolio...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Rebalance Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical returns over different periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[]}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">1 Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${getChangeColor(metrics.totalChange24h)}`}>
                  {formatPercentage(metrics.totalChangePercent)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Math.abs(metrics.totalChange24h))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">7 Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-500">+8.4%</div>
                <div className="text-sm text-muted-foreground">+$6,840</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">30 Day Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-500">+15.7%</div>
                <div className="text-sm text-muted-foreground">+$12,780</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}