import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import { useMobile } from '@/hooks/useMobile'
import { useHaptics } from '@/hooks/useHaptics'
import { useFavorites } from '@/contexts/FavoritesContext'
import { cn } from '@/lib/utils'

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

interface MobileAgentCardProps {
  agent: Agent
  onClick: () => void
}

export const MobileAgentCard = ({ agent, onClick }: MobileAgentCardProps) => {
  const { isMobile } = useMobile()
  const { lightImpact, selectionChanged } = useHaptics()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()

  if (!isMobile) return null

  const handleClick = () => {
    selectionChanged()
    onClick()
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    lightImpact()
    
    if (isFavorite(agent.id)) {
      removeFromFavorites(agent.id)
    } else {
      addToFavorites(agent.id)
    }
  }

  return (
    <Card 
      className="bg-card/30 border-border/50 backdrop-blur-sm cursor-pointer transition-all duration-200 active:scale-95"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {agent.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Chain indicator */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{agent.name}</div>
              <div className="text-xs text-muted-foreground">{agent.symbol}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleFavoriteClick}
            >
              <Star 
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite(agent.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
              />
            </Button>
            
            <div className="text-right">
              <div className="font-semibold text-sm">{agent.fdv}</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                agent.isPositive ? "text-green-400" : "text-red-400"
              )}>
                {agent.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {agent.change}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}