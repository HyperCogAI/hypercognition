import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolanaPortfolioCard } from "@/components/portfolio/SolanaPortfolioCard"
import { SolanaMarketOverview } from "@/components/trading/SolanaMarketOverview"
import { SolanaAnalyticsDashboard } from "@/components/analytics/SolanaAnalyticsDashboard"
import { SolanaDEX } from "@/components/solana/SolanaDEX"
import { SolanaLimitOrderPanel } from "@/components/solana/SolanaLimitOrderPanel"
import { RecentSwaps } from "@/components/solana/RecentSwaps"
import { SEOHead } from "@/components/seo/SEOHead"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, Zap, DollarSign, BarChart3 } from "lucide-react"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import type { SolanaToken } from "@/hooks/useSolanaRealtime"

const SolanaDashboard = () => {
  const { tokens, isLoading } = useSolanaRealtime()
  const { isConnected } = useSolanaWallet()
  const [selectedToken, setSelectedToken] = useState<SolanaToken | null>(null)

  const topTokens = tokens.slice(0, 3)
  const totalMarketCap = tokens.reduce((sum, token) => sum + token.market_cap, 0)
  const totalVolume = tokens.reduce((sum, token) => sum + token.volume_24h, 0)
  const topGainer = useMemo(() => {
    return tokens.length > 0 
      ? [...tokens].sort((a, b) => b.change_24h - a.change_24h)[0]
      : null
  }, [tokens])

  // Find Solana token by symbol, fallback to first token
  const defaultToken = useMemo(() => {
    const solToken = tokens.find(t => t.symbol === 'SOL')
    return solToken || tokens[0] || null
  }, [tokens])

  // Use selected token or default to SOL
  const chartToken = selectedToken || defaultToken

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SEOHead 
        title="Solana Dashboard - HyperCognition"
        description="Complete Solana ecosystem dashboard with portfolio tracking, live prices, trading, and staking features."
        keywords="Solana dashboard, SOL trading, Solana portfolio, Solana staking, SPL tokens"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Solana Ecosystem
          </h1>
          <p className="text-muted-foreground mt-2">
            Trade, stake, and manage your Solana assets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Live Data
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalMarketCap / 1e9).toFixed(2)}B
            </div>
            <p className="text-xs text-muted-foreground">
              Across {tokens.length} tokens
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalVolume / 1e6).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Active Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokens.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracking live
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              Top Gainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topGainer && (
              <>
                <div className="text-lg font-bold">{topGainer.symbol}</div>
                <p className={`text-xs ${topGainer.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {topGainer.change_24h >= 0 ? '+' : ''}{topGainer.change_24h.toFixed(2)}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dex" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dex">DEX</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dex" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SolanaDEX />
              <SolanaLimitOrderPanel />
            </div>
            <div>
              <RecentSwaps />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <SolanaMarketOverview onTokenSelect={setSelectedToken} />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <SolanaPortfolioCard />
        </TabsContent>

        <TabsContent value="staking" className="space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Solana Staking</CardTitle>
              <CardDescription>
                Stake your SOL and SPL tokens to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">SOL Staking</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Stake SOL to secure the network
                    </p>
                    <div className="text-lg font-bold text-green-500">5.2% APY</div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Coming Soon
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Liquid Staking</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Stake while keeping liquidity
                    </p>
                    <div className="text-lg font-bold text-blue-500">4.8% APY</div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Coming Soon
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">DeFi Pools</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Provide liquidity to earn fees
                    </p>
                    <div className="text-lg font-bold text-purple-500">12.5% APY</div>
                    <Button size="sm" className="w-full mt-2" disabled>
                      Coming Soon
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SolanaAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SolanaDashboard