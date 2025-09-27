import { useState, useEffect } from "react"
import { ArrowLeft, Star, TrendingUp, TrendingDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { AgentCard } from "@/components/agents/AgentCard"
import { useWallet } from "@/hooks/useWallet"

interface FavoriteAgent {
  id: string
  name: string
  symbol: string
  avatar_url: string
  price: number
  change_24h: number
  market_cap: number
  volume_24h: number
  chain: string
}

export default function Favorites() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [favorites, setFavorites] = useState<FavoriteAgent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected) {
      fetchFavorites()
    } else {
      setLoading(false)
    }
  }, [isConnected])

  const fetchFavorites = async () => {
    try {
      const { data: userFavorites } = await supabase
        .from('user_favorites')
        .select(`
          agent_id,
          agents (*)
        `)
        .order('created_at', { ascending: false })

      if (userFavorites) {
        const favoriteAgents = userFavorites
          .filter(fav => fav.agents)
          .map(fav => ({
            id: fav.agents.id,
            name: fav.agents.name,
            symbol: fav.agents.symbol,
            avatar_url: fav.agents.avatar_url,
            price: Number(fav.agents.price),
            change_24h: Number(fav.agents.change_24h),
            market_cap: Number(fav.agents.market_cap),
            volume_24h: Number(fav.agents.volume_24h),
            chain: fav.agents.chain
          }))
        
        setFavorites(favoriteAgents)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFavorites = favorites.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <Star className="h-12 w-12 mx-auto text-yellow-400" />
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to view and manage your favorite AI agents
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              My Favorites
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your <span className="text-yellow-400 font-medium">favorite AI agents</span> in one convenient place
          </p>
          
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="gap-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </header>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your favorites...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20 max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20 w-fit mx-auto mb-6">
                <Star className="h-12 w-12 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Favorites Yet</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Start adding AI agents to your favorites by clicking the star icon on agent cards
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const best = favorites.reduce((prev, current) => 
                      current.change_24h > prev.change_24h ? current : prev
                    )
                    return (
                      <div>
                        <div className="text-lg font-bold">{best.symbol}</div>
                        <div className="text-sm text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{best.change_24h.toFixed(2)}%
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    ${(favorites.reduce((sum, agent) => sum + agent.market_cap, 0) / 1000000).toFixed(1)}M
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favorites List */}
            <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Favorite Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFavorites.map((agent) => (
                    <div key={agent.id} className="hover-scale">
                      <AgentCard 
                        agent={{
                          id: agent.id,
                          name: agent.name,
                          symbol: agent.symbol,
                          avatar: agent.avatar_url,
                          fdv: `$${(agent.market_cap / 1000000).toFixed(2)}m`,
                          change: `${agent.change_24h >= 0 ? '+' : ''}${agent.change_24h.toFixed(2)}%`,
                          chain: agent.chain,
                          isPositive: agent.change_24h >= 0
                        }}
                        variant="trending"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Search Results */}
        {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
          <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20 max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                <Search className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Results Found</h3>
              <p className="text-muted-foreground">
                No favorites match your search for "{searchTerm}"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}