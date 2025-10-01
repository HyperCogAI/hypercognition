import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const MarketSentiment = () => {
  const { crypto = [], isLoading } = useRealMarketData()

  if (isLoading || crypto.length === 0) return null

  // Calculate sentiment metrics
  const totalCoins = crypto.length
  const gainers = crypto.filter(c => c.price_change_percentage_24h > 0).length
  const losers = crypto.filter(c => c.price_change_percentage_24h < 0).length
  const neutral = totalCoins - gainers - losers

  const bullishPercent = (gainers / totalCoins) * 100
  const bearishPercent = (losers / totalCoins) * 100
  
  // Average market change
  const avgChange = crypto.reduce((sum, c) => sum + c.price_change_percentage_24h, 0) / totalCoins

  // Determine overall sentiment
  const getSentiment = () => {
    if (avgChange > 2) return { label: "Extremely Bullish", color: "text-green-500", bg: "bg-green-500/20 border-green-500/30" }
    if (avgChange > 0.5) return { label: "Bullish", color: "text-green-400", bg: "bg-green-400/20 border-green-400/30" }
    if (avgChange > -0.5) return { label: "Neutral", color: "text-yellow-500", bg: "bg-yellow-500/20 border-yellow-500/30" }
    if (avgChange > -2) return { label: "Bearish", color: "text-red-400", bg: "bg-red-400/20 border-red-400/30" }
    return { label: "Extremely Bearish", color: "text-red-500", bg: "bg-red-500/20 border-red-500/30" }
  }

  const sentiment = getSentiment()

  return (
    <Card className="mb-6 bg-card/30 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Sentiment */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Overall Mood</div>
            <Badge className={`${sentiment.bg} ${sentiment.color} text-lg font-semibold px-4 py-2`}>
              {sentiment.label}
            </Badge>
            <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {avgChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Average 24h Change</div>
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
