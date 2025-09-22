import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RealTimeTicker } from '@/components/trading/RealTimeTicker'
import { RealTimeOrderBook } from '@/components/trading/RealTimeOrderBook'
import { MarketTradesStream } from '@/components/trading/MarketTradesStream'
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { SEOHead } from '@/components/seo/SEOHead'
import { Activity, TrendingUp, Zap, RefreshCw } from 'lucide-react'

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
}

export function RealTimeMarketPage() {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get('agent')

  // Fetch agents for selection
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as Agent[]
    }
  })

  // Get real-time market data
  const { marketData, loading, getAgentData, refresh } = useRealTimeMarketData(
    agentId ? [agentId] : agents.map(a => a.id)
  )

  // Get agent info
  const selectedAgent = agentId ? agents.find(a => a.id === agentId) : agents[0]
  const agentMarketData = selectedAgent ? getAgentData(selectedAgent.id) : null

  // Function to generate market data
  const generateMarketData = async () => {
    try {
      const response = await supabase.functions.invoke('realtime-market-data')
      if (response.error) throw response.error
      
      // Refresh our local data
      await refresh()
    } catch (error) {
      console.error('Error generating market data:', error)
    }
  }

  return (
    <>
      <SEOHead
        title="Real-Time Market Data - Live Trading Dashboard"
        description="Monitor live market data with real-time order books, trade streams, and price tickers for AI agents."
        keywords="real-time trading, market data, order book, live prices, trading dashboard"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Real-Time Market Data</h1>
            <p className="text-muted-foreground">
              Live trading data with real-time updates and market insights
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateMarketData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Data
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                marketData.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-muted-foreground">
                {marketData.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {selectedAgent && (
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-lg px-3 py-1">
                {selectedAgent.symbol}
              </Badge>
              <h2 className="text-xl font-semibold">{selectedAgent.name}</h2>
              <div className="text-sm text-muted-foreground">
                {marketData.lastUpdate && (
                  <>Last update: {marketData.lastUpdate.toLocaleTimeString()}</>
                )}
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orderbook">Order Book</TabsTrigger>
            <TabsTrigger value="trades">Recent Trades</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RealTimeTicker
                  agentSymbol={selectedAgent?.symbol}
                  ticker={agentMarketData?.ticker}
                  loading={loading}
                />
              </div>
              
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <RealTimeOrderBook
                    symbol={selectedAgent?.symbol || ''}
                  />
                  
                  <MarketTradesStream
                    agentSymbol={selectedAgent?.symbol}
                    trades={agentMarketData?.recentTrades || []}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orderbook">
            <RealTimeOrderBook
              symbol={selectedAgent?.symbol || ''}
            />
          </TabsContent>

          <TabsContent value="trades">
            <MarketTradesStream
              agentSymbol={selectedAgent?.symbol}
              trades={agentMarketData?.recentTrades || []}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Market Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Advanced market analytics and insights coming soon...
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Volume Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          24h volume trends and patterns
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Price Movement</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time price change analysis
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Market Depth</h4>
                        <p className="text-sm text-muted-foreground">
                          Order book depth visualization
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Agent Selection */}
        {agents.length > 1 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Other Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {agents.slice(0, 12).map((agent) => {
                  const isSelected = selectedAgent?.id === agent.id
                  return (
                    <Button
                      key={agent.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                      onClick={() => {
                        window.location.search = `?agent=${agent.id}`
                      }}
                    >
                      <div className="font-medium">{agent.symbol}</div>
                      <div className="text-xs opacity-70">
                        ${Number(agent.price).toFixed(4)}
                      </div>
                      <div className={`text-xs ${
                        agent.change_24h >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}