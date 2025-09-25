import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHaptics } from '@/hooks/useHaptics'
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

interface MobileAgentDetailSheetProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onTrade: () => void
}

export const MobileAgentDetailSheet = ({ 
  agent, 
  isOpen, 
  onClose, 
  onTrade 
}: MobileAgentDetailSheetProps) => {
  const isMobile = useIsMobile()
  const { lightImpact, mediumImpact } = useHaptics()

  if (!agent || !isMobile) return null

  const handleTrade = () => {
    mediumImpact()
    onTrade()
  }

  const handleFavorite = () => {
    lightImpact()
    // Add to favorites logic
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-xl"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {agent.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-lg">{agent.name}</SheetTitle>
                <div className="text-sm text-muted-foreground">{agent.symbol}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className="h-10 w-10 p-0"
            >
              <Star className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Price Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="text-xl font-bold">{agent.fdv}</div>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">24h Change</div>
              <div className={cn(
                "text-xl font-bold",
                agent.isPositive ? "text-green-400" : "text-red-400"
              )}>
                {agent.change}
              </div>
            </div>
          </div>

          {/* Chain Info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {agent.chain}
            </Badge>
            <Badge variant="outline">
              AI Trading Agent
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Performance</div>
              <div className="text-sm font-medium">+245%</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Volatility</div>
              <div className="text-sm font-medium">Medium</div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Holders</div>
              <div className="text-sm font-medium">1.2K</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-sm font-medium">About</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Advanced AI trading agent specializing in high-frequency trading strategies 
              with risk management protocols. Powered by machine learning algorithms 
              for market analysis and automated execution.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => lightImpact()}
            >
              View Chart
            </Button>
            <Button 
              className="h-12 bg-primary/60 border border-white hover:bg-primary/70 text-white"
              onClick={handleTrade}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trade Now
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}