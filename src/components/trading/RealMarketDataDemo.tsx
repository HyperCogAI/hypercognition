import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, Wifi, WifiOff } from "lucide-react"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { useLiveMarketFeed } from "@/hooks/useLiveMarketFeed"
import { Skeleton } from "@/components/ui/skeleton"

export function RealMarketDataDemo() {
  const { 
    crypto, 
    solana, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useRealMarketData()
  
  // Get live market feed for top symbols
  const topSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'USDC', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK']
  const liveFeed = useLiveMarketFeed(topSymbols)

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Market Data</CardTitle>
          <CardDescription>Loading live cryptocurrency prices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Market Data</CardTitle>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Real Market Data
              {liveFeed.isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant="outline" className="text-xs">
                {liveFeed.isConnected ? 'LIVE' : 'OFFLINE'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Live prices from CoinGecko & Jupiter API
              {lastUpdated && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              {liveFeed.lastUpdate && (
                <span className="block text-xs text-green-600 mt-1">
                  Live feed: {liveFeed.lastUpdate.toLocaleTimeString()} ({liveFeed.symbols.length} symbols)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={liveFeed.refresh} variant="outline" size="sm" title="Refresh live feed">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={refreshData} variant="outline" size="sm" title="Refresh all data">
              Refresh All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto">
              Crypto ({crypto.length})
            </TabsTrigger>
            <TabsTrigger value="solana">
              Solana ({solana.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="space-y-4">
            {crypto.slice(0, 10).map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {coin.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {coin.symbol.toUpperCase()}
                    </Badge>
                    {liveFeed.getFeed(coin.symbol.toUpperCase()) && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        LIVE
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {liveFeed.getPrice(coin.symbol.toUpperCase()) > 0 
                        ? formatPrice(liveFeed.getPrice(coin.symbol.toUpperCase()))
                        : formatPrice(coin.current_price)
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMarketCap(coin.market_cap)}
                      {liveFeed.getFeed(coin.symbol.toUpperCase())?.volume_24h && (
                        <span className="block">
                          Vol: {formatMarketCap(liveFeed.getFeed(coin.symbol.toUpperCase())!.volume_24h)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(liveFeed.getFeed(coin.symbol.toUpperCase())?.change_24h ?? coin.price_change_percentage_24h) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <Badge
                      variant={(liveFeed.getFeed(coin.symbol.toUpperCase())?.change_24h ?? coin.price_change_percentage_24h) >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {(liveFeed.getFeed(coin.symbol.toUpperCase())?.change_24h ?? coin.price_change_percentage_24h) >= 0 ? '+' : ''}
                      {(liveFeed.getFeed(coin.symbol.toUpperCase())?.change_24h ?? coin.price_change_percentage_24h).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {crypto.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All {crypto.length} Cryptocurrencies
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="solana" className="space-y-4">
            {solana.slice(0, 10).map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {token.name}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {token.symbol.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(token.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMarketCap(token.market_cap)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {token.change_24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <Badge
                      variant={token.change_24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {token.change_24h >= 0 ? '+' : ''}
                      {((token.change_24h / token.price) * 100).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {solana.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All {solana.length} Solana Tokens
                </Button>
              </div>
            )}
            
            {solana.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No Solana tokens available</p>
                <p className="text-xs mt-2">
                  This may be due to API rate limits or network issues
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}