import { useState } from 'react'
import { Target, TrendingUp, Trophy, Calendar, Plus, Search, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePredictionMarkets } from '@/hooks/usePredictionMarkets'
import { MarketCard } from '@/components/prediction-markets/MarketCard'
import { CreateMarketModal } from '@/components/prediction-markets/CreateMarketModal'
import { MyPositions } from '@/components/prediction-markets/MyPositions'
import { formatCurrency } from '@/lib/utils'
import { MarketCategory } from '@/types/predictionMarket'
import { AnimatedParticles } from '@/components/ui/animated-particles'

export default function PredictionMarkets() {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPositions, setShowPositions] = useState(false)
  
  const { markets, totalStats } = usePredictionMarkets(
    selectedCategory === 'all' ? undefined : selectedCategory
  )

  const filteredMarkets = markets.filter(m =>
    m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Particles Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedParticles />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/50 to-background/70 z-5" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Prediction Markets</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Bet on the <span className="gradient-text">Future</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trade on AI agent performance, crypto prices, and real-world events. 
              Non-custodial, transparent, and powered by smart contracts.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">
                  -
                </div>
                <div className="text-sm text-muted-foreground">Active Markets</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">
                  -
                </div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">
                  -
                </div>
                <div className="text-sm text-muted-foreground">Active Traders</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-5 w-5" />
                Create Market
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2"
                onClick={() => setShowPositions(!showPositions)}
              >
                <Trophy className="h-5 w-5" />
                My Positions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* My Positions Section */}
      {showPositions && (
        <div className="container mx-auto px-4 py-8">
          <MyPositions />
        </div>
      )}

      {/* Markets Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border/70 hover:border-border focus-visible:border-border"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MarketCategory | 'all')}>
            <TabsList className="grid w-full max-w-2xl grid-cols-5 h-auto gap-1 p-1">
              <TabsTrigger value="all" className="h-10 gap-2">
                <Target className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="ai-agents" className="h-10 gap-2">
                <Bot className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">AI Agents</span>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="h-10 gap-2">
                <TrendingUp className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Crypto</span>
              </TabsTrigger>
              <TabsTrigger value="competitions" className="h-10 gap-2">
                <Trophy className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Competitions</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="h-10 gap-2">
                <Calendar className="h-5 w-5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Events</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-16">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No markets found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Create Market Modal */}
      <CreateMarketModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  )
}
