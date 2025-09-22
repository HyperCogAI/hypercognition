import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData'
import { cn } from '@/lib/utils'

interface LiveOrderBookProps {
  agentId: string
  agentSymbol?: string
  maxLevels?: number
  onPriceClick?: (price: number, side: 'buy' | 'sell') => void
}

export function LiveOrderBook({ 
  agentId, 
  agentSymbol, 
  maxLevels = 15,
  onPriceClick 
}: LiveOrderBookProps) {
  const { getOrderBookForAgent, isConnected, lastUpdate } = useRealTimeMarketData({
    agentIds: [agentId],
    enableOrderBook: true,
    maxOrderBookLevels: maxLevels
  })

  const orderBook = getOrderBookForAgent(agentId)

  // Calculate spread and market depth
  const spreadData = useMemo(() => {
    const bestBid = orderBook.bids[0]?.price || 0
    const bestAsk = orderBook.asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0

    return {
      bestBid,
      bestAsk,
      spread,
      spreadPercent
    }
  }, [orderBook])

  // Calculate max volume for sizing bars
  const maxVolume = useMemo(() => {
    const allEntries = [...orderBook.bids, ...orderBook.asks]
    return Math.max(...allEntries.map(entry => entry.size), 1)
  }, [orderBook])

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(6) : price.toFixed(2)
  }

  const formatSize = (size: number) => {
    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M`
    }
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`
    }
    return size.toFixed(2)
  }

  const formatValue = (price: number, size: number) => {
    const value = price * size
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Order Book {agentSymbol && <span className="text-muted-foreground">• {agentSymbol}</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Spread Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Best Bid: </span>
              <span className="font-mono text-green-500">${formatPrice(spreadData.bestBid)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Best Ask: </span>
              <span className="font-mono text-red-500">${formatPrice(spreadData.bestAsk)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Spread</div>
            <div className="font-mono text-xs">
              ${formatPrice(spreadData.spread)} ({spreadData.spreadPercent.toFixed(3)}%)
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="px-4">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 font-medium">
              <div>Price</div>
              <div className="text-center">Size</div>
              <div className="text-right">Total</div>
            </div>

            {/* Asks (Sells) - Red */}
            <div className="space-y-1">
              {orderBook.asks.slice().reverse().map((ask, index) => (
                <div
                  key={`ask-${ask.price}-${index}`}
                  className={cn(
                    "relative grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded cursor-pointer",
                    "hover:bg-red-500/10 transition-colors",
                    onPriceClick && "hover:bg-red-500/20"
                  )}
                  onClick={() => onPriceClick?.(ask.price, 'sell')}
                >
                  {/* Volume bar background */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-red-500/10 rounded"
                    style={{ 
                      width: `${(ask.size / maxVolume) * 100}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                  
                  <div className="relative font-mono text-red-500">
                    ${formatPrice(ask.price)}
                  </div>
                  <div className="relative text-center font-mono">
                    {formatSize(ask.size)}
                  </div>
                  <div className="relative text-right font-mono text-muted-foreground">
                    {formatValue(ask.price, ask.size)}
                  </div>
                </div>
              ))}
            </div>

            {/* Spread Separator */}
            <div className="my-4 relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background px-3 text-xs text-muted-foreground border rounded">
                  Spread: ${formatPrice(spreadData.spread)}
                </div>
              </div>
            </div>

            {/* Bids (Buys) - Green */}
            <div className="space-y-1">
              {orderBook.bids.map((bid, index) => (
                <div
                  key={`bid-${bid.price}-${index}`}
                  className={cn(
                    "relative grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded cursor-pointer",
                    "hover:bg-green-500/10 transition-colors",
                    onPriceClick && "hover:bg-green-500/20"
                  )}
                  onClick={() => onPriceClick?.(bid.price, 'buy')}
                >
                  {/* Volume bar background */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-green-500/10 rounded"
                    style={{ 
                      width: `${(bid.size / maxVolume) * 100}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                  
                  <div className="relative font-mono text-green-500">
                    ${formatPrice(bid.price)}
                  </div>
                  <div className="relative text-center font-mono">
                    {formatSize(bid.size)}
                  </div>
                  <div className="relative text-right font-mono text-muted-foreground">
                    {formatValue(bid.price, bid.size)}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {orderBook.bids.length === 0 && orderBook.asks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No order book data available</p>
                <p className="text-xs">Waiting for live updates...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}