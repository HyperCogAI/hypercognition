import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Target, TrendingUp, TrendingDown, DollarSign, Percent, Activity, Eye, X } from 'lucide-react'

interface Position {
  id: string
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  margin: number
  leverage: number
  openTime: Date
  stopLoss?: number
  takeProfit?: number
  fees: number
  fundingFees: number
  unrealizedPnl: number
  realizedPnl: number
  riskScore: number
}

interface PositionSummary {
  totalPositions: number
  longPositions: number
  shortPositions: number
  totalPnl: number
  totalMargin: number
  totalExposure: number
  marginUtilization: number
  avgLeverage: number
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--success))', 'hsl(var(--warning))']

export const PositionTracker: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [summary, setSummary] = useState<PositionSummary>({
    totalPositions: 0,
    longPositions: 0,
    shortPositions: 0,
    totalPnl: 0,
    totalMargin: 0,
    totalExposure: 0,
    marginUtilization: 0,
    avgLeverage: 0
  })
  const [pnlHistory, setPnlHistory] = useState<any[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  useEffect(() => {
    // Generate mock positions
    const mockPositions: Position[] = [
      {
        id: 'pos-1',
        symbol: 'BTC/USDT',
        side: 'long',
        size: 0.5,
        entryPrice: 63500,
        currentPrice: 65000,
        pnl: 750,
        pnlPercentage: 2.36,
        margin: 12700,
        leverage: 2.5,
        openTime: new Date(Date.now() - 3600000 * 6),
        stopLoss: 62000,
        takeProfit: 68000,
        fees: 31.75,
        fundingFees: 8.50,
        unrealizedPnl: 750,
        realizedPnl: 0,
        riskScore: 6.2
      },
      {
        id: 'pos-2',
        symbol: 'ETH/USDT',
        side: 'short',
        size: 5,
        entryPrice: 2650,
        currentPrice: 2580,
        pnl: 350,
        pnlPercentage: 2.64,
        margin: 5300,
        leverage: 2.5,
        openTime: new Date(Date.now() - 3600000 * 12),
        stopLoss: 2750,
        fees: 13.25,
        fundingFees: -5.20,
        unrealizedPnl: 350,
        realizedPnl: 0,
        riskScore: 5.8
      },
      {
        id: 'pos-3',
        symbol: 'SOL/USDT',
        side: 'long',
        size: 50,
        entryPrice: 195,
        currentPrice: 188,
        pnl: -350,
        pnlPercentage: -3.59,
        margin: 1950,
        leverage: 5,
        openTime: new Date(Date.now() - 3600000 * 2),
        stopLoss: 185,
        takeProfit: 210,
        fees: 48.75,
        fundingFees: 2.30,
        unrealizedPnl: -350,
        realizedPnl: 0,
        riskScore: 8.1
      }
    ]

    setPositions(mockPositions)

    // Calculate summary
    const longPos = mockPositions.filter(p => p.side === 'long').length
    const shortPos = mockPositions.filter(p => p.side === 'short').length
    const totalPnl = mockPositions.reduce((sum, p) => sum + p.pnl, 0)
    const totalMargin = mockPositions.reduce((sum, p) => sum + p.margin, 0)
    const totalExposure = mockPositions.reduce((sum, p) => sum + (p.size * p.currentPrice), 0)
    const avgLeverage = mockPositions.reduce((sum, p) => sum + p.leverage, 0) / mockPositions.length

    setSummary({
      totalPositions: mockPositions.length,
      longPositions: longPos,
      shortPositions: shortPos,
      totalPnl,
      totalMargin,
      totalExposure,
      marginUtilization: (totalMargin / 100000) * 100, // Assuming 100k total balance
      avgLeverage
    })

    // Generate PnL history
    const history = Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      pnl: Math.random() * 2000 - 500,
      cumulative: Math.random() * 5000 + 1000,
      unrealized: Math.random() * 1000 + 200,
      realized: Math.random() * 800 + 100
    })).reverse()

    setPnlHistory(history)
  }, [])

  const closePosition = (positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId))
  }

  const getPnlColor = (pnl: number) => pnl >= 0 ? 'text-success' : 'text-destructive'
  const getSideColor = (side: string) => side === 'long' ? 'text-success' : 'text-destructive'
  
  const getRiskBadge = (score: number) => {
    if (score <= 3) return <Badge className="bg-success text-success-foreground">Low</Badge>
    if (score <= 6) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="destructive">High</Badge>
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercentage = (percentage: number) => `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`

  const exposureData = positions.map(pos => ({
    name: pos.symbol,
    value: pos.size * pos.currentPrice,
    side: pos.side
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Position Tracker
          </h2>
          <p className="text-muted-foreground">Monitor and manage your open trading positions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Add Alert
          </Button>
          <Button variant="destructive" size="sm">
            <X className="h-4 w-4 mr-2" />
            Close All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Positions</span>
            </div>
            <div className="text-2xl font-bold">{summary.totalPositions}</div>
            <div className="text-xs text-muted-foreground">
              {summary.longPositions} Long • {summary.shortPositions} Short
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <div className={`text-2xl font-bold ${getPnlColor(summary.totalPnl)}`}>
              {formatCurrency(summary.totalPnl)}
            </div>
            <div className="text-xs text-muted-foreground">
              Unrealized P&L
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Margin Used</span>
            </div>
            <div className="text-2xl font-bold">{summary.marginUtilization.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalMargin)} / $100K
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Leverage</span>
            </div>
            <div className="text-2xl font-bold">{summary.avgLeverage.toFixed(1)}x</div>
            <div className="text-xs text-muted-foreground">
              Total Exposure: {formatCurrency(summary.totalExposure)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Open Positions</TabsTrigger>
          <TabsTrigger value="exposure">Exposure Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>
                Current trading positions with real-time P&L tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-11 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                  <div>Symbol</div>
                  <div>Side</div>
                  <div>Size</div>
                  <div>Entry Price</div>
                  <div>Mark Price</div>
                  <div>P&L</div>
                  <div>P&L %</div>
                  <div>Margin</div>
                  <div>Leverage</div>
                  <div>Risk</div>
                  <div>Actions</div>
                </div>

                {/* Position Rows */}
                {positions.map(position => (
                  <div key={position.id} className="grid grid-cols-11 gap-4 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="font-medium">{position.symbol}</div>
                    <div>
                      <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                        {position.side}
                      </Badge>
                    </div>
                    <div className="text-sm">{position.size}</div>
                    <div className="text-sm">{formatCurrency(position.entryPrice)}</div>
                    <div className="text-sm">{formatCurrency(position.currentPrice)}</div>
                    <div className={`font-medium ${getPnlColor(position.pnl)}`}>
                      {formatCurrency(position.pnl)}
                    </div>
                    <div className={`font-medium ${getPnlColor(position.pnl)}`}>
                      {formatPercentage(position.pnlPercentage)}
                    </div>
                    <div className="text-sm">{formatCurrency(position.margin)}</div>
                    <div className="text-sm">{position.leverage}x</div>
                    <div>
                      {getRiskBadge(position.riskScore)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => closePosition(position.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exposure">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Exposure</CardTitle>
                <CardDescription>Distribution of capital across positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={exposureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {exposureData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.side === 'long' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Exposure']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Margin Utilization</CardTitle>
                <CardDescription>Current margin usage across positions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Used Margin</span>
                    <span>{formatCurrency(summary.totalMargin)}</span>
                  </div>
                  <Progress value={summary.marginUtilization} />
                  <div className="text-xs text-muted-foreground mt-1">
                    {summary.marginUtilization.toFixed(1)}% of available margin
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Position Breakdown</h4>
                  {positions.map(pos => (
                    <div key={pos.id} className="flex justify-between items-center">
                      <span className="text-sm">{pos.symbol}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(pos.margin)}</div>
                        <div className="text-xs text-muted-foreground">{pos.leverage}x</div>
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
              <CardTitle>P&L Performance</CardTitle>
              <CardDescription>Historical performance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={pnlHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Cumulative P&L"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unrealized" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Unrealized P&L"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>Portfolio risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Portfolio Risk Score</span>
                    <span>6.7/10</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Leverage Risk</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={55} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Concentration Risk</span>
                    <span>Low</span>
                  </div>
                  <Progress value={30} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Correlation Risk</span>
                    <span>High</span>
                  </div>
                  <Progress value={85} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Limits</CardTitle>
                <CardDescription>Current limits and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Max Position Size:</span>
                  <span>$50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Daily Loss:</span>
                  <span>$5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Leverage:</span>
                  <span>10x</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Margin Usage:</span>
                  <span>80%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stop Loss Required:</span>
                  <Badge className="bg-success text-success-foreground">Yes</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}