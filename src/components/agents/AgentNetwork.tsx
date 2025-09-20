import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useAgentLogo } from "@/hooks/useAgentLogo"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
  symbol: string
  avatar_url: string | null
  market_cap: number
  logo_generated: boolean
}

interface NetworkNode {
  id: string
  name: string
  symbol: string
  x: number
  y: number
  size: "small" | "medium" | "large"
  avatar: string | null
  market_cap: number
  logo_generated: boolean
}

interface NetworkConnection {
  from: string
  to: string
}

const predefinedPositions = [
  { x: 85, y: 15, size: "large" as const },
  { x: 20, y: 35, size: "medium" as const },
  { x: 50, y: 45, size: "medium" as const },
  { x: 75, y: 60, size: "large" as const },
  { x: 95, y: 75, size: "medium" as const },
  { x: 45, y: 85, size: "medium" as const },
  { x: 25, y: 95, size: "small" as const },
  { x: 85, y: 95, size: "small" as const }
]

export const AgentNetwork = () => {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([])
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [loading, setLoading] = useState(true)
  const { generateLogo, isGenerating } = useAgentLogo()

  useEffect(() => {
    fetchNetworkAgents()
  }, [])

  const fetchNetworkAgents = async () => {
    try {
      // Get top 8 agents by market cap for the network
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id, name, symbol, avatar_url, market_cap, logo_generated')
        .order('market_cap', { ascending: false })
        .limit(8)

      if (error) throw error

      if (agents && agents.length > 0) {
        // Map agents to network nodes with predefined positions
        const nodes: NetworkNode[] = agents.map((agent, index) => ({
          id: agent.id,
          name: agent.name,
          symbol: agent.symbol,
          x: predefinedPositions[index]?.x || 50 + (index * 10),
          y: predefinedPositions[index]?.y || 50 + (index * 10),
          size: predefinedPositions[index]?.size || "medium",
          avatar: agent.avatar_url,
          market_cap: agent.market_cap,
          logo_generated: agent.logo_generated
        }))

        setNetworkNodes(nodes)

        // Generate connections between nodes (simplified network)
        const nodeConnections: NetworkConnection[] = []
        for (let i = 0; i < nodes.length - 1; i++) {
          // Connect each node to the next one
          nodeConnections.push({ from: nodes[i].id, to: nodes[i + 1].id })
          
          // Add some additional connections for complexity
          if (i < nodes.length - 2) {
            nodeConnections.push({ from: nodes[i].id, to: nodes[i + 2].id })
          }
        }
        
        setConnections(nodeConnections)
      }
    } catch (error) {
      console.error('Error fetching network agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLogo = async (node: NetworkNode) => {
    try {
      const logo = await generateLogo(
        node.name,
        node.symbol,
        "network connected",
        node.id
      )

      if (logo) {
        // Update local state
        setNetworkNodes(prev => prev.map(n => 
          n.id === node.id 
            ? { ...n, avatar: logo.imageUrl, logo_generated: true }
            : n
        ))
        
        toast.success(`Logo generated for ${node.name}!`)
      }
    } catch (error) {
      console.error('Error generating logo:', error)
      toast.error('Failed to generate logo')
    }
  }

  const getNodeById = (id: string) => networkNodes.find(node => node.id === id)

  if (loading) {
    return (
      <div className="relative h-80 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-lg overflow-hidden animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading network...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative h-80 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-lg overflow-hidden">
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((connection, index) => {
          const fromNode = getNodeById(connection.from)
          const toNode = getNodeById(connection.to)
          if (!fromNode || !toNode) return null
          
          return (
            <line
              key={index}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              opacity="0.3"
              className="animate-pulse"
            />
          )
        })}
      </svg>

      {/* Network Nodes */}
      {networkNodes.map((node) => (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="relative">
            <Avatar className={cn(
              "border-2 border-primary/50 transition-all duration-300 group-hover:scale-110 group-hover:border-primary",
              node.size === "large" && "h-12 w-12",
              node.size === "medium" && "h-10 w-10", 
              node.size === "small" && "h-8 w-8"
            )}>
              <AvatarImage src={node.avatar || "/placeholder.svg"} alt={node.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                {node.symbol.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            {/* Logo generation button for nodes without logos */}
            {!node.logo_generated && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handleGenerateLogo(node)}
                disabled={isGenerating}
              >
                <Sparkles className="h-2 w-2" />
              </Button>
            )}
            
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
              node.size === "large" && "h-12 w-12",
              node.size === "medium" && "h-10 w-10",
              node.size === "small" && "h-8 w-8"
            )} />
          </div>
          
          {/* Name label with symbol */}
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center">
              <div className="font-semibold">{node.name}</div>
              <div className="text-muted-foreground">{node.symbol}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}