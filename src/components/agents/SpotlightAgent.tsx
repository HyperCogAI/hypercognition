import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CyberButton } from "@/components/ui/cyber-button"
import { ExternalLink, TrendingUp, Sparkles } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAgentLogo } from "@/hooks/useAgentLogo"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
  symbol: string
  avatar_url: string | null
  description: string | null
  price: number
  market_cap: number
  volume_24h: number
  change_24h: number
  chain: string
  logo_generated: boolean
}

interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

export const SpotlightAgent = () => {
  const [spotlightAgent, setSpotlightAgent] = useState<Agent | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { generateLogo, isGenerating } = useAgentLogo()

  useEffect(() => {
    fetchSpotlightAgent()
    fetchRecentUsers()
  }, [])

  const fetchSpotlightAgent = async () => {
    try {
      // Get the agent with highest market cap or most recent activity
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(1)

      if (error) throw error

      if (agents && agents.length > 0) {
        setSpotlightAgent(agents[0])
      }
    } catch (error) {
      console.error('Error fetching spotlight agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentUsers = async () => {
    try {
      // Get recent user profiles (simulating users who interacted with agents)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setRecentUsers(profiles || [])
    } catch (error) {
      console.error('Error fetching recent users:', error)
    }
  }

  const handleGenerateLogo = async () => {
    if (!spotlightAgent) return

    try {
      const logo = await generateLogo(
        spotlightAgent.name,
        spotlightAgent.symbol,
        "spotlight featured",
        spotlightAgent.id
      )

      if (logo) {
        // Update local state
        setSpotlightAgent(prev => prev ? {
          ...prev,
          avatar_url: logo.imageUrl,
          logo_generated: true
        } : null)
        
        toast.success(`Logo generated for ${spotlightAgent.name}!`)
      }
    } catch (error) {
      console.error('Error generating logo:', error)
      toast.error('Failed to generate logo')
    }
  }

  const handleGenerateProfilePic = async (user: UserProfile) => {
    try {
      const displayName = user.display_name || `User${user.user_id.slice(-4)}`
      const initials = displayName.slice(0, 2).toUpperCase()
      
      const logo = await generateLogo(
        displayName,
        initials,
        "modern profile avatar",
        user.user_id
      )

      if (logo) {
        // Update user profile in database
        const { error } = await supabase
          .from('user_profiles')
          .update({ avatar_url: logo.imageUrl })
          .eq('user_id', user.user_id)

        if (!error) {
          // Update local state
          setRecentUsers(prev => prev.map(u => 
            u.user_id === user.user_id 
              ? { ...u, avatar_url: logo.imageUrl }
              : u
          ))
          
          toast.success(`Profile picture generated for ${displayName}!`)
        }
      }
    } catch (error) {
      console.error('Error generating profile picture:', error)
      toast.error('Failed to generate profile picture')
    }
  }

  const handleGenerateAllProfilePics = async () => {
    const usersWithoutPics = recentUsers.filter(user => !user.avatar_url)
    
    if (usersWithoutPics.length === 0) {
      toast.info('All users already have profile pictures!')
      return
    }

    toast.info(`Generating ${usersWithoutPics.length} profile pictures...`)
    
    for (const user of usersWithoutPics) {
      await handleGenerateProfilePic(user)
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toFixed(2)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`
    }
    return `$${marketCap.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-primary/20 rounded" />
            <div className="h-4 w-48 bg-primary/10 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-primary/10 rounded-lg" />
          <div className="h-20 bg-primary/10 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!spotlightAgent) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No spotlight agent available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={spotlightAgent.avatar_url || "/placeholder.svg"} alt={spotlightAgent.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
              {spotlightAgent.symbol.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {!spotlightAgent.logo_generated && (
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-6 w-6 p-0"
              onClick={handleGenerateLogo}
              disabled={isGenerating}
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold">{spotlightAgent.name}</h3>
          <Badge variant="secondary" className="mt-1">
            {spotlightAgent.symbol} • {spotlightAgent.chain}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{formatPrice(spotlightAgent.price)}</div>
          <div className="text-sm text-muted-foreground">Price</div>
          <div className={`text-xs ${spotlightAgent.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {spotlightAgent.change_24h >= 0 ? '+' : ''}{spotlightAgent.change_24h.toFixed(2)}%
          </div>
        </div>
        <div className="bg-card/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{formatMarketCap(spotlightAgent.market_cap)}</div>
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-xs text-muted-foreground">
            Vol: {formatMarketCap(spotlightAgent.volume_24h)}
          </div>
        </div>
      </div>

      {/* Interacted with Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Recent Community</h4>
          {recentUsers.some(user => !user.avatar_url) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAllProfilePics}
              disabled={isGenerating}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate All
            </Button>
          )}
        </div>
        <div className="flex -space-x-2">
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div key={user.id} className="relative group">
                <Avatar className="h-8 w-8 border-2 border-background cursor-pointer transition-transform hover:scale-110">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name || 'User'} />
                  <AvatarFallback className="bg-primary/20 text-xs">
                    {user.display_name ? user.display_name.slice(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!user.avatar_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => handleGenerateProfilePic(user)}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-2 w-2" />
                  </Button>
                )}
                {/* Tooltip with user name */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {user.display_name || 'Anonymous User'}
                </div>
              </div>
            ))
          ) : (
            // Fallback to placeholder avatars if no users
            Array.from({ length: 6 }, (_, i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-background">
                <AvatarImage src="/placeholder.svg" alt={`User ${i + 1}`} />
                <AvatarFallback className="bg-primary/20 text-xs">U{i + 1}</AvatarFallback>
              </Avatar>
            ))
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Description:</strong> {spotlightAgent.description || `${spotlightAgent.name} is an advanced AI trading agent operating on ${spotlightAgent.chain} blockchain.`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <CyberButton variant="neon" className="w-full">
          <ExternalLink className="h-4 w-4 mr-2 text-white" />
          <span className="text-white">View Agent</span>
        </CyberButton>
        <CyberButton variant="analytics" className="w-full">
          <TrendingUp className="h-4 w-4 mr-2 text-white" />
          <span className="text-white">View Analytics</span>
        </CyberButton>
      </div>
    </div>
  )
}