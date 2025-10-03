import { useState, useEffect } from "react"
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Star, Save, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { SEOHead } from "@/components/seo/SEOHead"

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  market_cap: number
  volume_24h: number
  avatar_url: string
}

interface ComparisonData {
  metric: string
  agent1: number
  agent2: number
}

export default function AgentComparison() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [recentComparisons, setRecentComparisons] = useState<any[]>([])

  useEffect(() => {
    fetchAgents()
    if (user) {
      fetchRecentComparisons()
    }
  }, [user])

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, symbol, price, change_24h, market_cap, volume_24h, avatar_url, status')
        .eq('status', 'active')
        .order('market_cap', { ascending: false })
        .limit(50)

      if (error) throw error

      if (data) {
        setAgents(data.map(agent => ({
          id: agent.id,
          name: agent.name,
          symbol: agent.symbol,
          price: Number(agent.price),
          change_24h: Number(agent.change_24h),
          market_cap: Number(agent.market_cap),
          volume_24h: Number(agent.volume_24h),
          avatar_url: agent.avatar_url
        })))
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentComparisons = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('agent_comparisons')
        .select(`
          id,
          created_at,
          agent_1:agent_1_id(name, symbol),
          agent_2:agent_2_id(name, symbol)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      
      setRecentComparisons(data || [])
    } catch (error) {
      console.error('Error fetching recent comparisons:', error)
    }
  }

  const selectAgent = (agent: Agent) => {
    if (selectedAgents.length < 2 && !selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents([...selectedAgents, agent])
    }
  }

  const removeAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter(a => a.id !== agentId))
  }

  const saveComparison = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save comparisons",
        variant: "destructive",
      })
      return
    }

    if (selectedAgents.length !== 2) return

    try {
      const { error } = await supabase
        .from('agent_comparisons')
        .insert({
          user_id: user.id,
          agent_1_id: selectedAgents[0].id,
          agent_2_id: selectedAgents[1].id,
          comparison_data: {
            agent_1: {
              name: selectedAgents[0].name,
              symbol: selectedAgents[0].symbol,
              price: selectedAgents[0].price,
              change_24h: selectedAgents[0].change_24h
            },
            agent_2: {
              name: selectedAgents[1].name,
              symbol: selectedAgents[1].symbol,
              price: selectedAgents[1].price,
              change_24h: selectedAgents[1].change_24h
            },
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error
      }

      toast({
        title: "Comparison Saved",
        description: "This comparison has been saved to your history",
      })

      fetchRecentComparisons()
    } catch (error) {
      console.error('Error saving comparison:', error)
      toast({
        title: "Error",
        description: "Failed to save comparison",
        variant: "destructive",
      })
    }
  }

  const getComparisonData = (): ComparisonData[] => {
    if (selectedAgents.length !== 2) return []

    return [
      {
        metric: 'Price',
        agent1: selectedAgents[0].price,
        agent2: selectedAgents[1].price
      },
      {
        metric: 'Market Cap (M)',
        agent1: selectedAgents[0].market_cap / 1000000,
        agent2: selectedAgents[1].market_cap / 1000000
      },
      {
        metric: 'Volume 24h (K)',
        agent1: selectedAgents[0].volume_24h / 1000,
        agent2: selectedAgents[1].volume_24h / 1000
      },
      {
        metric: '24h Change (%)',
        agent1: selectedAgents[0].change_24h,
        agent2: selectedAgents[1].change_24h
      }
    ]
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(4)}`
  }

  return (
    <>
      <SEOHead
        title="Compare AI Agents - Side-by-Side Analysis | HyperCognition"
        description="Compare AI trading agents side by side. Analyze performance metrics, market cap, trading volume, and price changes to make informed decisions."
        keywords="AI agent comparison, compare trading agents, agent analysis, cryptocurrency comparison, trading metrics"
      />
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
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Agent Comparison
                </h1>
              </div>
              {selectedAgents.length === 2 && user && (
                <Button onClick={saveComparison} size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Recent Comparisons */}
          {user && recentComparisons.length > 0 && (
            <Card className="bg-card/30 border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Comparisons
                </CardTitle>
                <CardDescription>Your previously saved agent comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentComparisons.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comp.agent_1?.symbol}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-medium">{comp.agent_2?.symbol}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comp.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selection Area */}
          <Card className="bg-card/30 border-border/50 mb-6">
            <CardHeader>
              <CardTitle>Select Agents to Compare (Choose 2)</CardTitle>
              <CardDescription>
                {loading ? 'Loading agents...' : `${agents.length} active agents available for comparison`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selected Agents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[0, 1].map(index => (
                  <div key={index} className="p-4 border-2 border-dashed border-border/50 rounded-lg min-h-24 flex items-center justify-center">
                    {selectedAgents[index] ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          {selectedAgents[index].avatar_url ? (
                            <img 
                              src={selectedAgents[index].avatar_url} 
                              alt={selectedAgents[index].name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                              {selectedAgents[index].symbol.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{selectedAgents[index].name}</div>
                            <div className="text-sm text-muted-foreground">{selectedAgents[index].symbol}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgent(selectedAgents[index].id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="text-sm">Select Agent {index + 1}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Agent Selection Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                  {agents.map(agent => {
                    const isSelected = selectedAgents.find(a => a.id === agent.id)
                    const canSelect = selectedAgents.length < 2 && !isSelected

                    return (
                      <div
                        key={agent.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : canSelect 
                              ? 'border-border/50 hover:border-primary/50 hover:bg-card/50'
                              : 'border-border/30 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && selectAgent(agent)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {agent.avatar_url ? (
                            <img 
                              src={agent.avatar_url} 
                              alt={agent.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {agent.symbol.substring(0, 2)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.symbol}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(agent.market_cap)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {selectedAgents.length === 2 && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card/50 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedAgents.map((agent, index) => (
                  <Card key={agent.id} className="bg-card/30 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {agent.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div>{agent.name}</div>
                          <div className="text-sm text-muted-foreground font-normal">{agent.symbol}</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-bold">${agent.price.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">24h Change</div>
                          <div className={`font-bold flex items-center gap-1 ${agent.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {agent.change_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                          <div className="font-bold">{formatCurrency(agent.market_cap)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">24h Volume</div>
                          <div className="font-bold">{formatCurrency(agent.volume_24h)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics">
              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle>Side-by-Side Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getComparisonData().map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/20">
                        <div className="font-medium w-32">{data.metric}</div>
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex-1 text-right">
                            <Badge variant="outline" className="bg-primary/60 border border-white text-white">
                              {data.metric.includes('%') ? 
                                `${data.agent1 >= 0 ? '+' : ''}${data.agent1.toFixed(2)}%` :
                                data.metric.includes('M') || data.metric.includes('K') ?
                                  data.agent1.toFixed(2) :
                                  `$${data.agent1.toFixed(4)}`
                              }
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">vs</div>
                          <div className="flex-1 text-left">
                            <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                              {data.metric.includes('%') ? 
                                `${data.agent2 >= 0 ? '+' : ''}${data.agent2.toFixed(2)}%` :
                                data.metric.includes('M') || data.metric.includes('K') ?
                                  data.agent2.toFixed(2) :
                                  `$${data.agent2.toFixed(4)}`
                              }
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle>AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Market Performance Winner
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgents[0].change_24h > selectedAgents[1].change_24h ? 
                        `${selectedAgents[0].name} (${selectedAgents[0].symbol}) shows stronger 24h performance with ${selectedAgents[0].change_24h.toFixed(2)}% gains.` :
                        `${selectedAgents[1].name} (${selectedAgents[1].symbol}) shows stronger 24h performance with ${selectedAgents[1].change_24h.toFixed(2)}% gains.`
                      }
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <h4 className="font-semibold mb-2">Market Cap Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgents[0].market_cap > selectedAgents[1].market_cap ? 
                        `${selectedAgents[0].name} has a ${((selectedAgents[0].market_cap / selectedAgents[1].market_cap - 1) * 100).toFixed(1)}% larger market cap, indicating higher market valuation.` :
                        `${selectedAgents[1].name} has a ${((selectedAgents[1].market_cap / selectedAgents[0].market_cap - 1) * 100).toFixed(1)}% larger market cap, indicating higher market valuation.`
                      }
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h4 className="font-semibold mb-2">Trading Volume Insight</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgents[0].volume_24h > selectedAgents[1].volume_24h ? 
                        `${selectedAgents[0].name} shows higher trading activity with ${formatCurrency(selectedAgents[0].volume_24h)} in 24h volume.` :
                        `${selectedAgents[1].name} shows higher trading activity with ${formatCurrency(selectedAgents[1].volume_24h)} in 24h volume.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {selectedAgents.length === 0 && (
          <Card className="bg-card/30 border-border/50">
            <CardContent className="pt-12 pb-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Start Comparing</h3>
              <p className="text-muted-foreground">
                Select two AI agents from the list above to compare their performance and metrics
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  )
}