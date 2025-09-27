import { useState, useEffect } from "react"
import { ArrowLeft, Users, MessageCircle, TrendingUp, Star, Crown, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"
import { useWallet } from "@/hooks/useWallet"
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { generateDefaultAvatar } from "@/utils/avatarUtils"

interface Community {
  id: string
  name: string
  description: string
  members: number
  agent: {
    name: string
    symbol: string
    avatar: string
  }
  trending: boolean
}

interface TopTrader {
  id: string
  username: string
  avatar: string
  pnl: number
  winRate: number
  rank: number
}

export default function Communities() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [topTraders, setTopTraders] = useState<TopTrader[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load agents data to create communities
        const { data: agents, error: agentsError } = await supabase
          .from('agents')
          .select('*')
          .limit(10)

        if (agentsError) {
          console.error('Error loading agents:', agentsError)
          return
        }

        // Create communities from agents data
        const communitiesData: Community[] = agents?.map((agent, index) => ({
          id: agent.id,
          name: `${agent.name} Community`,
          description: `Trading community focused on ${agent.name} (${agent.symbol}) strategies and insights`,
          members: 100 + (crypto.getRandomValues(new Uint32Array(1))[0] % 1900), // 100-2000 members
          agent: {
            name: agent.name,
            symbol: agent.symbol,
            avatar: agent.avatar_url || generateDefaultAvatar(agent.name)
          },
          trending: index < 3 // First 3 are trending
        })) || []

        setCommunities(communitiesData)

        // Create mock trader data since real portfolio data structure is complex
        const tradersData: TopTrader[] = Array.from({ length: 10 }, (_, index) => ({
          id: `trader-${index + 1}`,
          username: `Trader${index + 1}`,
          avatar: generateDefaultAvatar(`Trader${index + 1}`, "initials"),
          pnl: 1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 49000),
          winRate: 60 + (crypto.getRandomValues(new Uint32Array(1))[0] % 40), // 60-100% win rate
          rank: index + 1
        }))

        setTopTraders(tradersData)

        // Load user's joined communities (if authenticated)
        if (user) {
          const { data: userCommunities } = await supabase
            .from('user_community_memberships')
            .select('community_id')
            .eq('user_id', user.id)

          if (userCommunities) {
            setJoinedCommunities(userCommunities.map(uc => uc.community_id))
          }
        }

      } catch (error) {
        console.error('Error loading communities data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const joinCommunity = async (communityId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_community_memberships')
        .insert({ user_id: user.id, community_id: communityId })

      if (!error) {
        setJoinedCommunities(prev => [...prev, communityId])
      }
    } catch (error) {
      console.error('Error joining community:', error)
    }
  }

  const leaveCommunity = async (communityId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_community_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId)

      if (!error) {
        setJoinedCommunities(prev => prev.filter(id => id !== communityId))
      }
    } catch (error) {
      console.error('Error leaving community:', error)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight flex items-center gap-2">
                Trading Communities
                <Users className="h-6 w-6" />
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communities.length}</div>
              <div className="text-sm text-muted-foreground">Agent-focused groups</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communities.reduce((sum, community) => sum + community.members, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Community members</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{joinedCommunities.length}</div>
              <div className="text-sm text-muted-foreground">Communities joined</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="communities" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 mb-6">
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="communities">
            <div className="space-y-6">
              {/* Trending Communities */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Communities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {communities
                      .filter(community => community.trending)
                      .map(community => (
                        <div key={community.id} className="p-4 rounded-lg bg-card/20 border border-border/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                {community.agent.symbol.substring(0, 2)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{community.name}</h3>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  {community.members.toLocaleString()} members
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-primary/60 border border-primary text-primary-foreground">
                              Trending
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{community.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Focus: {community.agent.name} ({community.agent.symbol})
                            </div>
                            <Button
                              size="sm"
                              variant={joinedCommunities.includes(community.id) ? "secondary" : "default"}
                              onClick={() => {
                                if (joinedCommunities.includes(community.id)) {
                                  leaveCommunity(community.id)
                                } else {
                                  joinCommunity(community.id)
                                }
                              }}
                              disabled={!user}
                            >
                              {joinedCommunities.includes(community.id) ? "Leave" : "Join"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Communities */}
              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle>All Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communities.map(community => (
                      <div key={community.id} className="flex items-center justify-between p-4 rounded-lg bg-card/20 hover:bg-card/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {community.agent.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {community.name}
                              {community.trending && (
                                <Badge variant="secondary" className="text-xs bg-primary/60 border border-primary text-primary-foreground">
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{community.description}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3" />
                              {community.members.toLocaleString()} members
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={joinedCommunities.includes(community.id) ? "secondary" : "outline"}
                          onClick={() => {
                            if (joinedCommunities.includes(community.id)) {
                              leaveCommunity(community.id)
                            } else {
                              joinCommunity(community.id)
                            }
                          }}
                          disabled={!user}
                        >
                          {joinedCommunities.includes(community.id) ? "Leave" : "Join"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Top Traders Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTraders.map((trader, index) => (
                    <div key={trader.id} className="flex items-center justify-between p-4 rounded-lg bg-card/20">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-orange-400/20 text-orange-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          #{trader.rank}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={trader.avatar} alt={trader.username} />
                          <AvatarFallback>
                            {trader.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {trader.username}
                            {index < 3 && (
                              <Award className={`h-4 w-4 ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-400' :
                                'text-orange-400'
                              }`} />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Win Rate: {trader.winRate}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.pnl >= 0 ? '+' : ''}{formatCurrency(trader.pnl)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total P&L</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}