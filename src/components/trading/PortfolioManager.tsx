import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
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
  const { toast } = useToast()

  useEffect(() => {
    // Generate mock portfolio data
    const mockAssets: Asset[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: 0.5,
        value: 32500,
        price: 65000,
        change24h: 1200,
        allocation: 45,
        targetAllocation: 40
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 8.2,
        value: 20500,
        price: 2500,
        change24h: -150,
        allocation: 28,
        targetAllocation: 30
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: 45,
        value: 9000,
        price: 200,
        change24h: 400,
        allocation: 12,
        targetAllocation: 15
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        balance: 12,
        value: 6000,
        price: 500,
        change24h: -100,
        allocation: 8,
        targetAllocation: 10
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        balance: 5000,
        value: 5000,
        price: 1,
        change24h: 0,
        allocation: 7,
        targetAllocation: 5
      }
    ]

    const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0)
    const totalChange = mockAssets.reduce((sum, asset) => sum + asset.change24h, 0)

    setAssets(mockAssets)
    setMetrics({
      totalValue,
      totalChange24h: totalChange,
      totalChangePercent: (totalChange / totalValue) * 100,
      diversificationScore: 8.5,
      sharpeRatio: 1.8,
      maxDrawdown: -15.2
    })
  }, [])

  const rebalancePortfolio = async () => {
    setIsRebalancing(true)
    
    // Simulate rebalancing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update allocations to match targets
    const rebalancedAssets = assets.map(asset => ({
      ...asset,
      allocation: asset.targetAllocation || asset.allocation
    }))
    
    setAssets(rebalancedAssets)
    setIsRebalancing(false)
    
    toast({
      title: "Portfolio Rebalanced",
      description: "Your portfolio has been rebalanced to target allocations",
    })
  }

  const getRebalanceRecommendations = () => {
    return assets.filter(asset => {
      const deviation = Math.abs((asset.allocation || 0) - (asset.targetAllocation || 0))
      return deviation > rebalanceThreshold
    })
  }

  const pieData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.allocation,
    actualValue: asset.value
  }))

  const performanceData = [
    { name: '1W', value: 2.5 },
    { name: '1M', value: 8.2 },
    { name: '3M', value: 15.7 },
    { name: '6M', value: 32.1 },
    { name: '1Y', value: 125.6 }
  ]

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <div className="text-2xl font-bold">
              ${metrics?.totalValue.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              (metrics?.totalChangePercent || 0) >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {(metrics?.totalChangePercent || 0) >= 0 ? 
                <TrendingUp className="h-4 w-4" /> : 
                <TrendingDown className="h-4 w-4" />
              }
              {metrics?.totalChangePercent.toFixed(2)}% (${metrics?.totalChange24h.toLocaleString()})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.sharpeRatio}</div>
            <div className="text-sm text-muted-foreground">Risk-adjusted return</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {metrics?.maxDrawdown}%
            </div>
            <div className="text-sm text-muted-foreground">Worst decline</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Diversification</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.diversificationScore}/10</div>
            <div className="text-sm text-success">Well diversified</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalance</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Allocation</CardTitle>
                <CardDescription>Portfolio distribution by asset</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value}% ($${props.payload.actualValue.toLocaleString()})`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation vs Target</CardTitle>
                <CardDescription>Current vs target allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <div key={asset.symbol} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{asset.symbol}</span>
                        <span>{asset.allocation}% / {asset.targetAllocation}%</span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={asset.allocation} className="h-2" />
                        <Progress 
                          value={asset.targetAllocation} 
                          className="h-1 opacity-50" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical returns over different periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalance">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Rebalancing</CardTitle>
              <CardDescription>Maintain target allocations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Rebalance Threshold: {rebalanceThreshold}%</span>
                <Button
                  onClick={rebalancePortfolio}
                  disabled={isRebalancing || getRebalanceRecommendations().length === 0}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRebalancing ? 'animate-spin' : ''}`} />
                  {isRebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}
                </Button>
              </div>

              {getRebalanceRecommendations().length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Rebalance Recommendations:</h4>
                  {getRebalanceRecommendations().map(asset => {
                    const deviation = (asset.allocation || 0) - (asset.targetAllocation || 0)
                    return (
                      <div key={asset.symbol} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{asset.symbol}</span>
                        <Badge variant={deviation > 0 ? "destructive" : "default"}>
                          {deviation > 0 ? 'Overweight' : 'Underweight'} by {Math.abs(deviation).toFixed(1)}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Asset Holdings</CardTitle>
              <CardDescription>Detailed view of portfolio assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map(asset => (
                  <div key={asset.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{asset.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.balance} {asset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${asset.value.toLocaleString()}</div>
                      <div className={`text-sm ${asset.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {asset.change24h >= 0 ? '+' : ''}${asset.change24h.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}