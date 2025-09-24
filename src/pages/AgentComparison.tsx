import { useState, useEffect } from "react"
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })

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
    } finally {
      setLoading(false)
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
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Agent Comparison
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Selection Area */}
        <Card className="bg-card/30 border-border/50 mb-6">
          <CardHeader>
            <CardTitle>Select Agents to Compare (Choose 2)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected Agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[0, 1].map(index => (
                <div key={index} className="p-4 border-2 border-dashed border-border/50 rounded-lg min-h-24 flex items-center justify-center">
                  {selectedAgents[index] ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {selectedAgents[index].symbol.substring(0, 2)}
                        </div>
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
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {agent.symbol.substring(0, 2)}
                      </div>
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
                            <Badge variant="outline" className="bg-primary/60 border border-white text-primary-foreground">
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
  )
}