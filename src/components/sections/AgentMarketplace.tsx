import { useState, useEffect } from "react"
import { SolanaTokenGrid } from "@/components/trading/SolanaTokenGrid"
import { TrendingUp, BarChart3, Network } from "lucide-react"
import { AgentCard } from "@/components/agents/AgentCard"
import { AgentFundamentals } from "@/components/agents/AgentFundamentals"
import { AgentNetwork } from "@/components/agents/AgentNetwork"
import { SpotlightAgent } from "@/components/agents/SpotlightAgent"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import gradientBlurBg from "@/assets/gradient_blur_top_blue.png"
import { supabase } from "@/integrations/supabase/client"
import { useRealtimeAllPrices } from "@/hooks/useRealtimePrice"
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery"
import { generateDefaultAvatar } from "@/utils/avatarUtils"

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
  const realtimePrices = useRealtimeAllPrices()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
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
          updateAgentDisplays(data)
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // Update agent displays when realtime prices change
  const updateAgentDisplays = (agentData: Agent[]) => {
    const agentsWithRealtimePrices = agentData.map(agent => {
      const realtimePrice = realtimePrices[agent.id]
      return {
        ...agent,
        price: realtimePrice?.price || agent.price,
        market_cap: realtimePrice?.market_cap || agent.market_cap,
        volume_24h: realtimePrice?.volume || agent.volume_24h
      }
    })

    // Transform data for trending agents
    const trending: TrendingAgent[] = agentsWithRealtimePrices.map(agent => ({
      id: agent.id,
      name: agent.name,
      symbol: agent.symbol,
      avatar: agent.avatar_url || generateDefaultAvatar(agent.name),
      fdv: `$${(agent.market_cap / 1000000).toFixed(2)}m`,
      change: `${agent.change_24h >= 0 ? '+' : ''}${agent.change_24h.toFixed(2)}%`,
      chain: agent.chain,
      isPositive: agent.change_24h >= 0
    }))
    
    // Transform data for fundamental agents (using volume as revenue and market cap as buyback)
    const fundamentals: FundamentalAgent[] = agentsWithRealtimePrices.slice(0, 4).map(agent => ({
      id: agent.id,
      name: agent.name,
      symbol: agent.symbol,
      avatar: agent.avatar_url || generateDefaultAvatar(agent.name),
      buyback: `$${(agent.market_cap / 1000).toFixed(0)}k`,
      revenue: `$${(agent.volume_24h / 1000).toFixed(0)}k`,
      chain: agent.chain
    }))
    
    setTrendingAgents(trending)
    setFundamentalAgents(fundamentals)
  }

  // Update displays when realtime prices change
  useEffect(() => {
    if (agents.length > 0) {
      updateAgentDisplays(agents)
    }
  }, [realtimePrices, agents])
  
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
    <div className="min-h-screen bg-background text-foreground p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
          AI Agent{" "}
          <span className="text-white">
            Marketplace
          </span>
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <SearchInput 
            placeholder="Search agents..." 
            className="w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50 whitespace-nowrap">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Optimized Layout */}
      {isMobile ? (
        <div className="space-y-6">
          {/* Mobile Spotlight Agent */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold">Spotlight Agent</h2>
            </div>
            <SpotlightAgent />
          </div>

          {/* Mobile Trending */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Trending</h2>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : filteredTrendingAgents.slice(0, 5).length > 0 ? (
                filteredTrendingAgents.slice(0, 5).map((agent, index) => (
                  <div
                    key={agent.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AgentCard agent={agent} variant="trending" />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No agents found
                </div>
              )}
            </div>
          </div>

          {/* Mobile Network */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Agent Network</h2>
            </div>
            <AgentNetwork />
          </div>
        </div>
      ) : (
        /* Desktop/Tablet Grid Layout */
        <div className={`grid gap-4 lg:gap-6 ${isTablet ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-12'}`}>
          {/* Left Column - Trending & Fundamentals */}
          <div className={`space-y-6 ${isTablet ? '' : 'lg:col-span-4'}`}>
          {/* Trending AI Agents */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Trending</h2>
            </div>
            <div className="text-sm text-muted-foreground mb-4">AI Agents</div>
            <div className="text-xs text-muted-foreground mb-4">FDV/Price %Δ</div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : filteredTrendingAgents.length > 0 ? (
                filteredTrendingAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AgentCard agent={agent} variant="trending" />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 animate-fade-in">
                  No agents found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Fundamentals */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Fundamentals</h2>
            </div>
            <div className="text-sm text-muted-foreground mb-4">AI Agents</div>
            <div className="text-xs text-muted-foreground mb-4">All Time Buyback / Revenue</div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : filteredFundamentalAgents.length > 0 ? (
                filteredFundamentalAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <AgentFundamentals agent={agent} />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 animate-fade-in">
                  No agents found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Spotlight Agent */}
        <div className={isTablet ? '' : 'lg:col-span-4'}>
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 bg-primary rounded-full" />
              <h2 className="text-xl font-semibold">Spotlight Agent</h2>
            </div>
            <SpotlightAgent />
          </div>
        </div>

        {/* Right Column - Agent Network */}
        <div className={isTablet ? '' : 'lg:col-span-4'}>
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Agent Network</h2>
            </div>
            <AgentNetwork />
          </div>
        </div>
      </div>
      )}

      {/* Bottom Section - Genesis Launches */}
      <div className="mt-8">
        <div className="relative bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4 sm:p-8 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-80 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url(${gradientBlurBg})` }}
          />
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'} relative z-10`}>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">HyperCognition Genesis Launch</h2>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base mt-4">
                Co-own next-gen AI trading agents with equal early access through Hyper Points.
              </p>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Enjoy a fair 24h bidding system and get a full refund if milestones aren't met.
              </p>
            </div>
            <div className={`${isMobile ? 'text-left' : 'text-right flex items-center'}`}>
              <Button 
                className="bg-primary/60 border border-white hover:bg-primary/70 text-white w-full sm:w-auto"
                onClick={() => window.location.href = '/create-agent'}
              >
                Create Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Status Tabs */}
      <div className="mt-6 bg-card border border-border/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} bg-muted`}>
            <TabsTrigger value="all">All</TabsTrigger>
            {!isMobile && <TabsTrigger value="pledging">🔸 Pledging</TabsTrigger>}
            <TabsTrigger value="upcoming">{isMobile ? '📅' : '📅 Upcoming'}</TabsTrigger>
            {!isMobile && <TabsTrigger value="succeeded">✅ Succeeded</TabsTrigger>}
          </TabsList>
          <TabsContent value="solana" className="mt-6">
            <SolanaTokenGrid />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <div className="text-center text-muted-foreground py-12">
              {isLoading ? (
                <div className="animate-pulse">Loading launches...</div>
              ) : (
                "No launches available"
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}