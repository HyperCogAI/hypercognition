import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface OrderBookProps {
  agentId: string
  currentPrice: number
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

export function OrderBook({ agentId, currentPrice }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] })
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    // Simulate order book data (in real implementation, this would come from real order aggregation)
    const generateOrderBook = () => {
      const bids: OrderBookEntry[] = []
      const asks: OrderBookEntry[] = []
      
      // Generate realistic bids (below current price)
      for (let i = 1; i <= 10; i++) {
        const price = currentPrice * (1 - (i * 0.01)) // 1% decrements
        const amount = Math.random() * 1000 + 500
        bids.push({
          price,
          amount,
          total: price * amount
        })
      }
      
      // Generate realistic asks (above current price)
      for (let i = 1; i <= 10; i++) {
        const price = currentPrice * (1 + (i * 0.01)) // 1% increments
        const amount = Math.random() * 1000 + 500
        asks.push({
          price,
          amount,
          total: price * amount
        })
      }

      const newSpread = asks[0]?.price - bids[0]?.price || 0
      setSpread(newSpread)
      setOrderBook({ bids, asks })
    }

    generateOrderBook()
    
    // Update every 5 seconds to simulate real-time data
    const interval = setInterval(generateOrderBook, 5000)
    return () => clearInterval(interval)
  }, [agentId, currentPrice])

  const getDepthPercentage = (total: number, maxTotal: number) => {
    return (total / maxTotal) * 100
  }

  const maxBidTotal = Math.max(...orderBook.bids.map(bid => bid.total))
  const maxAskTotal = Math.max(...orderBook.asks.map(ask => ask.total))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
        <CardDescription>
          Real-time buy and sell orders
          <span className="ml-4 text-sm">
            Spread: {formatCurrency(spread)} ({((spread / currentPrice) * 100).toFixed(3)}%)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Bids (Buy Orders) */}
          <div>
            <div className="text-sm font-medium text-green-600 mb-2">Bids</div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-1">
                <div>Price</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
              </div>
              {orderBook.bids.slice(0, 8).map((bid, index) => (
                <div key={index} className="relative">
                  <div
                    className="absolute inset-0 bg-green-500/10 rounded"
                    style={{ width: `${getDepthPercentage(bid.total, maxBidTotal)}%` }}
                  />
                  <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-1">
                    <div className="text-green-600 font-mono">
                      {formatCurrency(bid.price)}
                    </div>
                    <div className="text-right font-mono">
                      {bid.amount.toFixed(0)}
                    </div>
                    <div className="text-right text-muted-foreground font-mono">
                      {formatCurrency(bid.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div>
            <div className="text-sm font-medium text-red-600 mb-2">Asks</div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-1">
                <div>Price</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
              </div>
              {orderBook.asks.slice(0, 8).map((ask, index) => (
                <div key={index} className="relative">
                  <div
                    className="absolute inset-0 bg-red-500/10 rounded"
                    style={{ width: `${getDepthPercentage(ask.total, maxAskTotal)}%` }}
                  />
                  <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-1">
                    <div className="text-red-600 font-mono">
                      {formatCurrency(ask.price)}
                    </div>
                    <div className="text-right font-mono">
                      {ask.amount.toFixed(0)}
                    </div>
                    <div className="text-right text-muted-foreground font-mono">
                      {formatCurrency(ask.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Price */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
          <div className="text-lg font-bold">
            {formatCurrency(currentPrice)}
          </div>
          <div className="text-xs text-muted-foreground">Current Price</div>
        </div>
      </CardContent>
    </Card>
  )
}