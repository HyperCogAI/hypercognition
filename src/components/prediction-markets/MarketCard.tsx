import { PredictionMarket } from '@/types/predictionMarket'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, TrendingUp, Users, DollarSign } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useState } from 'react'
import { TradingModal } from './TradingModal'
import { useNavigate } from 'react-router-dom'

interface MarketCardProps {
  market: PredictionMarket
}

export function MarketCard({ market }: MarketCardProps) {
  const [showTradingModal, setShowTradingModal] = useState(false)
  const navigate = useNavigate()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai-agents': return 'bg-primary/10 text-primary border-primary/20'
      case 'crypto': return 'bg-secondary/10 text-secondary border-secondary/20'
      case 'competitions': return 'bg-accent/10 text-accent border-accent/20'
      case 'events': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted/10 text-muted-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-primary/20 text-primary'
      case 'resolving': return 'bg-accent/20 text-accent'
      case 'resolved': return 'bg-muted/20 text-muted-foreground'
      case 'cancelled': return 'bg-destructive/20 text-destructive'
      default: return 'bg-muted/20 text-muted-foreground'
    }
  }

  return (
    <>
      <Card 
        className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
        onClick={() => navigate(`/prediction-markets/${market.id}`)}
      >
        {/* Image */}
        {market.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={market.imageUrl} 
              alt={market.question}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={getCategoryColor(market.category)}>
                {market.category.replace('-', ' ')}
              </Badge>
              <Badge className={getStatusColor(market.status)}>
                {market.status}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Question */}
          <div>
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {market.question}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {market.description}
            </p>
          </div>

          {/* Outcomes */}
          <div className="space-y-2">
            {market.outcomes.slice(0, 2).map((outcome) => (
              <div key={outcome.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{outcome.label}</span>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-primary">
                    {(outcome.price * 100).toFixed(0)}%
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${outcome.price * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">Volume</span>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(market.totalVolume)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Ends</span>
              </div>
              <div className="text-sm font-semibold">
                {formatRelativeTime(market.resolutionDate)}
              </div>
            </div>
          </div>

          {/* Trade Button */}
          <Button 
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation()
              setShowTradingModal(true)
            }}
          >
            <TrendingUp className="h-4 w-4" />
            Trade Now
          </Button>
        </div>
      </Card>

      <TradingModal 
        market={market}
        open={showTradingModal}
        onOpenChange={setShowTradingModal}
      />
    </>
  )
}
