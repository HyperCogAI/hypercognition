import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Droplets, TrendingUp, TrendingDown, Clock, AlertTriangle, Activity } from 'lucide-react'

interface LiquidityMetrics {
  symbol: string
  bidAskSpread: number
  spreadPercentage: number
  marketDepth: number
  liquidityScore: number
  volumeProfile: {
    price: number
    volume: number
    percentage: number
  }[]
  orderBookImbalance: number
  averageTradeSize: number
  tradeFrequency: number
}

interface LiquidityAlert {
  type: 'low' | 'high' | 'imbalance'
  message: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: Date
}

export const LiquidityAnalyzer: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')
  const [metrics, setMetrics] = useState<LiquidityMetrics | null>(null)
  const [alerts, setAlerts] = useState<LiquidityAlert[]>([])
  const [historicalSpread, setHistoricalSpread] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const analyzeLiquidity = () => {
      setIsAnalyzing(true)
      
      // Generate mock liquidity data
      const basePrice = 65000
      const spread = Math.random() * 10 + 2
      const spreadPercentage = (spread / basePrice) * 100
      
      const volumeProfile = Array.from({ length: 20 }, (_, i) => {
        const priceLevel = basePrice - 100 + (i * 10)
        const volume = Math.random() * 10000 + 1000
        return {
          price: priceLevel,
          volume,
          percentage: Math.random() * 100
        }
      })

      const newMetrics: LiquidityMetrics = {
        symbol: selectedSymbol,
        bidAskSpread: spread,
        spreadPercentage,
        marketDepth: Math.random() * 5000000 + 1000000,
        liquidityScore: Math.random() * 40 + 60, // 60-100 scale
        volumeProfile,
        orderBookImbalance: (Math.random() - 0.5) * 20, // -10 to +10
        averageTradeSize: Math.random() * 50000 + 5000,
        tradeFrequency: Math.random() * 100 + 20
      }

      setMetrics(newMetrics)

      // Generate alerts
      const newAlerts: LiquidityAlert[] = []
      
      if (spreadPercentage > 0.05) {
        newAlerts.push({
          type: 'low',
          message: 'High bid-ask spread detected',
          severity: 'warning',
          timestamp: new Date()
        })
      }

      if (Math.abs(newMetrics.orderBookImbalance) > 15) {
        newAlerts.push({
          type: 'imbalance',
          message: 'Significant order book imbalance',
          severity: 'critical',
          timestamp: new Date()
        })
      }

      if (newMetrics.liquidityScore < 70) {
        newAlerts.push({
          type: 'low',
          message: 'Low liquidity conditions',
          severity: 'warning',
          timestamp: new Date()
        })
      }

      setAlerts(newAlerts)
      setIsAnalyzing(false)
    }

    analyzeLiquidity()
    const interval = setInterval(analyzeLiquidity, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [selectedSymbol])

  useEffect(() => {
    // Generate historical spread data
    const generateHistoricalData = () => {
      const data = []
      for (let i = 23; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000)
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          spread: Math.random() * 15 + 2,
          volume: Math.random() * 1000000 + 500000,
          liquidity: Math.random() * 40 + 60
        })
      }
      return data
    }

    setHistoricalSpread(generateHistoricalData())
  }, [selectedSymbol])

  const getLiquidityColor = (score: number) => {
    if (score >= 85) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-destructive'
  }

  const getLiquidityBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-success text-success-foreground">High</Badge>
    if (score >= 70) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="destructive">Low</Badge>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            Liquidity Analyzer
          </h2>
          <p className="text-muted-foreground">Real-time market liquidity analysis and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant={isAnalyzing ? "secondary" : "default"} className="flex items-center gap-1">
            <Activity className={`h-3 w-3 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analyzing' : 'Live'}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-destructive' : 
              alert.severity === 'warning' ? 'border-l-warning' : 'border-l-primary'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.severity === 'critical' ? 'text-destructive' : 
                      alert.severity === 'warning' ? 'text-warning' : 'text-primary'
                    }`} />
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Liquidity Score</span>
              </div>
              <div className={`text-2xl font-bold ${getLiquidityColor(metrics.liquidityScore)}`}>
                {metrics.liquidityScore.toFixed(1)}/100
              </div>
              {getLiquidityBadge(metrics.liquidityScore)}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Bid-Ask Spread</span>
              </div>
              <div className="text-2xl font-bold">
                ${metrics.bidAskSpread.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.spreadPercentage.toFixed(4)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Market Depth</span>
              </div>
              <div className="text-2xl font-bold">
                ${formatNumber(metrics.marketDepth)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total orderbook
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Trade Frequency</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics.tradeFrequency.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Trades/hour
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="volume">Volume Profile</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Book Imbalance</CardTitle>
                  <CardDescription>
                    Measures buying vs selling pressure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Imbalance:</span>
                      <span className={`font-bold ${
                        metrics.orderBookImbalance > 5 ? 'text-success' :
                        metrics.orderBookImbalance < -5 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {metrics.orderBookImbalance > 0 ? '+' : ''}{metrics.orderBookImbalance.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={50 + metrics.orderBookImbalance * 2.5} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sell Pressure</span>
                      <span>Balanced</span>
                      <span>Buy Pressure</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trade Statistics</CardTitle>
                  <CardDescription>
                    Market activity metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Trade Size:</span>
                    <span className="font-mono">${formatNumber(metrics.averageTradeSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade Frequency:</span>
                    <span className="font-mono">{metrics.tradeFrequency.toFixed(0)}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Impact:</span>
                    <span className="font-mono">
                      {(metrics.spreadPercentage * 100).toFixed(2)} bps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity Rating:</span>
                    {getLiquidityBadge(metrics.liquidityScore)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="volume">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Volume Profile</CardTitle>
                <CardDescription>
                  Volume distribution across price levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={metrics.volumeProfile}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="price" />
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(value), 'Volume']}
                      labelFormatter={(price: any) => `Price: $${price}`}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historical">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spread History</CardTitle>
                <CardDescription>
                  Bid-ask spread over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalSpread}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Spread']} />
                    <Line 
                      type="monotone" 
                      dataKey="spread" 
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
                <CardTitle>Liquidity Trends</CardTitle>
                <CardDescription>
                  Liquidity score over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalSpread}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value: any) => [value.toFixed(1), 'Liquidity Score']} />
                    <Line 
                      type="monotone" 
                      dataKey="liquidity" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}