import { Search, TrendingUp, BarChart3, Network } from "lucide-react"
import { AgentCard } from "@/components/agents/AgentCard"
import { AgentFundamentals } from "@/components/agents/AgentFundamentals"
import { AgentNetwork } from "@/components/agents/AgentNetwork"
import { SpotlightAgent } from "@/components/agents/SpotlightAgent"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for AI agents
const trendingAgents = [
  {
    id: "1",
    name: "Waveform",
    symbol: "WAVE",
    avatar: "/placeholder.svg",
    fdv: "$7.41m",
    change: "+15.55%",
    chain: "Base",
    isPositive: true
  },
  {
    id: "2", 
    name: "ArAIstotle",
    symbol: "ARIS",
    avatar: "/placeholder.svg",
    fdv: "$20.37m",
    change: "-13.12%",
    chain: "Base",
    isPositive: false
  },
  {
    id: "3",
    name: "G.A.M.E",
    symbol: "GAME", 
    avatar: "/placeholder.svg",
    fdv: "$15.19m",
    change: "-12.24%",
    chain: "Base",
    isPositive: false
  },
  {
    id: "4",
    name: "Axelrod",
    symbol: "AXEL",
    avatar: "/placeholder.svg", 
    fdv: "$7.36m",
    change: "-21.22%",
    chain: "Base",
    isPositive: false
  },
  {
    id: "5",
    name: "Ribbita", 
    symbol: "RIB",
    avatar: "/placeholder.svg",
    fdv: "$206.93m",
    change: "-3.66%",
    chain: "Base", 
    isPositive: false
  },
  {
    id: "6",
    name: "Fyni AI",
    symbol: "FYNI",
    avatar: "/placeholder.svg",
    fdv: "$3.43m", 
    change: "-12.95%",
    chain: "Base",
    isPositive: false
  }
]

const fundamentalAgents = [
  {
    id: "7",
    name: "Shekel Agentic Capital",
    symbol: "SHEK", 
    avatar: "/placeholder.svg",
    buyback: "$133.91k",
    revenue: "$382.02k",
    chain: "Base"
  },
  {
    id: "8",
    name: "717ai",
    symbol: "717AI",
    avatar: "/placeholder.svg", 
    buyback: "$165.45k",
    revenue: "$35.01k",
    chain: "Base"
  },
  {
    id: "9",
    name: "Loky", 
    symbol: "LOKY",
    avatar: "/placeholder.svg",
    buyback: "$57.37k",
    revenue: "$113.48k",
    chain: "Base"
  },
  {
    id: "10",
    name: "Super Connector",
    symbol: "CONN",
    avatar: "/placeholder.svg",
    buyback: "$11.89k", 
    revenue: "$108.72k",
    chain: "Base"
  }
]

export const AgentMarketplace = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">AI Agent Marketplace</h1>
        <div className="flex items-center gap-4">
          <SearchInput 
            placeholder="Search agents..." 
            className="w-80"
          />
          <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Trending & Fundamentals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending AI Agents */}
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Trending</h2>
            </div>
            <div className="text-sm text-muted-foreground mb-4">AI Agents</div>
            <div className="text-xs text-muted-foreground mb-4">FDV/Price %Δ</div>
            <div className="space-y-3">
              {trendingAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} variant="trending" />
              ))}
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
              {fundamentalAgents.map((agent) => (
                <AgentFundamentals key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Spotlight Agent */}
        <div className="lg:col-span-4">
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 bg-primary rounded-full" />
              <h2 className="text-xl font-semibold">Spotlight Agent</h2>
            </div>
            <SpotlightAgent />
          </div>
        </div>

        {/* Right Column - Agent Network */}
        <div className="lg:col-span-4">
          <div className="bg-card/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Agent Network</h2>
            </div>
            <AgentNetwork />
          </div>
        </div>
      </div>

      {/* Bottom Section - Genesis Launches */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Genesis Launches</h2>
              <p className="text-muted-foreground mb-4">
                Co-own AI agents with equal early access via Virgen Points, fair 24h bidding, and full refunds if goals aren't met.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold mb-2">Fair launch for all Virgens</div>
              <Button className="bg-primary hover:bg-primary/90">
                Create Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Status Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pledging">🔸 Pledging</TabsTrigger>
            <TabsTrigger value="upcoming">📅 Upcoming</TabsTrigger>
            <TabsTrigger value="succeeded">✅ Succeeded</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="text-center text-muted-foreground py-12">
              No launches available
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}