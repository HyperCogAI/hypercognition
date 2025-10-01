import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useRealPortfolio } from '@/hooks/useRealPortfolio'
import { useUserBalance } from '@/hooks/useUserBalance'
import { SEOHead } from '@/components/seo/SEOHead'
import { PortfolioAnalytics } from '@/components/portfolio/PortfolioAnalytics'
import { PortfolioOptimizer } from '@/components/portfolio/PortfolioOptimizer'
import { PortfolioPerformanceDashboard } from '@/components/portfolio/PortfolioPerformanceDashboard'
import { SolanaPortfolioCard } from '@/components/portfolio/SolanaPortfolioCard'
import { Wallet, TrendingUp, BarChart3, Target, Plus, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Portfolio() {
  const { user } = useAuth()
  const { balance } = useUserBalance()
  const { 
    holdings, 
    portfolioValue, 
    totalInvested, 
    totalPnL, 
    totalPnLPercent,
    loading: portfolioLoading 
  } = useRealPortfolio()

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
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Portfolio Dashboard
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Track performance, analyze holdings, and optimize your AI agent investments
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Link to="/marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Link>
          </Button>
        </div>

        {/* Balance Card - Always show if available */}
        {balance && (
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Available Cash</p>
                  <p className="text-2xl font-bold text-foreground">${balance.available_balance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total: ${balance.total_balance.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {holdings && holdings.length > 0 ? (
          <>
            
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Total Portfolio Value</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Total Invested</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Total P&L</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(totalPnL)}
                        </p>
                        <Badge variant={totalPnL >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Solana Portfolio Section */}
            <div className="mb-8">
              <SolanaPortfolioCard />
            </div>

            {/* Portfolio Tabs */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-gradient-to-r from-muted to-muted/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="performance" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                  <span className="sm:hidden">Perf</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="optimizer" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Optimizer</span>
                  <span className="sm:hidden">Opt</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="holdings" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">EVM Holdings</span>
                  <span className="sm:hidden">EVM</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="solana" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Solana</span>
                  <span className="sm:hidden">SOL</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <PortfolioPerformanceDashboard />
              </TabsContent>

              <TabsContent value="analytics">
                <PortfolioAnalytics />
              </TabsContent>

              <TabsContent value="optimizer">
                <PortfolioOptimizer />
              </TabsContent>

              <TabsContent value="holdings">
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Wallet className="h-5 w-5 text-primary" />
                      EVM Holdings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings.map((holding, index) => {
                        const currentValue = holding.quantity * parseFloat(holding.agent?.price?.toString() || '0')
                        const pnl = currentValue - holding.total_invested
                        const pnlPercentage = holding.total_invested > 0 ? (pnl / holding.total_invested) * 100 : 0

                        return (
                          <div key={index} className="flex items-center justify-between p-4 border border-primary/10 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                                <Wallet className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{holding.agent?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {holding.quantity.toFixed(4)} {holding.agent?.symbol}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">{formatCurrency(currentValue)}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(pnl)}
                                </span>
                                <Badge variant={pnl >= 0 ? 'default' : 'destructive'} className="text-xs">
                                  {pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solana">
                <SolanaPortfolioCard />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 inline-block mb-6">
                <Wallet className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">No Portfolio Data</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start investing in AI agents to track your portfolio performance and unlock powerful analytics
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
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