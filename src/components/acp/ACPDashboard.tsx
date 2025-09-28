import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CyberButton } from "@/components/ui/cyber-button"
import { Bot, DollarSign, Activity, Users, Zap, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Agent {
  id: string
  name: string
  status: "active" | "inactive"
  earnings: number
  engagements: number
  avatar: string
}

interface Engagement {
  id: string
  type: "payment" | "job" | "interaction"
  from: string
  to: string
  amount: number
  timestamp: string
  description: string
  status: "pending" | "ongoing" | "completed"
}

export function ACPDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch agents - simplified query to avoid relationship issues
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .limit(10)

      if (agentsError) {
        console.error('Error fetching agents:', agentsError)
        // Use mock data if database query fails
        const mockAgents: Agent[] = [
          {
            id: '1',
            name: 'VIRTUAL AI Agent',
            status: 'active',
            earnings: 1250.75,
            engagements: 24,
            avatar: '🤖'
          },
          {
            id: '2', 
            name: 'AI16Z Agent',
            status: 'active',
            earnings: 890.50,
            engagements: 18,
            avatar: '🔥'
          },
          {
            id: '3',
            name: 'GOAT Agent', 
            status: 'active',
            earnings: 675.25,
            engagements: 12,
            avatar: '🐐'
          }
        ]
        setAgents(mockAgents)
        setEngagements([
          {
            id: '1',
            type: 'payment',
            from: 'VIRTUAL AI Agent',
            to: 'User',
            amount: 125.50,
            timestamp: new Date().toLocaleString(),
            description: 'Trading signal payment',
            status: 'completed'
          },
          {
            id: '2', 
            type: 'job',
            from: 'AI16Z Agent',
            to: 'User',
            amount: 89.25,
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            description: 'Portfolio optimization task',
            status: 'ongoing'
          }
        ])
        return
      }

      // Process agents data - use actual data if available
      const processedAgents: Agent[] = agentsData?.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: "active",
        earnings: Math.random() * 1000, // Mock earnings for now
        engagements: Math.floor(Math.random() * 20), // Mock engagements
        avatar: agent.avatar_url || "🤖"
      })) || []

      // Create mock engagements based on agents
      const mockEngagements: Engagement[] = processedAgents.slice(0, 5).map((agent, index) => ({
        id: `engagement_${index + 1}`,
        type: ['payment', 'job', 'interaction'][index % 3] as "payment" | "job" | "interaction",
        from: agent.name,
        to: "User",
        amount: Math.random() * 200,
        timestamp: new Date(Date.now() - index * 3600000).toLocaleString(),
        description: `${agent.name} interaction`,
        status: ['pending', 'ongoing', 'completed'][index % 3] as "pending" | "ongoing" | "completed"
      }))

      setAgents(processedAgents)
      setEngagements(mockEngagements)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to empty arrays if everything fails
      setAgents([])
      setEngagements([])
    } finally {
      setLoading(false)
    }
  }

  const totalEarnings = agents.reduce((sum, agent) => sum + agent.earnings, 0)
  const activeAgents = agents.filter(agent => agent.status === "active").length
  const totalEngagements = agents.reduce((sum, agent) => sum + agent.engagements, 0)

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Agent Commerce Protocol
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Manage your autonomous agents and their interactions
        </p>
        <CyberButton variant="cyber" className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <Bot className="h-4 w-4" />
          Deploy New Agent
        </CyberButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400 font-medium">+12.5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {agents.length - activeAgents} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagements</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalEngagements}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400 font-medium">+8</span> new this hour
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">94.7%</div>
            <p className="text-xs text-muted-foreground">
              Engagement completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted to-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
          >
            My Agents
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
          >
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bot className="h-5 w-5 text-primary" />
                  Agent Performance
                </CardTitle>
                <CardDescription>Top performing agents by earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </Card>
              ))
            ) : agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">{agent.avatar}</div>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
                            {agent.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agent.engagements} engagements
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${agent.earnings.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">USDC</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Engagements
                </CardTitle>
                <CardDescription>Latest agent-to-agent interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagements.slice(0, 5).map((engagement) => (
                  <div key={engagement.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                        {engagement.type === "payment" && <DollarSign className="h-4 w-4 text-primary" />}
                        {engagement.type === "job" && <Zap className="h-4 w-4 text-primary" />}
                        {engagement.type === "interaction" && <Users className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{engagement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {engagement.from} → {engagement.to}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">${engagement.amount.toFixed(2)}</p>
                      <div className="flex items-center gap-1">
                        {engagement.status === "completed" && <CheckCircle className="h-3 w-3 text-green-400" />}
                        {engagement.status === "ongoing" && <Clock className="h-3 w-3 text-yellow-400" />}
                        {engagement.status === "pending" && <AlertCircle className="h-3 w-3 text-blue-400" />}
                        <span className="text-xs text-muted-foreground">{engagement.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => setSelectedAgent(agent)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{agent.avatar}</div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Earnings:</span>
                      <span className="font-bold">${agent.earnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Engagements:</span>
                      <span className="font-bold">{agent.engagements}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                    <Button variant={agent.status === "active" ? "destructive" : "default"} 
                            size="sm" className="w-full">
                      {agent.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>All agent interactions and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border-b animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                ))
              ) : engagements.map((engagement) => (
                  <div key={engagement.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mt-1">
                      {engagement.type === "payment" && <DollarSign className="h-5 w-5 text-primary" />}
                      {engagement.type === "job" && <Zap className="h-5 w-5 text-primary" />}
                      {engagement.type === "interaction" && <Users className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{engagement.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            From: <span className="font-medium">{engagement.from}</span> → 
                            To: <span className="font-medium">{engagement.to}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{engagement.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${engagement.amount.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {engagement.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {engagement.status === "ongoing" && <Clock className="h-4 w-4 text-yellow-500" />}
                            {engagement.status === "pending" && <AlertCircle className="h-4 w-4 text-blue-500" />}
                            <span className="text-sm capitalize">{engagement.status}</span>
                          </div>
                        </div>
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
  )
}