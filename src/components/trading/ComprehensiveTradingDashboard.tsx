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

  // Show live indicator if data was updated in last 60 seconds
  const isLive = lastUpdated ? (Date.now() - lastUpdated.getTime() < 60000) : false

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
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl mb-2">
                  Live Market Data
                </CardTitle>
                <CardDescription className="text-sm">
                  Real-time cryptocurrency prices and market data
                </CardDescription>
              </div>
              <Button onClick={refreshData} variant="outline" size="sm" className="flex-shrink-0">
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isLive && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                  Live
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {crypto.length} Assets
              </Badge>
            </div>
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
                  return (
                <div 
                  key={token.id}
                  onClick={() => setSelectedCrypto(token)}
                  className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground w-5 sm:w-6 flex-shrink-0">{index + 1}</span>
                    {token.image && (
                      <img src={token.image} alt={token.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 max-w-[120px] sm:max-w-none">
                      <div className="font-semibold text-sm sm:text-base truncate">{token.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{token.symbol.toUpperCase()}</div>
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
                      <div className="font-semibold text-sm sm:text-base">{formatPrice(token.current_price)}</div>
                      <div className={`text-xs sm:text-sm ${(token.price_change_percentage_24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(token.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{Number(token.price_change_percentage_24h ?? 0).toFixed(2)}%
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
                  className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-green-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    {token.image && (
                      <img src={token.image} alt={token.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{token.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">{formatPrice(token.current_price)}</div>
                    <div className="text-xs sm:text-sm text-green-500 flex items-center gap-1 justify-end">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      +{Number(token.price_change_percentage_24h ?? 0).toFixed(2)}%
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
                  className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-red-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                    {token.image && (
                      <img src={token.image} alt={token.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{token.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">{formatPrice(token.current_price)}</div>
                    <div className="text-xs sm:text-sm text-red-500 flex items-center gap-1 justify-end">
                      <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      {Number(token.price_change_percentage_24h ?? 0).toFixed(2)}%
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
                  className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    {token.image && (
                      <img src={token.image} alt={token.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
                    )}
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{token.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{token.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">{formatVolume(token.total_volume)}</div>
                    <div className={`text-xs sm:text-sm ${(token.price_change_percentage_24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(token.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{Number(token.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* CTA to full market overview - only show when viewing limited data */}
          {limit < crypto.length && (
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
          )}
        </CardContent>
      </Card>

      {/* Price Chart Dialog */}
      <Dialog open={!!selectedCrypto} onOpenChange={(open) => { if (!open) setSelectedCrypto(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCrypto?.image && (
                <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-7 h-7 rounded-full" />
              )}
              {selectedCrypto?.name}
              <Badge variant="outline">{selectedCrypto?.symbol.toUpperCase()}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedCrypto) {
                    if (isInWatchlist(selectedCrypto.id)) {
                      removeFromWatchlist(selectedCrypto.id)
                    } else {
                      addToWatchlist(selectedCrypto.id, selectedCrypto.name, selectedCrypto.symbol)
                    }
                  }
                }}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    selectedCrypto && isInWatchlist(selectedCrypto.id) && "fill-yellow-500 text-yellow-500"
                  )}
                />
              </Button>
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
