import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, TrendingDown } from "lucide-react"

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

interface SolanaOrderBookProps {
  token: any
  onPriceSelect?: (price: number) => void
}

export const SolanaOrderBook: React.FC<SolanaOrderBookProps> = ({ 
  token, 
  onPriceSelect 
}) => {
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)

  // Generate sample order book data
  useEffect(() => {
    if (!token?.price) return

    const generateOrderBook = () => {
      const basePrice = token.price
      const newBids: OrderBookEntry[] = []
      const newAsks: OrderBookEntry[] = []
      
      // Generate bids (buy orders) - below current price
      let totalBidSize = 0
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 - (i + 1) * 0.001) // 0.1% steps down
        const size = Math.random() * 1000 + 100
        totalBidSize += size
        newBids.push({ price, size, total: totalBidSize })
      }
      
      // Generate asks (sell orders) - above current price
      let totalAskSize = 0
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 + (i + 1) * 0.001) // 0.1% steps up
        const size = Math.random() * 1000 + 100
        totalAskSize += size
        newAsks.push({ price, size, total: totalAskSize })
      }
      
      setBids(newBids)
      setAsks(newAsks.reverse()) // Show highest asks first
      
      // Calculate spread
      const bestBid = newBids[0]?.price || 0
      const bestAsk = newAsks[newAsks.length - 1]?.price || 0
      setSpread(((bestAsk - bestBid) / bestBid) * 100)
    }

    generateOrderBook()
    
    // Update every 2 seconds to simulate real-time data
    const interval = setInterval(generateOrderBook, 2000)
    return () => clearInterval(interval)
  }, [token?.price])

  const formatPrice = (price: number) => price.toFixed(4)
  const formatSize = (size: number) => size.toFixed(2)

  const getBarWidth = (total: number, maxTotal: number) => {
    return `${(total / maxTotal) * 100}%`
  }

  const maxBidTotal = Math.max(...bids.map(b => b.total), 1)
  const maxAskTotal = Math.max(...asks.map(a => a.total), 1)

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          Order Book - {token?.symbol}
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>Current Price: ${token?.price?.toFixed(4)}</span>
          <Badge variant="outline">
            Spread: {spread.toFixed(3)}%
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground border-b pb-2">
            <span>Price (SOL)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Asks</span>
            </div>
            {asks.map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 text-xs py-1 hover:bg-red-500/10 cursor-pointer transition-colors rounded"
                onClick={() => onPriceSelect?.(ask.price)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/20 transition-all duration-300"
                  style={{ width: getBarWidth(ask.total, maxAskTotal) }}
                />
                <span className="relative z-10 text-red-500 font-mono">
                  {formatPrice(ask.price)}
                </span>
                <span className="relative z-10 text-right font-mono">
                  {formatSize(ask.size)}
                </span>
                <span className="relative z-10 text-right font-mono text-muted-foreground">
                  {formatSize(ask.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Current Price */}
          <div className="flex items-center justify-center py-2 border-y bg-muted/20">
            <Badge variant="default" className="font-mono">
              ${token?.price?.toFixed(4)} SOL
            </Badge>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Bids</span>
            </div>
            {bids.map((bid, index) => (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 text-xs py-1 hover:bg-green-500/10 cursor-pointer transition-colors rounded"
                onClick={() => onPriceSelect?.(bid.price)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-green-500/20 transition-all duration-300"
                  style={{ width: getBarWidth(bid.total, maxBidTotal) }}
                />
                <span className="relative z-10 text-green-500 font-mono">
                  {formatPrice(bid.price)}
                </span>
                <span className="relative z-10 text-right font-mono">
                  {formatSize(bid.size)}
                </span>
                <span className="relative z-10 text-right font-mono text-muted-foreground">
                  {formatSize(bid.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Order Book Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Best Bid</p>
              <p className="font-mono text-green-500">{formatPrice(bids[0]?.price || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Best Ask</p>
              <p className="font-mono text-red-500">{formatPrice(asks[asks.length - 1]?.price || 0)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}