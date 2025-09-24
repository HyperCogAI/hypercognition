import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
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
  // Real data from Supabase order_book table
  const { data: orderBookData, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['order-book', symbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_book')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(maxDepth * 2); // Get enough data for bids and asks
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 1000 // Update every second for real-time data
  });

  const lastUpdate = new Date();

  const processedData = useMemo(() => {
    if (!orderBookData || orderBookData.length === 0) return null

    // Separate bids and asks from the real data
    const allBids = orderBookData
      .filter(order => order.side === 'buy')
      .sort((a, b) => b.price - a.price)
      .slice(0, maxDepth)
      .map(order => ({
        price: Number(order.price),
        quantity: Number(order.size), // Using 'size' field from database
        total: Number(order.total)
      }));

    const allAsks = orderBookData
      .filter(order => order.side === 'sell')
      .sort((a, b) => a.price - b.price)
      .slice(0, maxDepth)
      .map(order => ({
        price: Number(order.price),
        quantity: Number(order.size), // Using 'size' field from database
        total: Number(order.total)
      }));

    const maxBidVolume = Math.max(...allBids.map(bid => bid.quantity), 1)
    const maxAskVolume = Math.max(...allAsks.map(ask => ask.quantity), 1)
    const maxVolume = Math.max(maxBidVolume, maxAskVolume)

    const spread = allAsks.length > 0 && allBids.length > 0 
      ? allAsks[0].price - allBids[0].price 
      : 0;

    const spreadPercent = spread > 0 && allBids.length > 0 
      ? (spread / allBids[0].price) * 100 
      : 0

    return {
      bids: allBids,
      asks: allAsks,
      spread,
      spreadPercent,
      maxVolume
    }
  }, [orderBookData, maxDepth])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Book
            <Skeleton className="h-4 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !processedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Book
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load order book data</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { bids, asks, spread, spreadPercent, maxVolume } = processedData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Book - {symbol}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Spread: {spread.toFixed(precision)} ({spreadPercent.toFixed(2)}%)
            </Badge>
            <RefreshCw 
              className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary"
              onClick={() => refetch()}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x">
          {/* Bids (Buy Orders) */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-500">Bids</span>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs text-muted-foreground font-medium">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              
              {bids.map((bid, index) => {
                const volumePercent = (bid.quantity / maxVolume) * 100
                return (
                  <div key={index} className="relative">
                    <div 
                      className="absolute inset-y-0 right-0 bg-green-500/10 transition-all"
                      style={{ width: `${volumePercent}%` }}
                    />
                    <div className="relative grid grid-cols-3 py-1 text-sm hover:bg-muted/50">
                      <span className="text-green-500 font-mono">
                        {bid.price.toFixed(precision)}
                      </span>
                      <span className="text-right font-mono">
                        {bid.quantity.toFixed(4)}
                      </span>
                      <span className="text-right font-mono text-muted-foreground">
                        {bid.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-500">Asks</span>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs text-muted-foreground font-medium">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              
              {asks.map((ask, index) => {
                const volumePercent = (ask.quantity / maxVolume) * 100
                return (
                  <div key={index} className="relative">
                    <div 
                      className="absolute inset-y-0 right-0 bg-red-500/10 transition-all"
                      style={{ width: `${volumePercent}%` }}
                    />
                    <div className="relative grid grid-cols-3 py-1 text-sm hover:bg-muted/50">
                      <span className="text-red-500 font-mono">
                        {ask.price.toFixed(precision)}
                      </span>
                      <span className="text-right font-mono">
                        {ask.quantity.toFixed(4)}
                      </span>
                      <span className="text-right font-mono text-muted-foreground">
                        {ask.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <span>{bids.length + asks.length} orders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}