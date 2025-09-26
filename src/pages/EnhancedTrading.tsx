import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdvancedOrderForm } from '@/components/trading/AdvancedOrderForm'
import { OrderManagementDashboard } from '@/components/trading/OrderManagementDashboard'
import { SEOHead } from '@/components/seo/SEOHead'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
}

export function EnhancedTrading() {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get('agent')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

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

  // Fetch specific agent if agentId is provided
  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null
      
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (error) throw error
      return data as Agent
    },
    enabled: !!agentId
  })

  React.useEffect(() => {
    if (agent) {
      setSelectedAgent(agent)
    }
  }, [agent])

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  return (
    <>
      <SEOHead
        title="Enhanced Trading Platform - Advanced Orders & Risk Management"
        description="Trade AI agents with advanced order types including stop-loss, take-profit, trailing stops, and comprehensive order management tools."
        keywords="trading platform, advanced orders, stop loss, take profit, trading dashboard, risk management"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white leading-tight mb-2">
            Enhanced Trading{" "}
            <span className="text-white">
              Platform
            </span>
          </h1>
          <p className="text-muted-foreground">
            Advanced trading with sophisticated order types and risk management tools
          </p>
        </div>

        <Tabs defaultValue="trade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trade">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAgent?.id === agent.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-sm text-muted-foreground">{agent.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${agent.price.toFixed(4)}</p>
                            <div className={`flex items-center gap-1 text-sm ${
                              agent.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {agent.change_24h >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {agent.change_24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Vol: ${(agent.volume_24h / 1000).toFixed(1)}K</span>
                          <span>MCap: ${(agent.market_cap / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Trading Form */}
              <div className="lg:col-span-1">
                {selectedAgent ? (
                  <AdvancedOrderForm
                    agentId={selectedAgent.id}
                    agentSymbol={selectedAgent.symbol}
                    currentPrice={selectedAgent.price}
                    onOrderCreate={() => {
                      // Refresh orders or show success
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        Select an agent to start trading
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Market Info */}
              <div className="lg:col-span-1">
                {selectedAgent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {selectedAgent.name}
                        <Badge variant="outline">{selectedAgent.symbol}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Price
                          </div>
                          <p className="text-2xl font-bold">${selectedAgent.price.toFixed(4)}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            24h Change
                          </div>
                          <p className={`text-2xl font-bold ${
                            selectedAgent.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedAgent.change_24h >= 0 ? '+' : ''}{selectedAgent.change_24h.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">24h Volume</span>
                          <span className="font-medium">${(selectedAgent.volume_24h / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Market Cap</span>
                          <span className="font-medium">${(selectedAgent.market_cap / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            Add to Watchlist
                          </Button>
                          <Button variant="outline" size="sm">
                            Price Alert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagementDashboard />
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Advanced market analysis tools and insights coming soon...
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Technical Indicators</h4>
                        <p className="text-sm text-muted-foreground">
                          RSI, MACD, Moving averages, and more
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Market Sentiment</h4>
                        <p className="text-sm text-muted-foreground">
                          Social sentiment and market indicators
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Risk Analytics</h4>
                        <p className="text-sm text-muted-foreground">
                          Portfolio risk assessment and metrics
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}