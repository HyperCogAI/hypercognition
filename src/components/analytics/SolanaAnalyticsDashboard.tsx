import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Zap } from "lucide-react"

export const SolanaAnalyticsDashboard = () => {
  const { tokens, isLoading } = useSolanaRealtime()
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'market_cap'>('price')

  // Calculate analytics data
  const totalMarketCap = tokens.reduce((sum, token) => sum + token.market_cap, 0)
  const totalVolume = tokens.reduce((sum, token) => sum + token.volume_24h, 0)
  const averageChange = tokens.reduce((sum, token) => sum + token.change_24h, 0) / tokens.length
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

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMarketCap)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {tokens.length} tokens
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              Trading volume
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Avg Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              24h average
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Active Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokens.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="dominance">Market Dominance</TabsTrigger>
          <TabsTrigger value="gainers">Top Movers</TabsTrigger>
          <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey={selectedMetric === 'volume' ? 'volume_24h' : selectedMetric === 'market_cap' ? 'market_cap' : 'price'} 
                      fill="hsl(var(--primary))" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 mt-4">
                {(['price', 'volume', 'market_cap'] as const).map((metric) => (
                  <Badge
                    key={metric}
                    variant={selectedMetric === metric ? "default" : "outline"}
                    className="cursor-pointer"
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketDominance}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {marketDominance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Market Cap']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gainers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div key={token.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-muted-foreground">${token.price.toFixed(4)}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
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
                    <div key={token.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-muted-foreground">${token.price.toFixed(4)}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.sort((a, b) => b.volume_24h - a.volume_24h)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}M`, 'Volume']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="volume_24h" fill="hsl(var(--primary))" />
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