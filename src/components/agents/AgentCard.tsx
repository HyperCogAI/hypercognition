import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePriceSimulation } from "@/hooks/usePriceSimulation"
import { useFavorites } from "@/contexts/FavoritesContext"

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
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = () => {
    navigate(`/agent/${agent.id}`)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFavorite(agent.id)) {
      removeFromFavorites(agent.id)
    } else {
      addToFavorites(agent.id)
    }
  }

  return (
    <div 
      className="group relative flex items-center justify-between p-3 glass-card rounded-lg transition-all duration-300 cursor-pointer hover-lift hover:border-primary/50 animate-fade-in-scale" 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {agent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Enhanced Chain indicator with glow */}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full border-2 border-background flex items-center justify-center shadow-lg glow-primary">
            <div className="h-2 w-2 bg-white rounded-full pulse-glow" />
          </div>
        </div>
        <div className="transition-transform duration-300 group-hover:translate-x-1">
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-muted-foreground">DYOR</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110",
            isHovered && "opacity-100"
          )}
          onClick={handleFavoriteClick}
        >
          <Star 
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isFavorite(agent.id) 
                ? "fill-yellow-400 text-yellow-400 drop-shadow-lg glow-accent" 
                : "text-muted-foreground hover:text-yellow-400 hover:scale-110"
            )}
          />
        </Button>
        
        <div className="text-right transition-transform duration-300 group-hover:scale-105">
          <div className="font-semibold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ${priceData.current.toFixed(2)}m
          </div>
          <div className={cn(
            "text-xs font-medium transition-all duration-300",
            priceData.changePercent >= 0 
              ? "text-green-400 glow-success" 
              : "text-red-400 glow-danger"
          )}>
            {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}