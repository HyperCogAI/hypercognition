import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import { supabase } from "@/integrations/supabase/client"

interface PriceHistoryData {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
}

export default function Analytics() {
  const navigate = useNavigate()
  const [priceData, setPriceData] = useState<PriceHistoryData[]>([])
  const [topAgents, setTopAgents] = useState<Agent[]>([])
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    totalAgents: 0,
    avgChange: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch price history for chart
      const { data: priceHistory } = await supabase
        .from('price_history')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(100)

      // Fetch top agents
      const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(10)

      if (priceHistory) {
        const chartData = priceHistory.map(item => ({
          timestamp: new Date(item.timestamp).toLocaleDateString(),
          price: Number(item.price),
          volume: Number(item.volume),
          market_cap: Number(item.market_cap)
        }))
        setPriceData(chartData)
      }

      if (agents) {
        setTopAgents(agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          symbol: agent.symbol,
          price: Number(agent.price),
          change_24h: Number(agent.change_24h),
          volume_24h: Number(agent.volume_24h),
          market_cap: Number(agent.market_cap)
        })))

        // Calculate market stats
        const totalMarketCap = agents.reduce((sum, agent) => sum + Number(agent.market_cap), 0)
        const totalVolume = agents.reduce((sum, agent) => sum + Number(agent.volume_24h), 0)
        const avgChange = agents.reduce((sum, agent) => sum + Number(agent.change_24h), 0) / agents.length

        setMarketStats({
          totalMarketCap,
          totalVolume,
          totalAgents: agents.length,
          avgChange
        })
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
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
              <h1 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Market Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(marketStats.totalMarketCap)}</div>
              <div className={`text-sm flex items-center gap-1 ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}% avg
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(marketStats.totalVolume)}</div>
              <div className="text-sm text-muted-foreground">Trading volume</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.totalAgents}</div>
              <div className="text-sm text-muted-foreground">AI agents</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Market Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? 'Bullish' : 'Bearish'}
              </div>
              <div className="text-sm text-muted-foreground">Market sentiment</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 mb-6">
            <TabsTrigger value="price">Price Trends</TabsTrigger>
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
            <TabsTrigger value="leaderboard">Top Performers</TabsTrigger>
          </TabsList>

          <TabsContent value="price">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Price Movement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00D2FF" 
                        fill="url(#colorPrice)" 
                      />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00D2FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Trading Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="volume" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topAgents.map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 rounded-lg bg-card/20 hover:bg-card/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(agent.market_cap)}</div>
                        <div className={`text-sm flex items-center gap-1 ${agent.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {agent.change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(2)}%
                        </div>
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