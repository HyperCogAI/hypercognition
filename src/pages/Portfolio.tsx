import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { usePortfolioHoldings } from '@/hooks/usePortfolioHoldings'
import { useUserBalance } from '@/hooks/useUserBalance'
import { SEOHead } from '@/components/seo/SEOHead'
import { PortfolioAnalytics } from '@/components/portfolio/PortfolioAnalytics'
import { PortfolioOptimizer } from '@/components/portfolio/PortfolioOptimizer'
import { PortfolioPerformanceDashboard } from '@/components/portfolio/PortfolioPerformanceDashboard'
import { SolanaPortfolioCard } from '@/components/portfolio/SolanaPortfolioCard'
import { DetailedPortfolioAnalytics } from '@/components/portfolio/DetailedPortfolioAnalytics'
import { Wallet, TrendingUp, BarChart3, Target, Plus, DollarSign, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Portfolio() {
  const { user } = useAuth()
  const { balance } = useUserBalance()
  const { 
    holdings, 
    summary,
    isLoading: portfolioLoading 
  } = usePortfolioHoldings()

  const portfolioValue = summary?.totalValue || 0
  const totalInvested = summary?.totalInvested || 0
  const totalPnL = summary?.totalPnL || 0
  const totalPnLPercent = summary?.totalPnLPercent || 0

  const isLoading = portfolioLoading

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Portfolio - AI Agent Trading Dashboard"
        description="Track your AI agent investments, analyze performance, and optimize your portfolio allocation with advanced analytics and insights."
        keywords="portfolio tracking, investment analytics, AI agents, trading performance, portfolio optimization"
      />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground/40">
            Track performance, analyze holdings, and optimize your AI agent investments
          </p>
        </div>

        {/* Balance Card - Always show if available */}
        {balance && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground/40 mb-2">Available Cash</p>
                  <p className="text-2xl font-bold">${balance.available_balance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Total: ${balance.total_balance.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <DollarSign className="h-6 w-6 text-muted-foreground/40" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {holdings && holdings.length > 0 ? (
          <>
            
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground/40 mb-2">Total Portfolio Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <Wallet className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground/40 mb-2">Total Invested</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <TrendingUp className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground/40 mb-2">Total P&L</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(totalPnL)}
                        </p>
                        <Badge variant={totalPnL >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <BarChart3 className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Solana Portfolio Section */}
            <div className="mb-6">
              <SolanaPortfolioCard />
            </div>

            {/* Portfolio Tabs */}
            <Tabs defaultValue="detailed" className="w-full mb-6">
              <TabsList className="w-full overflow-x-auto flex lg:grid lg:grid-cols-6 gap-1 scrollbar-hide">
                <TabsTrigger value="detailed" className="flex-shrink-0 gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Detailed</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex-shrink-0 gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-shrink-0 gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="optimizer" className="flex-shrink-0 gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Optimizer</span>
                </TabsTrigger>
                <TabsTrigger value="holdings" className="flex-shrink-0 gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">EVM Holdings</span>
                </TabsTrigger>
                <TabsTrigger value="solana" className="flex-shrink-0 gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Solana</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detailed">
                <DetailedPortfolioAnalytics />
              </TabsContent>

              <TabsContent value="performance">
                <PortfolioPerformanceDashboard />
              </TabsContent>

              <TabsContent value="analytics">
                <PortfolioAnalytics />
              </TabsContent>

              <TabsContent value="optimizer">
                <PortfolioOptimizer />
              </TabsContent>

              <TabsContent value="holdings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      EVM Holdings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings.map((holding, index) => (
                        <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <Wallet className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                            <div>
                              <p className="font-medium">{holding.asset_name}</p>
                              <p className="text-sm text-muted-foreground/40">
                                {holding.quantity.toFixed(4)} {holding.asset_symbol}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(holding.current_value)}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${holding.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(holding.unrealized_pnl)}
                              </span>
                              <Badge variant={holding.unrealized_pnl >= 0 ? 'default' : 'destructive'} className="text-xs">
                                {holding.unrealized_pnl >= 0 ? '+' : ''}{((holding.unrealized_pnl / holding.total_invested) * 100).toFixed(2)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solana" className="mt-6">
                <SolanaPortfolioCard />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-lg bg-muted inline-block mb-6">
                <Wallet className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Portfolio Data</h3>
              <p className="text-muted-foreground/40 mb-6 max-w-md mx-auto">
                Start investing in AI agents to track your portfolio performance and unlock powerful analytics
              </p>
              <Button asChild>
                <Link to="/marketplace">
                  <Plus className="h-4 w-4 mr-2" />
                  Explore AI Agents
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}