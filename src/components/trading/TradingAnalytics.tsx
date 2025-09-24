import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Target, Calendar, DollarSign } from 'lucide-react'

interface TradingMetrics {
  totalTrades: number
  winRate: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  maxDrawdown: number
  sharpeRatio: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
}

interface TradeData {
  date: string
  pnl: number
  cumulative: number
  trades: number
  winRate: number
}

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))']

export const TradingAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<TradingMetrics>({
    totalTrades: 245,
    winRate: 68.5,
    profitFactor: 1.85,
    averageWin: 125.50,
    averageLoss: -78.25,
    maxDrawdown: -12.5,
    sharpeRatio: 1.42,
    totalPnL: 8750.25,
    bestTrade: 850.00,
    worstTrade: -320.00
  })

  const [timeframe, setTimeframe] = useState('1M')
  const [performanceData, setPerformanceData] = useState<TradeData[]>([])

  useEffect(() => {
    // Generate mock performance data
    const generateData = () => {
      const data: TradeData[] = []
      let cumulative = 0
      
      for (let i = 0; i < 30; i++) {
        const dailyPnL = (Math.random() - 0.4) * 200
        cumulative += dailyPnL
        
        data.push({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pnl: dailyPnL,
          cumulative: cumulative,
          trades: Math.floor(Math.random() * 10) + 1,
          winRate: Math.random() * 40 + 50
        })
      }
      
      return data
    }

    setPerformanceData(generateData())
  }, [timeframe])

  const assetPerformance = [
    { name: 'BTC', trades: 85, pnl: 3200, winRate: 72 },
    { name: 'ETH', trades: 64, pnl: 2100, winRate: 65 },
    { name: 'SOL', trades: 48, pnl: 1850, winRate: 70 },
    { name: 'BNB', trades: 32, pnl: 980, winRate: 63 },
    { name: 'ADA', trades: 16, pnl: 620, winRate: 69 }
  ]

  const strategyPerformance = [
    { name: 'Trend Following', value: 35, pnl: 3200 },
    { name: 'Mean Reversion', value: 25, pnl: 2100 },
    { name: 'Breakout', value: 20, pnl: 1800 },
    { name: 'Scalping', value: 20, pnl: 1650 }
  ]

  const monthlyStats = [
    { month: 'Jan', trades: 52, pnl: 1200, winRate: 65 },
    { month: 'Feb', trades: 48, pnl: 980, winRate: 70 },
    { month: 'Mar', trades: 61, pnl: 1450, winRate: 68 },
    { month: 'Apr', trades: 45, pnl: 820, winRate: 62 },
    { month: 'May', trades: 39, pnl: 4300, winRate: 75 }
  ]

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-destructive'
  }

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-success'
    if (rate >= 60) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Trades</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <div className="text-sm text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Win Rate</span>
            </div>
            <div className={`text-2xl font-bold ${getWinRateColor(metrics.winRate)}`}>
              {metrics.winRate}%
            </div>
            <Progress value={metrics.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.totalPnL)}`}>
              ${metrics.totalPnL.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {metrics.totalPnL >= 0 ? 
                <TrendingUp className="h-4 w-4 text-success" /> : 
                <TrendingDown className="h-4 w-4 text-destructive" />
              }
              <span>Profit Factor: {metrics.profitFactor}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {metrics.maxDrawdown}%
            </div>
            <div className="text-sm text-muted-foreground">
              Sharpe: {metrics.sharpeRatio}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cumulative P&L</CardTitle>
                <CardDescription>Daily performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'cumulative' ? `$${value.toFixed(2)}` : value.toFixed(2),
                        name === 'cumulative' ? 'Cumulative P&L' : 'Daily P&L'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Trades and P&L by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        name === 'pnl' ? `$${value}` : value,
                        name === 'pnl' ? 'P&L' : name === 'trades' ? 'Trades' : 'Win Rate'
                      ]}
                    />
                    <Bar dataKey="pnl" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Asset Performance</CardTitle>
              <CardDescription>Performance breakdown by trading pair</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetPerformance.map((asset, index) => (
                  <div key={asset.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{asset.name}</span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}/USDT</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.trades} trades
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getPerformanceColor(asset.pnl)}`}>
                        ${asset.pnl.toLocaleString()}
                      </div>
                      <div className={`text-sm ${getWinRateColor(asset.winRate)}`}>
                        {asset.winRate}% win rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Distribution</CardTitle>
                <CardDescription>Trading strategies by allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={strategyPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {strategyPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
                <CardDescription>P&L by trading strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategyPerformance.map((strategy, index) => (
                    <div key={strategy.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{strategy.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getPerformanceColor(strategy.pnl)}`}>
                          ${strategy.pnl.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {strategy.value}% allocation
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Statistics</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Win:</span>
                  <span className="text-success">${metrics.averageWin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Loss:</span>
                  <span className="text-destructive">${metrics.averageLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Trade:</span>
                  <span className="text-success">${metrics.bestTrade}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Trade:</span>
                  <span className="text-destructive">${metrics.worstTrade}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor:</span>
                  <span className={getPerformanceColor(metrics.profitFactor - 1)}>
                    {metrics.profitFactor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio:</span>
                  <span>{metrics.sharpeRatio}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>Risk and drawdown analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Max Drawdown:</span>
                    <span className="text-destructive">{metrics.maxDrawdown}%</span>
                  </div>
                  <Progress value={Math.abs(metrics.maxDrawdown)} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Win Rate:</span>
                    <span className={getWinRateColor(metrics.winRate)}>{metrics.winRate}%</span>
                  </div>
                  <Progress value={metrics.winRate} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Risk Grade:</span>
                    <Badge variant="secondary">B+</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Consistency:</span>
                    <Badge className="bg-success text-success-foreground">High</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility:</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}