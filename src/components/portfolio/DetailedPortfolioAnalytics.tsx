import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react"
import { useRealPortfolio } from "@/hooks/useRealPortfolio"
import { useRealtimePrices } from "@/hooks/useRealtimePrices"
import { useEffect, useState } from "react"

export function DetailedPortfolioAnalytics() {
  const { holdings, portfolioValue, totalInvested, totalPnL, totalPnLPercent } = useRealPortfolio()
  
  // Disable real-time price updates - use portfolio data directly
  const { prices, isConnected } = useRealtimePrices({ cryptoIds: [], autoStart: false })

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    if (holdings.length === 0) return null

    // Best performer
    const bestPerformer = holdings.reduce((best, current) => {
      const currentValue = current.quantity * parseFloat(current.agent?.price?.toString() || '0')
      const currentPnL = currentValue - current.total_invested
      const currentPnLPercent = current.total_invested > 0 ? (currentPnL / current.total_invested) * 100 : 0

      const bestValue = best.quantity * parseFloat(best.agent?.price?.toString() || '0')
      const bestPnL = bestValue - best.total_invested
      const bestPnLPercent = best.total_invested > 0 ? (bestPnL / best.total_invested) * 100 : 0

      return currentPnLPercent > bestPnLPercent ? current : best
    })

    // Worst performer
    const worstPerformer = holdings.reduce((worst, current) => {
      const currentValue = current.quantity * parseFloat(current.agent?.price?.toString() || '0')
      const currentPnL = currentValue - current.total_invested
      const currentPnLPercent = current.total_invested > 0 ? (currentPnL / current.total_invested) * 100 : 0

      const worstValue = worst.quantity * parseFloat(worst.agent?.price?.toString() || '0')
      const worstPnL = worstValue - worst.total_invested
      const worstPnLPercent = worst.total_invested > 0 ? (worstPnL / worst.total_invested) * 100 : 0

      return currentPnLPercent < worstPnLPercent ? current : worst
    })

    // Largest holding by value
    const largestHolding = holdings.reduce((largest, current) => {
      const currentValue = current.quantity * parseFloat(current.agent?.price?.toString() || '0')
      const largestValue = largest.quantity * parseFloat(largest.agent?.price?.toString() || '0')
      return currentValue > largestValue ? current : largest
    })

    // Diversity score (0-100, higher is more diversified)
    const holdingValues = holdings.map(h => 
      h.quantity * parseFloat(h.agent?.price?.toString() || '0')
    )
    const totalValue = holdingValues.reduce((sum, val) => sum + val, 0)
    const holdingPercentages = holdingValues.map(val => val / totalValue)
    const diversityScore = 100 - (holdingPercentages.reduce((sum, pct) => sum + (pct * 100) ** 2, 0) / holdings.length)

    return {
      bestPerformer,
      worstPerformer,
      largestHolding,
      diversityScore: Math.round(diversityScore),
      totalAssets: holdings.length,
      avgPnLPercent: totalPnLPercent
    }
  }

  const metrics = calculateMetrics()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (!metrics) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </CardContent>
      </Card>
    )
  }

  const bestValue = metrics.bestPerformer.quantity * parseFloat(metrics.bestPerformer.agent?.price?.toString() || '0')
  const bestPnL = bestValue - metrics.bestPerformer.total_invested
  const bestPnLPercent = metrics.bestPerformer.total_invested > 0 ? (bestPnL / metrics.bestPerformer.total_invested) * 100 : 0

  const worstValue = metrics.worstPerformer.quantity * parseFloat(metrics.worstPerformer.agent?.price?.toString() || '0')
  const worstPnL = worstValue - metrics.worstPerformer.total_invested
  const worstPnLPercent = metrics.worstPerformer.total_invested > 0 ? (worstPnL / metrics.worstPerformer.total_invested) * 100 : 0

  const largestValue = metrics.largestHolding.quantity * parseFloat(metrics.largestHolding.agent?.price?.toString() || '0')

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Detailed Analytics</h3>
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Best Performer */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold mb-1">{metrics.bestPerformer.agent?.name}</p>
            <p className="text-sm text-muted-foreground mb-2">{formatCurrency(bestValue)}</p>
            <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
              +{bestPnLPercent.toFixed(2)}%
            </Badge>
          </CardContent>
        </Card>

        {/* Worst Performer */}
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold mb-1">{metrics.worstPerformer.agent?.name}</p>
            <p className="text-sm text-muted-foreground mb-2">{formatCurrency(worstValue)}</p>
            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
              {worstPnLPercent.toFixed(2)}%
            </Badge>
          </CardContent>
        </Card>

        {/* Largest Holding */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Largest Holding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold mb-1">{metrics.largestHolding.agent?.name}</p>
            <p className="text-sm text-muted-foreground mb-2">{formatCurrency(largestValue)}</p>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {((largestValue / portfolioValue) * 100).toFixed(1)}% of portfolio
            </Badge>
          </CardContent>
        </Card>

        {/* Diversity Score */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-500" />
              Diversity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-1">{metrics.diversityScore}/100</p>
            <p className="text-sm text-muted-foreground">
              {metrics.diversityScore > 70 ? 'Well diversified' : 
               metrics.diversityScore > 40 ? 'Moderately diversified' : 
               'Consider diversifying'}
            </p>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-1">{metrics.totalAssets}</p>
            <p className="text-sm text-muted-foreground">
              Cryptocurrencies held
            </p>
          </CardContent>
        </Card>

        {/* Average Performance */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-500" />
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold mb-1 ${metrics.avgPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.avgPnLPercent >= 0 ? '+' : ''}{metrics.avgPnLPercent.toFixed(2)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Across all holdings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings with Real-time Prices */}
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {holdings.map((holding, index) => {
              const cryptoId = holding.agent?.name?.toLowerCase().replace(/\s+/g, '-')
              const realtimePrice = cryptoId ? prices.get(cryptoId) : null
              const displayPrice = realtimePrice?.current_price || parseFloat(holding.agent?.price?.toString() || '0')
              
              const currentValue = holding.quantity * displayPrice
              const pnl = currentValue - holding.total_invested
              const pnlPercentage = holding.total_invested > 0 ? (pnl / holding.total_invested) * 100 : 0

              return (
                <div key={index} className="flex items-center justify-between p-4 border border-border/30 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${realtimePrice ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-medium">{holding.agent?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {holding.quantity.toFixed(4)} {holding.agent?.symbol}
                      </p>
                      {realtimePrice && (
                        <p className="text-xs text-muted-foreground">
                          ${realtimePrice.current_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(currentValue)}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`text-sm ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
    </div>
  )
}
