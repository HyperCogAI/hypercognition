import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdvancedOrderForm } from '@/components/trading/AdvancedOrderForm'
import { OrderManagementDashboard } from '@/components/trading/OrderManagementDashboard'
import { SEOHead } from '@/components/seo/SEOHead'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TrendingUp, ListOrdered, Target, BarChart3 } from 'lucide-react'

export function AdvancedTradingPage() {
  // Fetch top agents for trading
  const { data: topAgents = [] } = useQuery({
    queryKey: ['top-agents-trading'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('volume_24h', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    }
  })

  const selectedAgent = topAgents[0] // Default to first agent

  return (
    <>
      <SEOHead
        title="Advanced Trading - Professional AI Agent Trading"
        description="Execute sophisticated trading strategies with advanced order types, stop-loss, take-profit, and comprehensive order management tools."
        keywords="advanced trading, order management, stop loss, take profit, trading dashboard, AI agents"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
            Advanced{" "}
            <span className="text-white">
              Trading
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Professional trading tools with advanced order types and comprehensive order management
          </p>
        </div>

        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Advanced Orders
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Order Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Trading Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Order Form */}
              <div>
                {selectedAgent ? (
                  <AdvancedOrderForm
                    agentId={selectedAgent.id}
                    agentSymbol={selectedAgent.symbol}
                    currentPrice={selectedAgent.price}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
                      <p className="text-muted-foreground">
                        Choose an AI agent to start advanced trading
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Agent Selection and Market Data */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Trading Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topAgents.slice(0, 5).map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer">
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${agent.price.toFixed(4)}</p>
                            <p className={`text-sm ${agent.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Types Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">Market Order</p>
                        <p className="text-muted-foreground">Execute immediately at current market price</p>
                      </div>
                      <div>
                        <p className="font-medium">Limit Order</p>
                        <p className="text-muted-foreground">Execute only at specified price or better</p>
                      </div>
                      <div>
                        <p className="font-medium">Stop Market</p>
                        <p className="text-muted-foreground">Trigger market order when price hits stop level</p>
                      </div>
                      <div>
                        <p className="font-medium">Stop Limit</p>
                        <p className="text-muted-foreground">Trigger limit order when price hits stop level</p>
                      </div>
                      <div>
                        <p className="font-medium">Trailing Stop</p>
                        <p className="text-muted-foreground">Stop price follows market by specified percentage</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <OrderManagementDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Trading Analytics</h3>
                <p className="text-muted-foreground">
                  Advanced trading analytics and performance metrics coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}