import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, TrendingUp, TrendingDown, Volume2, Clock, Search, Star } from 'lucide-react'

interface MarketTicker {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
  lastUpdate: number
}

export const MarketDataFeed: React.FC = () => {
  const [tickers, setTickers] = useState<MarketTicker[]>([])
  const [filteredTickers, setFilteredTickers] = useState<MarketTicker[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('volume')
  const [watchlist, setWatchlist] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Generate mock market data
    const generateTickers = (): MarketTicker[] => {
      const symbols = [
        { symbol: 'BTC/USDT', name: 'Bitcoin' },
        { symbol: 'ETH/USDT', name: 'Ethereum' },
        { symbol: 'SOL/USDT', name: 'Solana' },
        { symbol: 'BNB/USDT', name: 'BNB' },
        { symbol: 'ADA/USDT', name: 'Cardano' },
        { symbol: 'XRP/USDT', name: 'Ripple' },
        { symbol: 'DOGE/USDT', name: 'Dogecoin' },
        { symbol: 'MATIC/USDT', name: 'Polygon' },
        { symbol: 'DOT/USDT', name: 'Polkadot' },
        { symbol: 'AVAX/USDT', name: 'Avalanche' },
        { symbol: 'LINK/USDT', name: 'Chainlink' },
        { symbol: 'UNI/USDT', name: 'Uniswap' }
      ]

      return symbols.map(({ symbol, name }) => {
        const basePrice = Math.random() * 1000 + 10
        const change24h = (Math.random() - 0.5) * basePrice * 0.15
        const changePercent = (change24h / basePrice) * 100
        
        return {
          symbol,
          name,
          price: basePrice,
          change24h,
          changePercent24h: changePercent,
          volume24h: Math.random() * 1000000000,
          high24h: basePrice + Math.abs(change24h) * 0.5,
          low24h: basePrice - Math.abs(change24h) * 0.5,
          marketCap: Math.random() * 100000000000,
          lastUpdate: Date.now()
        }
      })
    }

    setIsConnected(true)
    const updateTickers = () => {
      const newTickers = generateTickers()
      setTickers(newTickers)
    }

    // Initial load
    updateTickers()
    
    // Update every 2 seconds
    const interval = setInterval(updateTickers, 2000)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    let filtered = tickers.filter(ticker => 
      ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort tickers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price
        case 'change':
          return b.changePercent24h - a.changePercent24h
        case 'volume':
          return b.volume24h - a.volume24h
        default:
          return 0
      }
    })

    setFilteredTickers(filtered)
  }, [tickers, searchTerm, sortBy])

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const formatPrice = (price: number) => {
    if (price >= 1) return price.toFixed(2)
    if (price >= 0.01) return price.toFixed(4)
    return price.toFixed(8)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toFixed(0)
  }

  const TickerRow: React.FC<{ ticker: MarketTicker }> = ({ ticker }) => (
    <div className="grid grid-cols-6 gap-4 p-3 hover:bg-muted/50 transition-colors border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleWatchlist(ticker.symbol)}
          className="h-6 w-6 p-0"
        >
          <Star 
            className={`h-3 w-3 ${
              watchlist.includes(ticker.symbol) ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`} 
          />
        </Button>
        <div>
          <div className="font-medium text-sm">{ticker.symbol}</div>
          <div className="text-xs text-muted-foreground">{ticker.name}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-mono text-sm">${formatPrice(ticker.price)}</div>
      </div>
      
      <div className="text-right">
        <div className={`text-sm ${ticker.changePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
          {ticker.changePercent24h >= 0 ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
        </div>
        <div className={`text-xs ${ticker.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
          {ticker.change24h >= 0 ? '+' : ''}${ticker.change24h.toFixed(2)}
        </div>
      </div>
      
      <div className="text-right text-sm">
        ${formatVolume(ticker.volume24h)}
      </div>
      
      <div className="text-right text-sm">
        <div>${formatPrice(ticker.high24h)}</div>
        <div className="text-muted-foreground">${formatPrice(ticker.low24h)}</div>
      </div>
      
      <div className="text-right text-xs text-muted-foreground">
        {new Date(ticker.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  )

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Data Feed
            </CardTitle>
            <CardDescription>Real-time cryptocurrency prices and market data</CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            {isConnected ? 'Live' : 'Disconnected'}
          </Badge>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change">Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist ({watchlist.length})</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
          </TabsList>

          {/* Headers */}
          <div className="grid grid-cols-6 gap-4 p-3 text-xs font-medium text-muted-foreground border-b">
            <div>Market</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">Volume</div>
            <div className="text-right">High/Low</div>
            <div className="text-right">Last Update</div>
          </div>

          <TabsContent value="all" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredTickers.map(ticker => (
                <TickerRow key={ticker.symbol} ticker={ticker} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredTickers
                .filter(ticker => watchlist.includes(ticker.symbol))
                .map(ticker => (
                  <TickerRow key={ticker.symbol} ticker={ticker} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="gainers" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredTickers
                .filter(ticker => ticker.changePercent24h > 0)
                .sort((a, b) => b.changePercent24h - a.changePercent24h)
                .map(ticker => (
                  <TickerRow key={ticker.symbol} ticker={ticker} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}