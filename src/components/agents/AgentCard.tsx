import { useNavigate } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { usePriceSimulation } from "@/hooks/usePriceSimulation"

interface Agent {
  id: string
  name: string
  symbol: string
  avatar: string
  fdv: string
  change: string
  chain: string
  isPositive: boolean
}

interface AgentCardProps {
  agent: Agent
  variant?: "trending" | "default"
}

export const AgentCard = ({ agent, variant = "default" }: AgentCardProps) => {
  const navigate = useNavigate()
  const priceData = usePriceSimulation(parseFloat(agent.fdv?.replace(/[$m,]/g, '') || '7.41'))
  
  const handleClick = () => {
    navigate(`/agent/${agent.id}`)
  }

  return (
    <div 
      className="flex items-center justify-between p-3 hover:bg-card/50 rounded-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] animate-fade-in" 
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {agent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Chain indicator */}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full" />
          </div>
        </div>
        <div>
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-muted-foreground">DYOR</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-sm">${priceData.current.toFixed(2)}m</div>
        <div className={cn(
          "text-xs font-medium",
          priceData.changePercent >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}