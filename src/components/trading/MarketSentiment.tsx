import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { TrendingUp, TrendingDown, Activity, RefreshCw, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect } from "react"

export const MarketSentiment = () => {
  const { crypto = [], isLoading, lastUpdated, dataSource, isCached, refreshData } = useRealMarketData()

  if (isLoading || crypto.length === 0) return null

  // Calculate sentiment metrics with market-cap weighting for top 10 coins
  const totalCoins = crypto.length
  const top10 = crypto.slice(0, 10)
  const totalMarketCap = top10.reduce((sum, c) => sum + c.market_cap, 0)
  
  const gainers = crypto.filter(c => c.price_change_percentage_24h > 0).length
  const losers = crypto.filter(c => c.price_change_percentage_24h < 0).length
  const neutral = totalCoins - gainers - losers

  const bullishPercent = (gainers / totalCoins) * 100
  const bearishPercent = (losers / totalCoins) * 100
  
  // Weighted average market change (top 10 coins by market cap)
  const weightedAvgChange = top10.reduce((sum, c) => {
    const weight = c.market_cap / totalMarketCap
    return sum + (c.price_change_percentage_24h * weight)
  }, 0)
  
  // Simple average for comparison
  const avgChange = crypto.reduce((sum, c) => sum + c.price_change_percentage_24h, 0) / totalCoins

  // Log sentiment data for debugging
  useEffect(() => {
    const topDetails = top10.map(c => ({
      id: c.id,
      symbol: c.symbol,
      change24h: c.price_change_percentage_24h,
      weight: (c.market_cap / totalMarketCap)
    }))
    console.log('📊 Market Sentiment Debug:', {
      totalCoins,
      gainers,
      losers,
      neutral,
      weightedAvgChange: weightedAvgChange.toFixed(2) + '%',
      simpleAvgChange: avgChange.toFixed(2) + '%',
      dataSource,
      isCached,
      lastUpdated: lastUpdated?.toISOString(),
      top10: topDetails
    })
  }, [crypto, dataSource, isCached, lastUpdated])

  // Determine overall sentiment - using more realistic thresholds
  const getSentiment = () => {
    const ageMs = lastUpdated ? Date.now() - lastUpdated.getTime() : Infinity
    const isPoor = dataSource !== 'coingecko' || ageMs > 5 * 60 * 1000
    const change = weightedAvgChange // Use weighted average
    if (isPoor) return { label: "Uncertain", color: "text-muted-foreground", bg: "bg-muted/30 border-border/50" }
    if (change > 5) return { label: "Extremely Bullish", color: "text-green-500", bg: "bg-green-500/20 border-green-500/30" }
    if (change > 1.5) return { label: "Bullish", color: "text-green-400", bg: "bg-green-400/20 border-green-400/30" }
    if (change > -1.5) return { label: "Neutral", color: "text-yellow-500", bg: "bg-yellow-500/20 border-yellow-500/30" }
    if (change > -5) return { label: "Bearish", color: "text-red-400", bg: "bg-red-400/20 border-red-400/30" }
    return { label: "Extremely Bearish", color: "text-red-500", bg: "bg-red-500/20 border-red-500/30" }
  }

  const sentiment = getSentiment()
  
  // Data freshness indicator
  const getDataFreshness = () => {
    if (!lastUpdated) return { text: 'Unknown', color: 'text-muted-foreground' }
    const ageSeconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    if (ageSeconds < 30) return { text: 'Live', color: 'text-green-400' }
    if (ageSeconds < 60) return { text: `${ageSeconds}s ago`, color: 'text-yellow-400' }
    if (ageSeconds < 120) return { text: '1m ago', color: 'text-yellow-500' }
    return { text: `${Math.floor(ageSeconds / 60)}m ago`, color: 'text-red-400' }
  }
  
  const freshness = getDataFreshness()

  // Data quality evaluation
  const ageMs = lastUpdated ? Date.now() - lastUpdated.getTime() : Infinity
  const isDataStale = ageMs > 2 * 60 * 1000
  const isDataVeryStale = ageMs > 5 * 60 * 1000
  const isFallback = dataSource === 'alternative'
  const isCacheSource = dataSource === 'cache'
  const quality = (!isFallback && !isCacheSource && !isDataVeryStale)
    ? (isDataStale ? { label: 'Stale', color: 'text-yellow-500' } : { label: 'Good', color: 'text-green-400' })
    : { label: 'Poor', color: 'text-red-400' }

  return (
    <Card className="mb-6 bg-card/30 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Sentiment
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Data Source Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Source:</span>
              <Badge variant="outline" className="text-xs">
                {dataSource === 'coingecko' ? '🟢 CoinGecko' : 
                 dataSource === 'alternative' ? '🟡 Fallback' : 
                 '🔴 Cached'}
              </Badge>
            </div>

            {/* Data Quality Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Quality:</span>
              <Badge variant="outline" className={`text-xs ${quality.color}`}>
                {quality.label}
              </Badge>
            </div>
            
            {/* Freshness Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className={freshness.color}>●</span>
              <span className="text-muted-foreground">{freshness.text}</span>
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              className="h-8 w-8 p-0"
              title="Refresh market data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Warning for stale/fallback data */}
        {(((isCached && dataSource === 'cache') || dataSource === 'alternative')) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-yellow-500">
            <AlertCircle className="h-3 w-3" />
            <span>{dataSource === 'alternative' ? 'Using fallback data - values may be inaccurate' : 'Using cached data - API may be unavailable'}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Sentiment */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Overall Mood</div>
            <Badge className={`${sentiment.bg} ${sentiment.color} text-lg font-semibold px-4 py-2`}>
              {sentiment.label}
            </Badge>
            <div className={`text-2xl font-bold ${weightedAvgChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {weightedAvgChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {weightedAvgChange >= 0 ? '+' : ''}{weightedAvgChange.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Weighted Avg (Top 10)</div>
          </div>

          {/* Gainers */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Gainers</div>
            <div className="text-3xl font-bold text-green-500">{gainers}</div>
            <Progress value={bullishPercent} className="h-2 bg-background [&>div]:bg-green-500" />
            <div className="text-xs text-muted-foreground">{bullishPercent.toFixed(1)}% of market</div>
          </div>

          {/* Losers */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Losers</div>
            <div className="text-3xl font-bold text-red-500">{losers}</div>
            <Progress value={bearishPercent} className="h-2 bg-background [&>div]:bg-red-500" />
            <div className="text-xs text-muted-foreground">{bearishPercent.toFixed(1)}% of market</div>
          </div>

          {/* Neutral */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Neutral</div>
            <div className="text-3xl font-bold text-muted-foreground">{neutral}</div>
            <Progress value={(neutral / totalCoins) * 100} className="h-2 bg-background [&>div]:bg-muted" />
            <div className="text-xs text-muted-foreground">{((neutral / totalCoins) * 100).toFixed(1)}% of market</div>
          </div>
        </div>

        {/* Market Stats Bar */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Market Distribution:</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 transition-all" 
              style={{ width: `${bullishPercent}%` }}
              title={`${bullishPercent.toFixed(1)}% Bullish`}
            />
            <div 
              className="bg-red-500 transition-all" 
              style={{ width: `${bearishPercent}%` }}
              title={`${bearishPercent.toFixed(1)}% Bearish`}
            />
            <div 
              className="bg-muted transition-all" 
              style={{ width: `${((neutral / totalCoins) * 100)}%` }}
              title={`${((neutral / totalCoins) * 100).toFixed(1)}% Neutral`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
