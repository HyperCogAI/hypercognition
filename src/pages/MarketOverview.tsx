import { ComprehensiveTradingDashboard } from "@/components/trading/ComprehensiveTradingDashboard"
import { MarketSentiment } from "@/components/trading/MarketSentiment"
import { TrendingCoins } from "@/components/trading/TrendingCoins"
import { WatchlistPanel } from "@/components/trading/WatchlistPanel"
import { PriceAlertsPanel } from "@/components/trading/PriceAlertsPanel"
import { PortfolioPanel } from "@/components/trading/PortfolioPanel"
import { SearchInput } from "@/components/ui/search-input"
import { SEOHead } from "@/components/seo/SEOHead"
import { ArrowLeft, Star, Bell, PieChart } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function MarketOverview() {
  const [searchQuery, setSearchQuery] = useState("")

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-2">
              <Star className="h-4 w-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio
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
        </Tabs>
      </main>
    </div>
  )
}
