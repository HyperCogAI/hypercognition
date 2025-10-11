import { ComprehensiveTradingDashboard } from "@/components/trading/ComprehensiveTradingDashboard"
import { MarketSentiment } from "@/components/trading/MarketSentiment"
import { TrendingCoins } from "@/components/trading/TrendingCoins"
import { WatchlistPanel } from "@/components/trading/WatchlistPanel"
import { PriceAlertsPanel } from "@/components/trading/PriceAlertsPanel"
import { PortfolioPanel } from "@/components/trading/PortfolioPanel"
import { CryptoNewsPanel } from "@/components/trading/CryptoNewsPanel"
import { AdvancedFilters, FilterState } from "@/components/trading/AdvancedFilters"
import { CoinComparisonTool } from "@/components/trading/CoinComparisonTool"
import { HistoricalPerformance } from "@/components/trading/HistoricalPerformance"
import { MarketHeatmap } from "@/components/trading/MarketHeatmap"
import { SearchInput } from "@/components/ui/search-input"
import { SEOHead } from "@/components/seo/SEOHead"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { ArrowLeft, Star, Bell, PieChart, Newspaper, Filter, GitCompare, Calendar, Map } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { coinGeckoApi } from "@/lib/apis/coinGeckoApi"

export default function MarketOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    minMarketCap: "",
    maxMarketCap: "",
    minVolume: "",
    maxVolume: "",
    minChange: "",
    maxChange: "",
    sortBy: "market_cap",
    sortOrder: "desc",
  })

  const { data: crypto, isLoading, isError, error } = useQuery({
    queryKey: ["coingecko-top", 100],
    queryFn: () => coinGeckoApi.getTopCryptos(100),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(30000, 1000 * 2 ** attempt),
  })

  const filteredAndSortedCrypto = useMemo(() => {
    if (!crypto || !Array.isArray(crypto) || crypto.length === 0) return []
    
    let filtered = [...crypto]

    // Apply filters with null-safe guards
    if (filters.minPrice) {
      filtered = filtered.filter(c => (c.current_price ?? 0) >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(c => (c.current_price ?? 0) <= parseFloat(filters.maxPrice))
    }
    if (filters.minMarketCap) {
      filtered = filtered.filter(c => (c.market_cap ?? 0) >= parseFloat(filters.minMarketCap) * 1e9)
    }
    if (filters.maxMarketCap) {
      filtered = filtered.filter(c => (c.market_cap ?? 0) <= parseFloat(filters.maxMarketCap) * 1e9)
    }
    if (filters.minVolume) {
      filtered = filtered.filter(c => (c.total_volume ?? 0) >= parseFloat(filters.minVolume) * 1e6)
    }
    if (filters.maxVolume) {
      filtered = filtered.filter(c => (c.total_volume ?? 0) <= parseFloat(filters.maxVolume) * 1e6)
    }
    if (filters.minChange) {
      filtered = filtered.filter(c => (c.price_change_percentage_24h ?? 0) >= parseFloat(filters.minChange))
    }
    if (filters.maxChange) {
      filtered = filtered.filter(c => (c.price_change_percentage_24h ?? 0) <= parseFloat(filters.maxChange))
    }

    // Apply sorting with null-safe guards
    filtered.sort((a, b) => {
      const aVal = (a[filters.sortBy as keyof typeof a] as number) ?? 0
      const bVal = (b[filters.sortBy as keyof typeof b] as number) ?? 0
      return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [crypto, filters])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      minMarketCap: "",
      maxMarketCap: "",
      minVolume: "",
      maxVolume: "",
      minChange: "",
      maxChange: "",
      sortBy: "market_cap",
      sortOrder: "desc",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-destructive text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Market Data</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An error occurred while fetching market data."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary name="MarketOverview">
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Market Overview - Live Cryptocurrency Data | HyperCognition"
          description="View real-time cryptocurrency market data including prices, market caps, volume, and 24h changes for top cryptocurrencies."
          keywords="crypto market, cryptocurrency prices, market overview, bitcoin price, ethereum price, live crypto data"
        />
        
        <main className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Live Market Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time cryptocurrency market data from CoinGecko
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Market Sentiment */}
        <MarketSentiment />

        {/* Trending Coins */}
        <TrendingCoins />

        {/* User Features Tabs */}
        <Tabs defaultValue="market" className="w-full mb-6">
          <TabsList className="w-full overflow-x-auto flex lg:grid lg:grid-cols-9 gap-1 scrollbar-hide">
            <TabsTrigger value="market" className="flex-shrink-0">
              <span className="lg:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex-shrink-0 gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-shrink-0 gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-shrink-0 gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex-shrink-0 gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex-shrink-0 gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex-shrink-0 gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-shrink-0 gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex-shrink-0 gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-6">
            <ComprehensiveTradingDashboard limit={100} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <WatchlistPanel />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <PriceAlertsPanel />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <PortfolioPanel />
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <CryptoNewsPanel />
          </TabsContent>

          <TabsContent value="filters" className="mt-6 space-y-6">
            <AdvancedFilters 
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredAndSortedCrypto.length} of {crypto?.length || 0} cryptocurrencies
            </div>
            <ComprehensiveTradingDashboard 
              limit={filteredAndSortedCrypto.length} 
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <CoinComparisonTool />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoricalPerformance />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-6">
            <MarketHeatmap />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ErrorBoundary>
  )
}
