import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealTimeOrderBook } from '@/hooks/useRealTimeMarketData'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealTimeOrderBookProps {
  symbol: string
  precision?: number
  maxDepth?: number
}

export const RealTimeOrderBook = ({ 
  symbol, 
  precision = 2, 
  maxDepth = 10 
}: RealTimeOrderBookProps) => {
  const { data: orderBook, loading, error, lastUpdate, refetch } = useRealTimeOrderBook(symbol, maxDepth * 2)

  const processedData = useMemo(() => {
    if (!orderBook) return null

    const bids = orderBook.bids.slice(0, maxDepth)
    const asks = orderBook.asks.slice(0, maxDepth).reverse()

    const maxBidVolume = Math.max(...bids.map(bid => bid.quantity))
    const maxAskVolume = Math.max(...asks.map(ask => ask.quantity))
    const maxVolume = Math.max(maxBidVolume, maxAskVolume)

    const spread = asks.length > 0 && bids.length > 0 
      ? asks[asks.length - 1].price - bids[0].price 
      : 0

    const spreadPercent = spread > 0 && bids.length > 0 
      ? (spread / bids[0].price) * 100 
      : 0

    return {
      bids: bids.map(bid => ({
        ...bid,
        percentage: (bid.quantity / maxVolume) * 100
      })),
      asks: asks.map(ask => ({
        ...ask,
        percentage: (ask.quantity / maxVolume) * 100
      })),
      spread,
      spreadPercent,
      midPrice: bids.length > 0 && asks.length > 0 
        ? (bids[0].price + asks[asks.length - 1].price) / 2 
        : 0
    }
  }, [orderBook, maxDepth])

  const formatPrice = (price: number) => price.toFixed(precision)
  const formatQuantity = (quantity: number) => quantity.toFixed(4)
  const formatTotal = (total: number) => total.toFixed(2)

  if (loading && !orderBook) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Book
            <Skeleton className="h-4 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Book
            <button onClick={refetch} className="p-1 hover:bg-muted rounded">
              <RefreshCw className="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!processedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No order book data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Book - {symbol}</span>
          <div className="flex items-center gap-2">
            {processedData.spread > 0 && (
              <Badge variant="outline" className="text-xs">
                Spread: {formatPrice(processedData.spread)} ({processedData.spreadPercent.toFixed(3)}%)
              </Badge>
            )}
            <button onClick={refetch} className="p-1 hover:bg-muted rounded">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Price</div>
          <div className="text-center">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          {processedData.asks.map((ask, index) => (
            <div 
              key={`ask-${ask.price}-${index}`}
              className="relative grid grid-cols-3 gap-4 text-sm py-1 px-2 rounded"
            >
              <div 
                className="absolute inset-0 bg-red-500/10 rounded"
                style={{ width: `${ask.percentage}%` }}
              />
              <div className="relative text-red-500 font-mono">
                {formatPrice(ask.price)}
              </div>
              <div className="relative text-center font-mono">
                {formatQuantity(ask.quantity)}
              </div>
              <div className="relative text-right font-mono">
                {formatTotal(ask.total)}
              </div>
            </div>
          ))}
        </div>

        {/* Spread Indicator */}
        {processedData.midPrice > 0 && (
          <div className="flex items-center justify-center py-2 border-y bg-muted/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Mid Price:</span>
              <span className="font-mono font-medium">
                {formatPrice(processedData.midPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {processedData.bids.map((bid, index) => (
            <div 
              key={`bid-${bid.price}-${index}`}
              className="relative grid grid-cols-3 gap-4 text-sm py-1 px-2 rounded"
            >
              <div 
                className="absolute inset-0 bg-green-500/10 rounded"
                style={{ width: `${bid.percentage}%` }}
              />
              <div className="relative text-green-500 font-mono">
                {formatPrice(bid.price)}
              </div>
              <div className="relative text-center font-mono">
                {formatQuantity(bid.quantity)}
              </div>
              <div className="relative text-right font-mono">
                {formatTotal(bid.total)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span>Buy Orders</span>
          </div>
          <div className="text-center">
            Last Update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span>Sell Orders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}