import { useParams, useNavigate } from 'react-router-dom'
import { useMarketDetails } from '@/hooks/usePredictionMarkets'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, Clock, DollarSign, Share2 } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { TradingModal } from '@/components/prediction-markets/TradingModal'
import { useState } from 'react'
import { MarketChart } from '@/components/prediction-markets/MarketChart'

export default function MarketDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { market, trades, userPosition } = useMarketDetails(id || '')
  const [showTradingModal, setShowTradingModal] = useState(false)

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Market Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The market you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate('/prediction-markets')}>
            Back to Markets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/prediction-markets')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Markets
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {market.category.replace('-', ' ')}
                </Badge>
                <Badge className="bg-accent/20 text-accent">
                  {market.status}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {market.question}
              </h1>
              
              <p className="text-muted-foreground max-w-2xl">
                {market.description}
              </p>

              <div className="flex flex-wrap gap-6 mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Volume</span>
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(market.totalVolume)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Liquidity</span>
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(market.totalLiquidity)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Ends</span>
                  </div>
                  <div className="text-xl font-bold">
                    {formatRelativeTime(market.resolutionDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => setShowTradingModal(true)}
              >
                <TrendingUp className="h-5 w-5" />
                Trade Now
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Chart */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Price History</h2>
              <MarketChart market={market} />
            </Card>

            {/* Recent Trades */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="space-y-3">
                {trades.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No trades yet
                  </p>
                ) : (
                  trades.slice(0, 10).map((trade) => {
                    const outcome = market.outcomes.find(o => o.id === trade.outcomeId)
                    return (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={trade.type === 'buy' ? 'default' : 'outline'}
                            className="w-16 justify-center"
                          >
                            {trade.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{outcome?.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {trade.shares} shares @ {formatCurrency(trade.price)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(trade.totalCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(trade.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Prices */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Current Prices</h2>
              <div className="space-y-3">
                {market.outcomes.map((outcome) => (
                  <div 
                    key={outcome.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{outcome.label}</span>
                      <span className="text-2xl font-bold text-primary">
                        {(outcome.price * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${outcome.price * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Your Position */}
            {userPosition && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
                <h2 className="text-xl font-bold mb-4">Your Position</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares</span>
                    <span className="font-semibold">{userPosition.shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Price</span>
                    <span className="font-semibold">
                      {formatCurrency(userPosition.averagePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Value</span>
                    <span className="font-semibold">
                      {formatCurrency(userPosition.currentValue)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border/50">
                    <span className="text-muted-foreground">P&L</span>
                    <div className="text-right">
                      <div className={`font-bold ${userPosition.pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {userPosition.pnl >= 0 ? '+' : ''}{formatCurrency(userPosition.pnl)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({userPosition.pnlPercentage >= 0 ? '+' : ''}{userPosition.pnlPercentage.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Market Info */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Market Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Resolution Source</div>
                  <div className="font-medium">{market.oracleSource || 'Community Vote'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Created</div>
                  <div className="font-medium">{formatRelativeTime(market.createdAt)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Creator</div>
                  <div className="font-mono text-xs">
                    {market.creatorAddress}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <TradingModal 
        market={market}
        open={showTradingModal}
        onOpenChange={setShowTradingModal}
      />
    </div>
  )
}
