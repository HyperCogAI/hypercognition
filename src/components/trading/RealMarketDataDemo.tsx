import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react"
import { useRealMarketData } from "@/hooks/useRealMarketData"
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
              <Badge variant="outline" className="text-xs">
                LIVE
              </Badge>
            </CardTitle>
            <CardDescription>
              Live prices from CoinGecko & Jupiter API
              {lastUpdated && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
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
                  <Badge variant="secondary" className="text-xs">
                    {coin.symbol.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMarketCap(coin.market_cap)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <Badge
                      variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {coin.price_change_percentage_24h.toFixed(2)}%
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