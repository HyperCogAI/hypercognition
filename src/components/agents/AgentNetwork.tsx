import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const networkNodes = [
  { id: 1, name: "Veronica", x: 85, y: 15, size: "large", avatar: "/placeholder.svg" },
  { id: 2, name: "Director", x: 20, y: 35, size: "medium", avatar: "/placeholder.svg" },
  { id: 3, name: "AIMEK", x: 50, y: 45, size: "medium", avatar: "/placeholder.svg" },
  { id: 4, name: "Luna", x: 75, y: 60, size: "large", avatar: "/placeholder.svg" },
  { id: 5, name: "Acolyt", x: 95, y: 75, size: "medium", avatar: "/placeholder.svg" },
  { id: 6, name: "DaVinci", x: 45, y: 85, size: "medium", avatar: "/placeholder.svg" },
  { id: 7, name: "Maya", x: 25, y: 95, size: "small", avatar: "/placeholder.svg" },
  { id: 8, name: "Agent", x: 85, y: 95, size: "small", avatar: "/placeholder.svg" }
]

const connections = [
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 4, to: 6 },
  { from: 6, to: 7 },
  { from: 6, to: 8 },
  { from: 4, to: 8 }
]

export const AgentNetwork = () => {
  const getNodeById = (id: number) => networkNodes.find(node => node.id === id)
  
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
              <AvatarImage src={node.avatar} alt={node.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                {node.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
              node.size === "large" && "h-12 w-12",
              node.size === "medium" && "h-10 w-10",
              node.size === "small" && "h-8 w-8"
            )} />
          </div>
          
          {/* Name label */}
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {node.name}
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