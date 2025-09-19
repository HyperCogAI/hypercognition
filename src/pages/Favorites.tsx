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
      {/* Header */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                My Favorites
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
          <Card className="bg-card/30 border-border/50">
            <CardContent className="pt-12 pb-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding AI agents to your favorites by clicking the star icon on agent cards
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
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

              <Card className="bg-card/30 border-border/50">
                <CardHeader className="pb-2">
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
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Your Favorite Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredFavorites.map((agent) => (
                    <div key={agent.id} className="p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors">
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
          <Card className="bg-card/30 border-border/50">
            <CardContent className="pt-12 pb-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
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