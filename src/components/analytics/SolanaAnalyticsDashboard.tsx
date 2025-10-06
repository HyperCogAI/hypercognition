import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAnalytics } from "@/hooks/useAnalytics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Zap } from "lucide-react"
import { RealTechnicalAnalysisService } from '@/services/RealTechnicalAnalysisService'
import { RealMarketSentimentService } from '@/services/RealMarketSentimentService'

export const SolanaAnalyticsDashboard = () => {
  const { topAgents: tokens, marketStats, isLoading, formatCurrency } = useAnalytics()
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'market_cap'>('price')
  const [enhancedAnalytics, setEnhancedAnalytics] = useState<any>(null)
  const [sentiment, setSentiment] = useState<any>(null)

  useEffect(() => {
    const fetchEnhancedData = async () => {
      try {
        const [sentimentData, onChainMetrics] = await Promise.all([
          RealMarketSentimentService.getSentimentData(),
          RealMarketSentimentService.getOnChainMetrics()
        ]);
        setSentiment(sentimentData);
        setEnhancedAnalytics(onChainMetrics);
      } catch (error) {
        console.error('Error fetching enhanced analytics:', error);
      }
    };
    fetchEnhancedData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEnhancedData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate analytics data with enhanced metrics
  const totalMarketCap = marketStats.totalMarketCap
  const totalVolume = marketStats.totalVolume24h
  const averageChange = marketStats.avgChange24h
  const topGainers = tokens.filter(t => t.change_24h > 0).slice(0, 5)
  const topLosers = tokens.filter(t => t.change_24h < 0).slice(0, 5)

  // Market dominance data for pie chart
  const marketDominance = tokens.slice(0, 6).map((token, index) => ({
    name: token.symbol,
    value: token.market_cap,
    percentage: (token.market_cap / totalMarketCap) * 100,
    color: `hsl(${index * 60}, 70%, 50%)`
  }))

  // Performance chart data
  const performanceData = tokens.slice(0, 10).map(token => ({
    symbol: token.symbol,
    price: token.price,
    change_24h: token.change_24h,
    volume_24h: token.volume_24h / 1e6, // Convert to millions
    market_cap: token.market_cap / 1e9 // Convert to billions
  }))


  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMarketCap)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {tokens.length} tokens
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trading volume
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Avg Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              24h average
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Active Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokens.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="w-full !grid grid-cols-2 gap-1 p-1 !h-auto md:!inline-flex md:h-10 md:gap-2 md:flex-nowrap">
          <TabsTrigger value="performance" className="w-full text-sm px-3 py-2 md:w-auto md:px-4 md:py-1.5">
            Performance
          </TabsTrigger>
          <TabsTrigger value="dominance" className="w-full text-sm px-3 py-2 md:w-auto md:px-4 md:py-1.5">
            Dominance
          </TabsTrigger>
          <TabsTrigger value="gainers" className="w-full text-sm px-3 py-2 md:w-auto md:px-4 md:py-1.5">
            Top Movers
          </TabsTrigger>
          <TabsTrigger value="volume" className="w-full text-sm px-3 py-2 md:w-auto md:px-4 md:py-1.5">
            Volume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Token Performance Comparison
              </CardTitle>
              <CardDescription>
                Compare price, volume, and market cap across top tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickMargin={8}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickMargin={8}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey={selectedMetric === 'volume' ? 'volume_24h' : selectedMetric === 'market_cap' ? 'market_cap' : 'price'} 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {(['price', 'volume', 'market_cap'] as const).map((metric) => (
                  <Badge
                    key={metric}
                    variant={selectedMetric === metric ? "default" : "outline"}
                    className="cursor-pointer text-xs px-3 py-1"
                    onClick={() => setSelectedMetric(metric)}
                  >
                    {metric === 'volume' ? 'Volume (M)' : metric === 'market_cap' ? 'Market Cap (B)' : 'Price ($)'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominance" className="space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Market Dominance</CardTitle>
              <CardDescription>
                Market share by market capitalization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
                {marketDominance.slice(0, 4).map((entry) => (
                  <Card 
                    key={entry.name}
                    className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    style={{
                      borderColor: entry.color + '30',
                    }}
                  >
                    <CardContent className="p-5 md:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: entry.color }}>
                          {entry.name}
                        </span>
                      </div>
                      <div 
                        className="text-3xl md:text-4xl font-bold mb-2" 
                        style={{ color: entry.color }}
                      >
                        {entry.percentage.toFixed(0)}%
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {formatCurrency(entry.value)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {marketDominance.slice(4).map((entry) => (
                  <Card 
                    key={entry.name}
                    className="hidden lg:block border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    style={{
                      borderColor: entry.color + '30',
                    }}
                  >
                    <CardContent className="p-5 md:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: entry.color }}>
                          {entry.name}
                        </span>
                      </div>
                      <div 
                        className="text-3xl md:text-4xl font-bold mb-2" 
                        style={{ color: entry.color }}
                      >
                        {entry.percentage.toFixed(0)}%
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {formatCurrency(entry.value)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gainers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGainers.map((token, index) => (
                    <div key={token.id} className="flex items-center justify-between p-3 md:p-4 bg-background/50 rounded-lg hover:bg-background/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-sm md:text-base">{token.symbol}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">${token.price.toFixed(4)}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500 text-xs md:text-sm px-2 md:px-3">
                        +{token.change_24h.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <TrendingDown className="h-5 w-5" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLosers.map((token, index) => (
                    <div key={token.id} className="flex items-center justify-between p-3 md:p-4 bg-background/50 rounded-lg hover:bg-background/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-sm md:text-base">{token.symbol}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">${token.price.toFixed(4)}</p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs md:text-sm px-2 md:px-3">
                        {token.change_24h.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Volume Analysis</CardTitle>
              <CardDescription>
                24h trading volume by token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.sort((a, b) => b.volume_24h - a.volume_24h)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickMargin={8}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickMargin={8}
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}M`, 'Volume']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="volume_24h" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}