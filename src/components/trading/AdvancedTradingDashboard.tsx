import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExchangeSelector } from './ExchangeSelector'
import { RealTimeOrderBook } from './RealTimeOrderBook'
import { TradingPanel } from './TradingPanel'
import { TradingViewChart } from '@/components/charts/TradingViewChart'
import { Badge } from '@/components/ui/badge'
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface AdvancedTradingDashboardProps {
  agentId: string
  agentSymbol: string
  agent: {
    name: string
    symbol: string
    price: string
    balance?: string
  }
}

export const AdvancedTradingDashboard = ({ 
  agentId, 
  agentSymbol, 
  agent 
}: AdvancedTradingDashboardProps) => {
  const [activeTab, setActiveTab] = useState('trading')
  
  // Real-time market data
  const { 
    getTickerForAgent, 
    isConnected 
  } = useRealTimeMarketData({
    agentIds: [agentId],
    enableOrderBook: true,
    enableTrades: true
  })
  
  const currentData = getTickerForAgent(agentId)
  const connected = isConnected
  // Generate price history for chart (simulated)
  const priceHistory = Array.from({ length: 50 }, (_, i) => ({
    time: new Date(Date.now() - (49 - i) * 60000).toLocaleTimeString(),
    price: currentData ? currentData.last_price * (0.98 + Math.random() * 0.04) : 0
  }))

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">
                  ${currentData?.last_price.toFixed(4) || '0.0000'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className={`text-2xl font-bold ${
                  (currentData?.change_percent_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {currentData?.change_percent_24h.toFixed(2) || '0.00'}%
                </p>
              </div>
              {(currentData?.change_percent_24h || 0) >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume 24h</p>
                <p className="text-2xl font-bold">
                  ${currentData?.volume_24h.toLocaleString() || '0'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connection</p>
                <div className="flex items-center gap-2">
                  <Badge variant={connected ? "secondary" : "destructive"}>
                    {connected ? "Live" : "Disconnected"}
                  </Badge>
                </div>
              </div>
              <Zap className={`h-8 w-8 ${connected ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Chart</TabsTrigger>
              <TabsTrigger value="advanced">TradingView Pro</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price Chart - {agentSymbol}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={['dataMin', 'dataMax']} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="advanced" className="mt-4">
              <TradingViewChart 
                symbol={`CRYPTO:${agentSymbol}USD`}
                height={400}
                theme="dark"
                interval="1H"
              />
            </TabsContent>
          </Tabs>

          {/* Exchange Management */}
          <ExchangeSelector />
        </div>

        {/* Right Column - Trading and Order Book */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="orderbook">Order Book</TabsTrigger>
            </TabsList>

            <TabsContent value="trading" className="space-y-4">
              <TradingPanel agentId={agentId} agent={agent} />
            </TabsContent>

            <TabsContent value="orderbook" className="space-y-4">
              <RealTimeOrderBook symbol={agentSymbol} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Additional Trading Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={i % 2 === 0 ? "secondary" : "destructive"} className="text-xs">
                      {i % 2 === 0 ? 'BUY' : 'SELL'}
                    </Badge>
                    <span className="text-sm">
                      {(Math.random() * 1000).toFixed(2)} {agentSymbol}
                    </span>
                  </div>
                  <div className="text-sm font-mono">
                    ${(currentData?.last_price || 0).toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">High 24h:</span>
                <span className="font-mono">${currentData?.high_24h.toFixed(4) || '0.0000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low 24h:</span>
                <span className="font-mono">${currentData?.low_24h.toFixed(4) || '0.0000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VWAP 24h:</span>
                <span className="font-mono">${currentData?.vwap_24h?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="text-sm">{new Date(currentData?.updated_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}