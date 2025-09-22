import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity, Volume2, Target } from 'lucide-react'
import { format } from 'date-fns'
import type { Database } from '@/integrations/supabase/types'

type MarketTicker = Database['public']['Tables']['market_tickers']['Row']

interface RealTimeTickerProps {
  agentSymbol?: string
  ticker?: MarketTicker
  loading?: boolean
}

export function RealTimeTicker({ agentSymbol, ticker, loading }: RealTimeTickerProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ticker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No market data available
          </p>
        </CardContent>
      </Card>
    )
  }

  const priceChangeColor = ticker.change_24h >= 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Market Data
          </div>
          {agentSymbol && (
            <Badge variant="outline">{agentSymbol}</Badge>
          )}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Last updated: {format(new Date(ticker.updated_at), 'MMM dd, HH:mm:ss')}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold flex items-center justify-center gap-2">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
            {Number(ticker.last_price).toFixed(4)}
          </div>
          <div className={`flex items-center justify-center gap-2 text-lg font-medium ${priceChangeColor}`}>
            {ticker.change_24h >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {ticker.change_24h >= 0 ? '+' : ''}{Number(ticker.change_24h).toFixed(2)}%
            </span>
            <span className="text-sm">
              (${Number(ticker.change_24h).toFixed(4)})
            </span>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              24h High
            </div>
            <div className="font-mono text-lg">
              ${Number(ticker.high_24h || 0).toFixed(4)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              24h Low
            </div>
            <div className="font-mono text-lg">
              ${Number(ticker.low_24h || 0).toFixed(4)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              24h Volume
            </div>
            <div className="font-mono text-lg">
              ${(Number(ticker.volume_24h) / 1000).toFixed(1)}K
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-3 w-3" />
              Trades
            </div>
            <div className="font-mono text-lg">
              {Number(ticker.trades_count_24h || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bid/Ask Spread */}
        {ticker.best_bid && ticker.best_ask && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground">Best Bid</div>
                <div className="font-mono text-sm text-green-600 dark:text-green-400">
                  ${Number(ticker.best_bid).toFixed(4)}
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground">Spread</div>
                <div className="font-mono text-sm">
                  ${(Number(ticker.best_ask) - Number(ticker.best_bid)).toFixed(4)}
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground">Best Ask</div>
                <div className="font-mono text-sm text-red-600 dark:text-red-400">
                  ${Number(ticker.best_ask).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VWAP */}
        {ticker.vwap_24h && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">24h VWAP</span>
              <span className="font-mono">
                ${Number(ticker.vwap_24h).toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}