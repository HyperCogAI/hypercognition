import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, Activity, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Star, ShoppingCart, ArrowRightLeft } from "lucide-react"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { useCryptoWatchlist } from "@/hooks/useCryptoWatchlist"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, useNavigate } from "react-router-dom"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { ProfessionalPriceChart } from "@/components/charts/ProfessionalPriceChart"
import { useState } from "react"
import { QuickAddToPortfolio } from "@/components/trading/QuickAddToPortfolio"
import { QuickTradeModal } from "@/components/trading/QuickTradeModal"
import { useRealtimePrices } from "@/hooks/useRealtimePrices"
import { useEffect } from "react"

export function ComprehensiveTradingDashboard({ limit = 10, searchQuery = "" }: { limit?: number; searchQuery?: string }) {
  const navigate = useNavigate();
  const { 
    crypto = [], 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useRealMarketData()
  
  const isMobile = useIsMobile()
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)
  const [portfolioCrypto, setPortfolioCrypto] = useState<any>(null)
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeModalCrypto, setTradeModalCrypto] = useState<any>(null)
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useCryptoWatchlist()

  // Get crypto IDs for real-time price updates
  const cryptoIds = crypto.slice(0, limit).map((c: any) => c.id)
  const { prices: realtimePrices, isConnected } = useRealtimePrices({ cryptoIds })

  const handleWatchlistToggle = async (coin: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInWatchlist(coin.id)) {
      await removeFromWatchlist(coin.id)
    } else {
      await addToWatchlist(coin.id, coin.name, coin.symbol)
    }
  }

  const handleAddToPortfolio = (coin: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setPortfolioCrypto(coin)
    setShowPortfolioDialog(true)
  }

  const handleTrade = (coin: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setTradeModalCrypto(coin)
    setShowTradeModal(true)
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  // Calculate market stats - with safe fallbacks
  const totalMarketCap = Array.isArray(crypto) ? crypto.reduce((sum, token) => sum + (token?.market_cap || 0), 0) : 0
  const total24hVolume = Array.isArray(crypto) ? crypto.reduce((sum, token) => sum + (token?.total_volume || 0), 0) : 0
  const avgChange24h = Array.isArray(crypto) && crypto.length > 0
    ? crypto.reduce((sum, token) => sum + (token?.price_change_percentage_24h || 0), 0) / crypto.length 
    : 0

  const topGainers = Array.isArray(crypto) && crypto.length > 0 
    ? [...crypto].sort((a, b) => (b?.price_change_percentage_24h || 0) - (a?.price_change_percentage_24h || 0)).slice(0, 5)
    : []
  const topLosers = Array.isArray(crypto) && crypto.length > 0
    ? [...crypto].sort((a, b) => (a?.price_change_percentage_24h || 0) - (b?.price_change_percentage_24h || 0)).slice(0, 5)
    : []
  const topByVolume = Array.isArray(crypto) && crypto.length > 0
    ? [...crypto].sort((a, b) => (b?.total_volume || 0) - (a?.total_volume || 0)).slice(0, 5)
    : []

  // Filter crypto based on search query
  const filteredCrypto = searchQuery
    ? crypto.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : crypto

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Live Market Dashboard</CardTitle>
          <CardDescription>Loading real-time cryptocurrency data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Live Market Dashboard</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Total Market Cap</CardDescription>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMarketCap(totalMarketCap)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs gap-1">
                <Activity className="h-3 w-3" />
                Real-time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">24h Volume</CardDescription>
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(total24hVolume)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Across {crypto.length} assets
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Avg 24h Change</CardDescription>
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${avgChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {avgChange24h >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {avgChange24h >= 0 ? '+' : ''}{avgChange24h.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Market sentiment
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Data Source</CardDescription>
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">CoinGecko</div>
            <div className="text-xs text-muted-foreground mt-1">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Real-time data'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data Tabs */}
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Live Market Data
                {isConnected && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30 animate-pulse">
                    Live
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {crypto.length} Assets
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time cryptocurrency prices and market data
              </CardDescription>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="top">Top {limit}</TabsTrigger>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
              <TabsTrigger value="volume">By Volume</TabsTrigger>
            </TabsList>

            {/* Top Cryptocurrencies */}
            <TabsContent value="top" className="space-y-3">
                {filteredCrypto.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No cryptocurrencies found matching "{searchQuery}"
                </div>
              ) : (
                filteredCrypto.slice(0, limit).map((token, index) => {
                  // Get real-time price if available
                  const realtimePrice = realtimePrices.get(token.id)
                  const displayPrice = realtimePrice?.current_price || token.current_price
                  const priceChange = realtimePrice?.price_change_percentage_24h || token.price_change_percentage_24h
                  
                  return (
                <div 
                  key={token.id}
                  onClick={() => setSelectedCrypto(token)}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Real-time indicator */}
                    <div className={`w-2 h-2 rounded-full ${realtimePrice ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                      onClick={(e) => handleWatchlistToggle(token, e)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isInWatchlist(token.id) && "fill-yellow-500 text-yellow-500"
                        )}
                      />
                    </Button>
                    <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                    {!isMobile && (
                      <div className="flex gap-1.5 mr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={(e) => handleAddToPortfolio(token, e)}
                          title="Add to Portfolio"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={(e) => handleTrade(token, e)}
                          title="Trade Now"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={isMobile ? "text-right" : "flex items-center gap-8 text-right"}>
                    <div>
                      <div className="font-semibold">{formatPrice(displayPrice)}</div>
                      <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                    </div>
                    {!isMobile && (
                      <>
                        <div>
                          <div className="text-xs text-muted-foreground">Market Cap</div>
                          <div className="text-sm font-medium">{formatMarketCap(token.market_cap)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Volume</div>
                          <div className="text-sm font-medium">{formatVolume(token.total_volume)}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}))}
            </TabsContent>

            {/* Top Gainers */}
            <TabsContent value="gainers" className="space-y-3">
              {topGainers.map((token, index) => (
                <div 
                  key={token.id}
                  onClick={() => setSelectedCrypto(token)}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-green-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <div className="font-semibold">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(token.current_price)}</div>
                    <div className="text-sm text-green-500 flex items-center gap-1 justify-end">
                      <ArrowUpRight className="h-4 w-4" />
                      +{token.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Top Losers */}
            <TabsContent value="losers" className="space-y-3">
              {topLosers.map((token, index) => (
                <div 
                  key={token.id}
                  onClick={() => setSelectedCrypto(token)}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-red-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <div className="font-semibold">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(token.current_price)}</div>
                    <div className="text-sm text-red-500 flex items-center gap-1 justify-end">
                      <ArrowDownRight className="h-4 w-4" />
                      {token.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* By Volume */}
            <TabsContent value="volume" className="space-y-3">
              {topByVolume.map((token, index) => (
                <div 
                  key={token.id}
                  onClick={() => setSelectedCrypto(token)}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Activity className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatVolume(token.total_volume)}</div>
                    <div className={`text-sm ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.price_change_percentage_24h >= 0 ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* CTA to full market overview */}
          <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
            <div>
              <div className="font-semibold">View Complete Market Data</div>
              <div className="text-sm text-muted-foreground">
                Explore detailed analytics for all {crypto.length}+ cryptocurrencies
              </div>
            </div>
            <Button asChild>
              <Link to="/market-overview">
                View Full Market
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Add to Portfolio Dialog */}
      {portfolioCrypto && (
        <QuickAddToPortfolio
          open={showPortfolioDialog}
          onOpenChange={setShowPortfolioDialog}
          crypto={portfolioCrypto}
        />
      )}

      {/* Quick Trade Modal */}
      {tradeModalCrypto && (
        <QuickTradeModal
          open={showTradeModal}
          onOpenChange={setShowTradeModal}
          crypto={tradeModalCrypto}
        />
      )}
    </div>
  )
}
