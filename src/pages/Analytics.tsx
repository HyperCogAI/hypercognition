import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAnalytics } from "@/hooks/useAnalytics"

export const Analytics = () => {
  const navigate = useNavigate()
  const { priceData, topAgents, marketStats, isLoading, formatCurrency } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Analytics</h1>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Market Cap</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(marketStats.totalMarketCap)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                {marketStats.avgChange24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={marketStats.avgChange24h >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {marketStats.avgChange24h >= 0 ? "+" : ""}{marketStats.avgChange24h.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">avg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>24h Volume</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(marketStats.totalVolume24h)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Trading volume
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Agents</CardDescription>
              <CardTitle className="text-2xl">{marketStats.activeAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                AI agents
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Market Trend</CardDescription>
              <CardTitle className={`text-2xl ${marketStats.avgChange24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {marketStats.avgChange24h >= 0 ? 'Bullish' : 'Bearish'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Market sentiment
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
            <TabsTrigger value="agents">Top Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Market Cap Trends</CardTitle>
                <CardDescription>
                  Historical market capitalization across all agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value, name) => [
                          formatCurrency(Number(value)), 
                          'Total Market Cap'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="market_cap" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Volume Analysis</CardTitle>
                <CardDescription>
                  Trading volume patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Volume']}
                      />
                      <Bar 
                        dataKey="volume" 
                        fill="hsl(var(--primary))" 
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <div className="space-y-4">
              {topAgents.map((agent, index) => (
                <Card key={agent.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agent.avatar_url} alt={agent.name} />
                        <AvatarFallback>{agent.symbol}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.symbol}</div>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(agent.market_cap)}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {agent.change_24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={agent.change_24h >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {agent.change_24h >= 0 ? "+" : ""}{agent.change_24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}