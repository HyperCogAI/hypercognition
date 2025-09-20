import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ExternalLink, TrendingUp, Users, DollarSign, BarChart3, Heart, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingPanel } from "@/components/trading/TradingPanel"
import { AdvancedTradingPanel } from "@/components/trading/AdvancedTradingPanel"
import { OrderBook } from "@/components/trading/OrderBook"
import { PriceChart } from "@/components/charts/PriceChart"
import { supabase } from "@/integrations/supabase/client"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  symbol: string
  description?: string
  price: number
  market_cap: number
  volume_24h: number
  change_24h: number
  chain: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UserHolding {
  total_amount: number
  average_cost: number
  total_invested: number
  unrealized_pnl: number
  realized_pnl: number
}

export const AgentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [userHolding, setUserHolding] = useState<UserHolding | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [priceHistory, setPriceHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!id) return

      try {
        // Fetch agent data
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id)
          .single()

        if (agentError) throw agentError
        setAgent(agentData)

        // Fetch user holding if logged in
        if (user) {
          const { data: holdingData } = await supabase
            .from('user_holdings')
            .select('*')
            .eq('user_id', user.id)
            .eq('agent_id', id)
            .maybeSingle()

          setUserHolding(holdingData)
        }

        // Fetch price history
        const { data: historyData } = await supabase
          .from('price_history')
          .select('*')
          .eq('agent_id', id)
          .order('timestamp', { ascending: true })
          .limit(24)

        setPriceHistory(historyData || [])
      } catch (error) {
        console.error('Error fetching agent data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgentData()
  }, [id, user])

  const handleFavoriteClick = () => {
    if (!agent) return
    
    if (isFavorite(agent.id)) {
      removeFromFavorites(agent.id)
    } else {
      addToFavorites(agent.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Agent Not Found</h2>
          <p className="text-muted-foreground">The requested AI agent could not be found.</p>
          <Button onClick={() => navigate('/')}>Back to Marketplace</Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}m`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPrice = (value: number) => {
    if (value < 0.01) {
      return `$${value.toFixed(6)}`
    }
    return `$${value.toFixed(4)}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="hover:bg-card/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={agent.avatar_url || "/placeholder.svg"} alt={agent.name} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{agent.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{agent.symbol}</Badge>
                    <Badge variant="outline">AI Agent</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFavoriteClick}
                className={cn(
                  "transition-colors",
                  isFavorite(agent.id) && "bg-yellow-400/10 border-yellow-400/50"
                )}
              >
                <Star className={cn(
                  "h-4 w-4 mr-2 transition-colors",
                  isFavorite(agent.id) ? "fill-yellow-400 text-yellow-400" : ""
                )} />
                {isFavorite(agent.id) ? "Favorited" : "Favorite"}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => document.getElementById('trading-tab')?.click()}
              >
                Trade Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Price & Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(agent.price)}</div>
              <div className={`text-sm font-medium ${agent.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}% (24h)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(agent.market_cap)}</div>
              <div className="text-sm text-muted-foreground">FDV: {formatCurrency(agent.market_cap)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(agent.volume_24h)}</div>
              <div className="text-sm text-green-400">+8.2%</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userHolding ? userHolding.total_amount.toFixed(2) : "0.00"}
              </div>
              <div className="text-sm text-muted-foreground">{agent.symbol}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trading" id="trading-tab">Trading</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>About {agent.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Launch Date</div>
                        <div className="font-medium">{new Date(agent.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Supply</div>
                        <div className="font-medium">1,000,000,000</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Blockchain</div>
                        <div className="font-medium">{agent.chain}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                        <div className="font-medium">{formatCurrency(agent.market_cap)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {userHolding && (
                  <Card className="bg-card/30 border-border/50">
                    <CardHeader>
                      <CardTitle>Your Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Holdings</div>
                          <div className="font-medium">{userHolding.total_amount.toFixed(2)} {agent.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Average Cost</div>
                          <div className="font-medium">{formatPrice(userHolding.average_cost)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Invested</div>
                          <div className="font-medium">{formatCurrency(userHolding.total_invested)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current Value</div>
                          <div className="font-medium">{formatCurrency(userHolding.total_amount * agent.price)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {["AI Trading", "Smart Contracts", "DeFi Integration", "Real-time Analytics"].map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trading" className="space-y-6">
                <Tabs defaultValue="simple" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="simple">Simple</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                  </TabsList>
                  <TabsContent value="simple" className="mt-6">
                    <TradingPanel 
                      agentId={agent.id}
                      agent={{
                        name: agent.name,
                        symbol: agent.symbol,
                        price: formatPrice(agent.price),
                        balance: userHolding ? userHolding.total_amount.toString() : "0.00"
                      }} 
                    />
                  </TabsContent>
                  <TabsContent value="advanced" className="mt-6">
                    <AdvancedTradingPanel
                      agentId={agent.id}
                      agentName={agent.name}
                      currentPrice={agent.price}
                      userBalance={userHolding?.total_amount || 0}
                    />
                  </TabsContent>
                  <TabsContent value="orderbook" className="mt-6">
                    <OrderBook
                      agentId={agent.id}
                      currentPrice={agent.price}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <PriceChart 
                  agentId={agent.id}
                  symbol={agent.symbol}
                  currentPrice={agent.price}
                  change24h={agent.change_24h}
                />
              </TabsContent>

              <TabsContent value="community" className="space-y-6">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Community & Social</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join Discord
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Follow on Twitter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume (24h)</span>
                  <span className="font-medium">{formatCurrency(agent.volume_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{formatCurrency(agent.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Change</span>
                  <span className={`font-medium ${agent.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-medium">{formatPrice(agent.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{agent.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-medium">{agent.chain}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-600/90"
                  onClick={() => document.getElementById('trading-tab')?.click()}
                >
                  Buy {agent.symbol}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('trading-tab')?.click()}
                >
                  Sell {agent.symbol}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFavoriteClick}
                >
                  {isFavorite(agent.id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}