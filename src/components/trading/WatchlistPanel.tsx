import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCryptoWatchlist } from "@/hooks/useCryptoWatchlist"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { Star, TrendingUp, TrendingDown, Trash2, Bell, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { PriceAlertDialog } from "./PriceAlertDialog"
import { AddPortfolioDialog } from "./AddPortfolioDialog"

export const WatchlistPanel = () => {
  const { watchlist, isLoading, removeFromWatchlist } = useCryptoWatchlist()
  const { crypto = [] } = useRealMarketData()
  const [selectedForAlert, setSelectedForAlert] = useState<any>(null)
  const [selectedForPortfolio, setSelectedForPortfolio] = useState<any>(null)

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  const getWatchlistData = () => {
    return watchlist.map(item => {
      const liveData = crypto.find(c => c.id === item.crypto_id)
      return {
        ...item,
        current_price: liveData?.current_price || 0,
        price_change_percentage_24h: liveData?.price_change_percentage_24h || 0,
        market_cap: liveData?.market_cap || 0,
        total_volume: liveData?.total_volume || 0
      }
    })
  }

  const watchlistData = getWatchlistData()

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (watchlist.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            My Watchlist
          </CardTitle>
          <CardDescription>Track your favorite cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Your watchlist is empty</p>
            <p className="text-sm mt-1">Click the star icon on any cryptocurrency to add it</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            My Watchlist
            <Badge>{watchlist.length}</Badge>
          </CardTitle>
          <CardDescription>Track your favorite cryptocurrencies in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchlistData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="font-semibold">{item.crypto_name}</div>
                    <div className="text-sm text-muted-foreground">{item.crypto_symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(item.current_price)}</div>
                    <Badge
                      variant={item.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                      className={`text-xs ${
                        item.price_change_percentage_24h >= 0
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {item.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.price_change_percentage_24h >= 0 ? '+' : ''}
                      {item.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedForAlert(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedForPortfolio(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(item.crypto_id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PriceAlertDialog
        crypto={selectedForAlert}
        open={!!selectedForAlert}
        onOpenChange={(open) => !open && setSelectedForAlert(null)}
      />

      <AddPortfolioDialog
        crypto={selectedForPortfolio}
        open={!!selectedForPortfolio}
        onOpenChange={(open) => !open && setSelectedForPortfolio(null)}
      />
    </>
  )
}