import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Search, TrendingUp, DollarSign, Clock, AlertTriangle, Zap, Activity, Target } from 'lucide-react'

interface ArbitrageOpportunity {
  id: string
  symbol: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  spread: number
  spreadPercentage: number
  volume: number
  profitPotential: number
  riskScore: number
  timeToExpiry: number
  confidence: number
  minOrderSize: number
  maxOrderSize: number
  fees: {
    buy: number
    sell: number
    transfer: number
  }
}

interface ArbitrageStats {
  totalOpportunities: number
  avgSpread: number
  avgProfit: number
  successRate: number
  totalVolume: number
  activeStrategies: number
}

export const ArbitrageDetector: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [stats, setStats] = useState<ArbitrageStats>({
    totalOpportunities: 0,
    avgSpread: 0,
    avgProfit: 0,
    successRate: 0,
    totalVolume: 0,
    activeStrategies: 0
  })
  const [isScanning, setIsScanning] = useState(true)
  const [selectedMinSpread, setSelectedMinSpread] = useState(0.1)
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    const generateOpportunities = () => {
      const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT']
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX']
      
      const newOpportunities: ArbitrageOpportunity[] = []
      
      for (let i = 0; i < 15; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)]
        const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
        let sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
        while (sellExchange === buyExchange) {
          sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
        }
        
        const basePrice = Math.random() * 50000 + 100
        const spread = Math.random() * 500 + 50
        const buyPrice = basePrice
        const sellPrice = basePrice + spread
        const spreadPercentage = (spread / basePrice) * 100
        
        // Only include opportunities above minimum spread
        if (spreadPercentage >= selectedMinSpread) {
          newOpportunities.push({
            id: `arb-${i}`,
            symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            spread,
            spreadPercentage,
            volume: Math.random() * 1000000 + 10000,
            profitPotential: spread * (Math.random() * 10 + 1),
            riskScore: Math.random() * 10 + 1,
            timeToExpiry: Math.random() * 300 + 30, // seconds
            confidence: Math.random() * 40 + 60,
            minOrderSize: Math.random() * 100 + 10,
            maxOrderSize: Math.random() * 10000 + 1000,
            fees: {
              buy: Math.random() * 10 + 2,
              sell: Math.random() * 10 + 2,
              transfer: Math.random() * 20 + 5
            }
          })
        }
      }
      
      setOpportunities(newOpportunities)
      
      // Update stats
      setStats({
        totalOpportunities: newOpportunities.length,
        avgSpread: newOpportunities.reduce((sum, opp) => sum + opp.spreadPercentage, 0) / newOpportunities.length || 0,
        avgProfit: newOpportunities.reduce((sum, opp) => sum + opp.profitPotential, 0) / newOpportunities.length || 0,
        successRate: 85 + Math.random() * 10,
        totalVolume: newOpportunities.reduce((sum, opp) => sum + opp.volume, 0),
        activeStrategies: 3
      })
    }

    const generateHistoricalData = () => {
      const data = Array.from({ length: 24 }, (_, i) => ({
        hour: `${23 - i}h`,
        opportunities: Math.floor(Math.random() * 20) + 5,
        avgSpread: Math.random() * 2 + 0.5,
        profit: Math.random() * 1000 + 200,
        successRate: 80 + Math.random() * 15
      })).reverse()
      
      setHistoricalData(data)
    }

    generateOpportunities()
    generateHistoricalData()
    
    const interval = setInterval(generateOpportunities, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [selectedMinSpread])

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-success'
    if (score <= 6) return 'text-warning'
    return 'text-destructive'
  }

  const getRiskBadge = (score: number) => {
    if (score <= 3) return <Badge className="bg-success text-success-foreground">Low</Badge>
    if (score <= 6) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="destructive">High</Badge>
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success'
    if (confidence >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`
    return `${(seconds / 60).toFixed(1)}m`
  }

  const executeArbitrage = (opportunity: ArbitrageOpportunity) => {
    // Simulate execution
    console.log('Executing arbitrage for:', opportunity.symbol)
    // Remove opportunity from list
    setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Arbitrage Detector
          </h2>
          <p className="text-muted-foreground">Real-time cross-exchange arbitrage opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isScanning ? "default" : "outline"} className="flex items-center gap-1">
            <Activity className={`h-3 w-3 ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? 'Scanning' : 'Paused'}
          </Badge>
          <Button 
            variant={isScanning ? "destructive" : "default"}
            onClick={() => setIsScanning(!isScanning)}
          >
            {isScanning ? 'Pause Scanner' : 'Start Scanner'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Opportunities</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Spread</span>
            </div>
            <div className="text-2xl font-bold">{stats.avgSpread.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Profit</span>
            </div>
            <div className="text-2xl font-bold">${stats.avgProfit.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-success">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-2xl font-bold">${(stats.totalVolume / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Strategies</span>
            </div>
            <div className="text-2xl font-bold">{stats.activeStrategies}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Live Opportunities</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Live Arbitrage Opportunities</CardTitle>
              <CardDescription>
                Real-time opportunities sorted by profit potential. 
                Minimum spread: {selectedMinSpread}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No arbitrage opportunities found above the minimum spread threshold.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-10 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                    <div>Symbol</div>
                    <div>Buy Exchange</div>
                    <div>Sell Exchange</div>
                    <div>Buy Price</div>
                    <div>Sell Price</div>
                    <div>Spread</div>
                    <div>Profit</div>
                    <div>Risk</div>
                    <div>Confidence</div>
                    <div>Action</div>
                  </div>

                  {/* Opportunities */}
                  {opportunities
                    .sort((a, b) => b.profitPotential - a.profitPotential)
                    .map(opportunity => (
                      <div key={opportunity.id} className="grid grid-cols-10 gap-4 p-3 hover:bg-muted/50 rounded-lg">
                        <div className="font-medium">{opportunity.symbol}</div>
                        <div className="text-sm">{opportunity.buyExchange}</div>
                        <div className="text-sm">{opportunity.sellExchange}</div>
                        <div className="text-sm">${opportunity.buyPrice.toLocaleString()}</div>
                        <div className="text-sm">${opportunity.sellPrice.toLocaleString()}</div>
                        <div className="text-success font-medium">
                          {opportunity.spreadPercentage.toFixed(2)}%
                        </div>
                        <div className="text-success font-medium">
                          ${opportunity.profitPotential.toFixed(0)}
                        </div>
                        <div className="flex items-center gap-1">
                          {getRiskBadge(opportunity.riskScore)}
                        </div>
                        <div className={`text-sm ${getConfidenceColor(opportunity.confidence)}`}>
                          {opportunity.confidence.toFixed(0)}%
                        </div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => executeArbitrage(opportunity)}
                          >
                            Execute
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exchange Price Comparison</CardTitle>
                <CardDescription>Price differences across major exchanges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['BTC/USDT', 'ETH/USDT', 'SOL/USDT'].map(symbol => {
                    const exchanges = ['Binance', 'Coinbase', 'Kraken']
                    const prices = exchanges.map(() => Math.random() * 1000 + 30000)
                    const maxPrice = Math.max(...prices)
                    const minPrice = Math.min(...prices)
                    const spread = ((maxPrice - minPrice) / minPrice) * 100

                    return (
                      <div key={symbol} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{symbol}</span>
                          <span className="text-sm text-success">
                            Spread: {spread.toFixed(2)}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          {exchanges.map((exchange, i) => (
                            <div key={exchange} className="flex justify-between text-sm">
                              <span>{exchange}</span>
                              <span className={
                                prices[i] === maxPrice ? 'text-destructive' :
                                prices[i] === minPrice ? 'text-success' : ''
                              }>
                                ${prices[i].toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Risk factors for current opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Market Volatility</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={65} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Liquidity Risk</span>
                    <span>Low</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Transfer Time Risk</span>
                    <span>High</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Fee Impact</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={55} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historical Performance</CardTitle>
              <CardDescription>Arbitrage opportunities and profitability over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="opportunities" fill="hsl(var(--primary))" name="Opportunities" />
                  <Bar dataKey="profit" fill="hsl(var(--success))" name="Profit ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}