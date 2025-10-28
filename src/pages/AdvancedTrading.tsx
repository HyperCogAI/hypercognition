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
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                Advanced Trading
              </h1>
              <p className="text-muted-foreground">
                Professional trading tools with advanced order types and comprehensive order management
              </p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="trading" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-background border border-border/50 p-1 h-auto rounded-lg">
            <TabsTrigger 
              value="trading" 
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-muted/70 rounded-md font-medium"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="management" 
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-muted/70 rounded-md font-medium"
            >
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">Order Management</span>
              <span className="sm:hidden">Management</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-muted/70 rounded-md font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Trading Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6 animate-fade-in">
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
                  <Card className="h-full border border-border/50 bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
                      <p className="text-muted-foreground">
                        Choose an AI agent to start advanced trading
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Agent Selection and Market Data */}
              <div className="space-y-6">
                {/* Top Trading Agents */}
                <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Top Trading Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topAgents.slice(0, 5).map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-200">
                          <div>
                            <p className="font-medium text-foreground">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${agent.price.toFixed(4)}</p>
                            <p className={`text-sm font-medium ${agent.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Types Guide */}
                <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Order Types Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Market Order", desc: "Execute immediately at current market price" },
                        { name: "Limit Order", desc: "Execute only at specified price or better" },
                        { name: "Stop Market", desc: "Trigger market order when price hits stop level" },
                        { name: "Stop Limit", desc: "Trigger limit order when price hits stop level" },
                        { name: "Trailing Stop", desc: "Stop price follows market by specified percentage" }
                      ].map((orderType, index) => (
                        <div key={index} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                          <p className="font-medium text-foreground mb-1">{orderType.name}</p>
                          <p className="text-sm text-muted-foreground">{orderType.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management" className="animate-fade-in">
            <OrderManagementDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-12 text-center">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Trading Analytics</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
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

export default AdvancedTradingPage;