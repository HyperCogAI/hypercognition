import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { SEOHead } from '@/components/seo/SEOHead'
import { PortfolioAnalytics } from '@/components/portfolio/PortfolioAnalytics'
import { PortfolioOptimizer } from '@/components/portfolio/PortfolioOptimizer'
import { PortfolioPerformanceDashboard } from '@/components/portfolio/PortfolioPerformanceDashboard'
import { Wallet, TrendingUp, BarChart3, Target, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Portfolio() {
  const { user } = useAuth()

  const { data: portfolioSummary, isLoading } = useQuery({
    queryKey: ['portfolio-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data: holdings, error } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agents (
            id,
            name,
            symbol,
            price,
            change_24h
          )
        `)
        .eq('user_id', user.id)
        .gt('total_amount', 0)

      if (error) throw error

      const totalValue = holdings?.reduce((sum, h) => sum + (h.total_amount * (h.agents?.price || 0)), 0) || 0
      const totalInvested = holdings?.reduce((sum, h) => sum + h.total_invested, 0) || 0
      const totalPnL = totalValue - totalInvested

      return {
        holdings: holdings || [],
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  })

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">
              Track performance, analyze holdings, and optimize your AI agent investments
            </p>
          </div>
          
          <Button asChild>
            <Link to="/marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Link>
          </Button>
        </div>

        {portfolioSummary && portfolioSummary.holdings.length > 0 ? (
          <>
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalInvested)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(portfolioSummary.totalPnL)}
                        </p>
                        <Badge variant={portfolioSummary.totalPnL >= 0 ? 'default' : 'destructive'}>
                          {portfolioSummary.totalPnL >= 0 ? '+' : ''}{portfolioSummary.totalPnLPercentage.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Tabs */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="optimizer" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Optimizer
                </TabsTrigger>
                <TabsTrigger value="holdings" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Holdings
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
                <Card>
                  <CardHeader>
                    <CardTitle>Your Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {portfolioSummary.holdings.map((holding, index) => {
                        const currentValue = holding.total_amount * (holding.agents?.price || 0)
                        const pnl = currentValue - holding.total_invested
                        const pnlPercentage = holding.total_invested > 0 ? (pnl / holding.total_invested) * 100 : 0

                        return (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{holding.agents?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {holding.total_amount.toFixed(4)} {holding.agents?.symbol}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(currentValue)}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
              <p className="text-muted-foreground mb-4">
                Start investing in AI agents to track your portfolio performance
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