import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ExternalLink, TrendingUp, Users, DollarSign, BarChart3, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingPanel } from "@/components/trading/TradingPanel"

// Mock agent data - would come from API in real app
const getAgentById = (id: string) => {
  const agents = [
    {
      id: "1",
      name: "NeuralFlow",
      symbol: "NFLOW",
      avatar: "/placeholder.svg",
      fdv: "$7.41m",
      price: "$0.0074",
      change: "+15.55%",
      change24h: "+12.3%",
      volume24h: "$2.1m",
      marketCap: "$7.41m",
      totalSupply: "1B",
      chain: "Base",
      isPositive: true,
      description: "NeuralFlow is an advanced AI trading agent that uses deep neural networks to analyze market patterns and execute high-frequency trades across multiple DEXs.",
      category: "Trading",
      launched: "2024-01-15",
      holders: 1243,
      transactions: 15432,
      revenue: "$245.6k",
      buyback: "$89.2k",
      balance: "1,234.56", // User's balance of this token
      features: ["Automated Trading", "Risk Management", "Multi-Chain", "Real-time Analytics"],
      socialLinks: {
        twitter: "https://twitter.com/neuralflow",
        discord: "https://discord.gg/neuralflow",
        website: "https://neuralflow.ai"
      }
    }
    // Add more agents as needed
  ]
  
  return agents.find(agent => agent.id === id) || agents[0]
}

export const AgentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const agent = getAgentById(id || "1")

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
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{agent.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{agent.symbol}</Badge>
                    <Badge variant="outline">{agent.category}</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
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
              <div className="text-2xl font-bold">{agent.price}</div>
              <div className={`text-sm font-medium ${agent.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {agent.change} (24h)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agent.marketCap}</div>
              <div className="text-sm text-muted-foreground">FDV: {agent.fdv}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agent.volume24h}</div>
              <div className="text-sm text-green-400">+8.2%</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Holders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agent.holders.toLocaleString()}</div>
              <div className="text-sm text-green-400">+5.1%</div>
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
                <TabsTrigger value="trading">Trading</TabsTrigger>
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
                        <div className="font-medium">{agent.launched}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Supply</div>
                        <div className="font-medium">{agent.totalSupply}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Blockchain</div>
                        <div className="font-medium">{agent.chain}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                        <div className="font-medium">{agent.transactions.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trading" className="space-y-6">
                <TradingPanel agent={{
                  name: agent.name,
                  symbol: agent.symbol,
                  price: agent.price,
                  balance: agent.balance
                }} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-12">
                      Analytics dashboard coming soon...
                    </div>
                  </CardContent>
                </Card>
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
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">{agent.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyback</span>
                  <span className="font-medium">{agent.buyback}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-medium text-green-400">+24.5%</span>
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
                  <span className="text-muted-foreground">All-time High</span>
                  <span className="font-medium">$0.0089</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All-time Low</span>
                  <span className="font-medium">$0.0021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">7d Change</span>
                  <span className="font-medium text-green-400">+18.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-600/90">
                  Buy {agent.symbol}
                </Button>
                <Button variant="outline" className="w-full">
                  Sell {agent.symbol}
                </Button>
                <Button variant="outline" className="w-full">
                  Set Price Alert
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}