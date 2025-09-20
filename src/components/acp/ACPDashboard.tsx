import { useState } from "react"
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
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const mockAgents: Agent[] = [
    {
      id: "1",
      name: "HyperTrader Alpha",
      status: "active",
      earnings: 125.50,
      engagements: 23,
      avatar: "🤖"
    },
    {
      id: "2", 
      name: "DeFi Oracle Beta",
      status: "active",
      earnings: 89.30,
      engagements: 18,
      avatar: "🔮"
    },
    {
      id: "3",
      name: "Risk Analyzer Gamma",
      status: "inactive",
      earnings: 45.20,
      engagements: 7,
      avatar: "⚡"
    }
  ]

  const mockEngagements: Engagement[] = [
    {
      id: "1",
      type: "payment",
      from: "HyperTrader Alpha",
      to: "DeFi Oracle Beta",
      amount: 2.50,
      timestamp: "2 minutes ago",
      description: "Market data analysis service",
      status: "completed"
    },
    {
      id: "2",
      type: "job",
      from: "Risk Analyzer Gamma",
      to: "HyperTrader Alpha",
      amount: 5.00,
      timestamp: "15 minutes ago", 
      description: "Portfolio risk assessment",
      status: "ongoing"
    },
    {
      id: "3",
      type: "interaction",
      from: "DeFi Oracle Beta",
      to: "HyperTrader Alpha",
      amount: 1.25,
      timestamp: "1 hour ago",
      description: "Price feed subscription",
      status: "completed"
    }
  ]

  const totalEarnings = mockAgents.reduce((sum, agent) => sum + agent.earnings, 0)
  const activeAgents = mockAgents.filter(agent => agent.status === "active").length
  const totalEngagements = mockAgents.reduce((sum, agent) => sum + agent.engagements, 0)

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Agent Commerce Protocol
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your autonomous agents and their interactions
          </p>
        </div>
        <CyberButton variant="cyber" className="group">
          <Bot className="h-4 w-4" />
          Deploy New Agent
        </CyberButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12.5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {mockAgents.length - activeAgents} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagements}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+8</span> new this hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.7%</div>
            <p className="text-xs text-muted-foreground">
              Engagement completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Top performing agents by earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{agent.avatar}</div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                            {agent.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agent.engagements} engagements
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${agent.earnings.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">USDC</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Engagements</CardTitle>
                <CardDescription>Latest agent-to-agent interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEngagements.slice(0, 5).map((engagement) => (
                  <div key={engagement.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {engagement.type === "payment" && <DollarSign className="h-4 w-4 text-primary" />}
                        {engagement.type === "job" && <Zap className="h-4 w-4 text-primary" />}
                        {engagement.type === "interaction" && <Users className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{engagement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {engagement.from} → {engagement.to}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${engagement.amount.toFixed(2)}</p>
                      <div className="flex items-center gap-1">
                        {engagement.status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {engagement.status === "ongoing" && <Clock className="h-3 w-3 text-yellow-500" />}
                        {engagement.status === "pending" && <AlertCircle className="h-3 w-3 text-blue-500" />}
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
            {mockAgents.map((agent) => (
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
                {mockEngagements.map((engagement) => (
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