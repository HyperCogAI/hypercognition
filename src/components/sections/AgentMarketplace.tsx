import { useState, useEffect } from "react"
import { TrendingUp, BarChart3, Network } from "lucide-react"
import { AgentCard } from "@/components/agents/AgentCard"
import { AgentFundamentals } from "@/components/agents/AgentFundamentals"
import { AgentNetwork } from "@/components/agents/AgentNetwork"
import { SpotlightAgent } from "@/components/agents/SpotlightAgent"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentCardSkeleton } from "@/components/ui/loading-skeleton"
import { supabase } from "@/integrations/supabase/client"

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
}

interface TrendingAgent {
  id: string
  name: string
  symbol: string
  avatar: string
  fdv: string
  change: string
  chain: string
  isPositive: boolean
}

interface FundamentalAgent {
  id: string
  name: string
  symbol: string
  avatar: string
  buyback: string
  revenue: string
  chain: string
}

export const AgentMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [trendingAgents, setTrendingAgents] = useState<TrendingAgent[]>([])
  const [fundamentalAgents, setFundamentalAgents] = useState<FundamentalAgent[]>([])
  
  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('market_cap', { ascending: false })

        if (error) {
          console.error('Error fetching agents:', error)
          return
        }

        if (data) {
          setAgents(data)
          
          // Transform data for trending agents
          const trending: TrendingAgent[] = data.map(agent => ({
            id: agent.id,
            name: agent.name,
            symbol: agent.symbol,
            avatar: agent.avatar_url || "/placeholder.svg",
            fdv: `$${(agent.market_cap / 1000000).toFixed(2)}m`,
            change: `${agent.change_24h >= 0 ? '+' : ''}${agent.change_24h.toFixed(2)}%`,
            chain: agent.chain,
            isPositive: agent.change_24h >= 0
          }))
          
          // Transform data for fundamental agents (using volume as revenue and market cap as buyback)
          const fundamentals: FundamentalAgent[] = data.slice(0, 4).map(agent => ({
            id: agent.id,
            name: agent.name,
            symbol: agent.symbol,
            avatar: agent.avatar_url || "/placeholder.svg",
            buyback: `$${(agent.market_cap / 1000).toFixed(0)}k`,
            revenue: `$${(agent.volume_24h / 1000).toFixed(0)}k`,
            chain: agent.chain
          }))
          
          setTrendingAgents(trending)
          setFundamentalAgents(fundamentals)
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [])
  
  // Filter agents based on search term
  const filteredTrendingAgents = trendingAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredFundamentalAgents = fundamentalAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 gradient-mesh">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div className="animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Agent Marketplace
          </h1>
          <p className="text-muted-foreground mt-1 animate-fade-up stagger-1">
            Discover and trade the future of autonomous AI
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up stagger-2">
          <SearchInput 
            placeholder="Search agents..." 
            className="w-full sm:w-80 glass-card border-primary/20 hover:border-primary/40 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="sm" className="glass-card border-primary/30 hover:border-primary/50 hover:glow-primary transition-all duration-300 hover-lift whitespace-nowrap">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column - Trending & Fundamentals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending AI Agents */}
          <div className="glass-card rounded-xl p-6 hover-lift animate-fade-up stagger-3">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary glow-primary" />
              <h2 className="text-xl font-semibold">Trending</h2>
              <div className="ml-auto w-2 h-2 bg-primary rounded-full pulse-glow" />
            </div>
            <div className="text-sm text-muted-foreground mb-4">AI Agents</div>
            <div className="text-xs text-muted-foreground mb-4">FDV/Price %Δ</div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`animate-fade-in stagger-${i + 1}`}>
                    <AgentCardSkeleton />
                  </div>
                ))
              ) : filteredTrendingAgents.length > 0 ? (
                filteredTrendingAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className={`animate-fade-in-scale hover-glow stagger-${index + 1}`}
                  >
                    <AgentCard agent={agent} variant="trending" />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 animate-fade-in">
                  <div className="shimmer h-4 w-3/4 mx-auto mb-2 rounded" />
                  No agents found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Fundamentals */}
          <div className="glass-card rounded-xl p-6 hover-lift animate-fade-up stagger-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-accent glow-accent" />
              <h2 className="text-xl font-semibold">Fundamentals</h2>
            </div>
            <div className="text-sm text-muted-foreground mb-4">AI Agents</div>
            <div className="text-xs text-muted-foreground mb-4">All Time Buyback / Revenue</div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`animate-fade-in stagger-${i + 1}`}>
                    <AgentCardSkeleton />
                  </div>
                ))
              ) : filteredFundamentalAgents.length > 0 ? (
                filteredFundamentalAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className={`animate-fade-in-scale hover-glow stagger-${index + 1}`}
                  >
                    <AgentFundamentals agent={agent} />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 animate-fade-in">
                  <div className="shimmer h-4 w-3/4 mx-auto mb-2 rounded" />
                  No agents found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Spotlight Agent */}
        <div className="lg:col-span-4 animate-fade-up stagger-5">
          <div className="glass-card rounded-xl p-6 h-full hover-lift relative overflow-hidden">
            {/* Animated background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl float" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-gradient-to-r from-primary to-accent rounded-full pulse-glow" />
                <h2 className="text-xl font-semibold">Spotlight Agent</h2>
                <div className="ml-auto text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                  Featured
                </div>
              </div>
              <SpotlightAgent />
            </div>
          </div>
        </div>

        {/* Right Column - Agent Network */}
        <div className="lg:col-span-4 animate-fade-up stagger-6">
          <div className="glass-card rounded-xl p-6 h-full hover-lift relative overflow-hidden">
            {/* Animated background element */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl float-delayed" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Network className="h-5 w-5 text-secondary glow-secondary" />
                <h2 className="text-xl font-semibold">Agent Network</h2>
                <div className="ml-auto">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce-subtle" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce-subtle stagger-1" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce-subtle stagger-2" />
                  </div>
                </div>
              </div>
              <AgentNetwork />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Genesis Launches */}
      <div className="relative z-10 mt-8 animate-fade-up stagger-3">
        <div className="glass-card rounded-xl p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 hover-lift relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl animate-spin-slow" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 to-transparent rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Genesis Launches
              </h2>
              <p className="text-muted-foreground mb-4 max-w-lg">
                Co-own AI agents with equal early access via Virgen Points, fair 24h bidding, and full refunds if goals aren't met.
              </p>
            </div>
            <div className="text-right animate-fade-up stagger-1">
              <div className="text-xl font-bold mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Fair launch for all Virgens
              </div>
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow hover-lift text-primary-foreground font-semibold"
                onClick={() => window.location.href = '/create-agent'}
              >
                Create Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Status Tabs */}
      <div className="relative z-10 mt-6 animate-fade-up stagger-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card border border-primary/20">
            <TabsTrigger value="all" className="hover:bg-primary/20 transition-all duration-300">All</TabsTrigger>
            <TabsTrigger value="pledging" className="hover:bg-primary/20 transition-all duration-300">🔸 Pledging</TabsTrigger>
            <TabsTrigger value="upcoming" className="hover:bg-primary/20 transition-all duration-300">📅 Upcoming</TabsTrigger>
            <TabsTrigger value="succeeded" className="hover:bg-primary/20 transition-all duration-300">✅ Succeeded</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="text-muted-foreground animate-fade-in">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce stagger-1" />
                    <div className="w-4 h-4 bg-secondary rounded-full animate-bounce stagger-2" />
                    <span className="ml-2">Loading launches...</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4 opacity-50">🚀</div>
                    <p className="text-lg">No launches available</p>
                    <p className="text-sm mt-2">Be the first to launch an AI agent!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}