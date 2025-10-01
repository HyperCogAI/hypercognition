import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { TrendingUp, TrendingDown, Flame, Zap, Volume2 } from "lucide-react"
import { useState } from "react"
import { ProfessionalPriceChart } from "@/components/charts/ProfessionalPriceChart"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export const TrendingCoins = () => {
  const { crypto = [], isLoading } = useRealMarketData()
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)

  if (isLoading || crypto.length === 0) return null

  // Calculate trending categories
  const topGainers = [...crypto]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)

  const topLosers = [...crypto]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5)

  const topVolume = [...crypto]
    .sort((a, b) => b.total_volume - a.total_volume)
    .slice(0, 5)

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${volume.toFixed(0)}`
  }

  const CoinRow = ({ coin }: { coin: any }) => (
    <div
      onClick={() => setSelectedCrypto(coin)}
      className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer border border-border/30"
    >
      <div className="flex items-center gap-3 flex-1">
        <div>
          <div className="font-semibold">{coin.name}</div>
          <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatPrice(coin.current_price)}</div>
        <Badge
          variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
          className={`text-xs ${
            coin.price_change_percentage_24h >= 0
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          {coin.price_change_percentage_24h >= 0 ? "+" : ""}
          {coin.price_change_percentage_24h.toFixed(2)}%
        </Badge>
      </div>
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Top Gainers */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <Flame className="h-5 w-5" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topGainers.map((coin) => (
              <CoinRow key={coin.id} coin={coin} />
            ))}
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <TrendingDown className="h-5 w-5" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topLosers.map((coin) => (
              <CoinRow key={coin.id} coin={coin} />
            ))}
          </CardContent>
        </Card>

        {/* Top Volume */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Volume2 className="h-5 w-5" />
              Highest Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topVolume.map((coin) => (
              <div
                key={coin.id}
                onClick={() => setSelectedCrypto(coin)}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer border border-border/30"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatVolume(coin.total_volume)}</div>
                  <div className="text-xs text-muted-foreground">24h Vol</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Price Chart Dialog */}
      <Dialog open={!!selectedCrypto} onOpenChange={(open) => { if (!open) setSelectedCrypto(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCrypto?.name}
              <Badge variant="outline">{selectedCrypto?.symbol.toUpperCase()}</Badge>
            </DialogTitle>
            <DialogDescription>
              Historical price chart and market statistics
            </DialogDescription>
          </DialogHeader>
          {selectedCrypto && (
            <ProfessionalPriceChart
              cryptoId={selectedCrypto.id}
              cryptoName={selectedCrypto.name}
              symbol={selectedCrypto.symbol}
              currentPrice={selectedCrypto.current_price}
              change24h={selectedCrypto.price_change_percentage_24h}
              high24h={selectedCrypto.high_24h}
              low24h={selectedCrypto.low_24h}
              volume24h={selectedCrypto.total_volume}
              marketCap={selectedCrypto.market_cap}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
