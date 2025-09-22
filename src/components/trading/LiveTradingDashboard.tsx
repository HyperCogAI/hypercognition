import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Activity, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { LiveOrderBook } from './LiveOrderBook'
import { MarketTradesStream } from './MarketTradesStream'
import { AdvancedOrderForm } from './AdvancedOrderForm'
import { RealTimeTicker } from './RealTimeTicker'
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
}

export function LiveTradingDashboard() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [orderFormSide, setOrderFormSide] = useState<'buy' | 'sell'>('buy')
  const [orderFormPrice, setOrderFormPrice] = useState<number | undefined>()

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      const { data } = await supabase
        .from('agents')
        .select('id, name, symbol, price, change_24h, volume_24h, market_cap')
        .order('market_cap', { ascending: false })
        .limit(50)

      if (data) {
        setAgents(data)
        if (data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data[0].id)
        }
      }
    }

    loadAgents()
  }, [selectedAgentId])

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  // Filter agents based on search
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const { 
    getTickerForAgent, 
    getTradesForAgent,
    isConnected, 
    lastUpdate 
  } = useRealTimeMarketData({
    agentIds: selectedAgentId ? [selectedAgentId] : [],
    enableOrderBook: true,
    enableTrades: true
  })

  const ticker = selectedAgentId ? getTickerForAgent(selectedAgentId) : null
  const trades = selectedAgentId ? getTradesForAgent(selectedAgentId) : []

  const handlePriceClick = (price: number, side: 'buy' | 'sell') => {
    setOrderFormPrice(price)
    setOrderFormSide(side)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Live Trading</h1>
            <Badge variant={isConnected ? "default" : "secondary"}>
              <Activity className="w-3 h-3 mr-1" />
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Agent Selector */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {filteredAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{agent.symbol}</span>
                      <span className="text-muted-foreground ml-2">{agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-xl font-semibold">{selectedAgent.name}</h2>
                  <p className="text-muted-foreground">{selectedAgent.symbol}</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-lg font-mono">${selectedAgent.price.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p className={cn(
                      "text-lg font-mono flex items-center gap-1",
                      selectedAgent.change_24h >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {selectedAgent.change_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedAgent.change_24h.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-lg font-mono">${(selectedAgent.volume_24h / 1000000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-lg font-mono">${(selectedAgent.market_cap / 1000000).toFixed(2)}M</p>
                  </div>
                </div>
              </div>
              {ticker && <RealTimeTicker ticker={ticker} />}
            </div>
          </div>
        )}
      </div>

      {/* Main Trading Interface */}
      {selectedAgent ? (
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
          {/* Order Book */}
          <div className="col-span-4">
            <LiveOrderBook
              agentId={selectedAgent.id}
              agentSymbol={selectedAgent.symbol}
              onPriceClick={handlePriceClick}
            />
          </div>

          {/* Chart & Trades */}
          <div className="col-span-5 flex flex-col gap-4">
            {/* Price Chart Placeholder */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Price chart will be displayed here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="h-80">
              <MarketTradesStream
                agentSymbol={selectedAgent.symbol}
                trades={trades}
                loading={false}
              />
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="col-span-3">
            <Tabs defaultValue="order" className="h-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="order">Place Order</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
              </TabsList>

              <TabsContent value="order" className="mt-4 h-full">
                <AdvancedOrderForm
                  agentId={selectedAgent.id}
                  agentSymbol={selectedAgent.symbol}
                  currentPrice={ticker?.last_price || selectedAgent.price}
                  onOrderCreate={() => {
                    // Refresh data after order creation
                    console.log('Order created')
                  }}
                />
              </TabsContent>

              <TabsContent value="positions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Open Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No open positions</p>
                      <p className="text-sm">Your positions will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select an Agent to Start Trading</h3>
            <p>Choose an agent from the dropdown above to view live market data and place orders</p>
          </div>
        </div>
      )}
    </div>
  )
}