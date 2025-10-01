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
import { ArrowLeft, Star, Bell, PieChart, Newspaper, Filter, GitCompare, Calendar, Map } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

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

  const { data: crypto } = useQuery({
    queryKey: ["crypto-markets"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false"
      );
      return response.json();
    },
  })

  const filteredAndSortedCrypto = useMemo(() => {
    if (!crypto) return []
    
    let filtered = [...crypto]

    // Apply filters
    if (filters.minPrice) {
      filtered = filtered.filter(c => c.current_price >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(c => c.current_price <= parseFloat(filters.maxPrice))
    }
    if (filters.minMarketCap) {
      filtered = filtered.filter(c => c.market_cap >= parseFloat(filters.minMarketCap) * 1e9)
    }
    if (filters.maxMarketCap) {
      filtered = filtered.filter(c => c.market_cap <= parseFloat(filters.maxMarketCap) * 1e9)
    }
    if (filters.minVolume) {
      filtered = filtered.filter(c => c.total_volume >= parseFloat(filters.minVolume) * 1e6)
    }
    if (filters.maxVolume) {
      filtered = filtered.filter(c => c.total_volume <= parseFloat(filters.maxVolume) * 1e6)
    }
    if (filters.minChange) {
      filtered = filtered.filter(c => c.price_change_percentage_24h >= parseFloat(filters.minChange))
    }
    if (filters.maxChange) {
      filtered = filtered.filter(c => c.price_change_percentage_24h <= parseFloat(filters.maxChange))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof typeof a] as number
      const bVal = b[filters.sortBy as keyof typeof b] as number
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

  return (
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2">
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
  )
}
