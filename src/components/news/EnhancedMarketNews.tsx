import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Clock, Search, Filter, Globe, Newspaper, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  relatedAgents: string[]
  url: string
}

interface MarketAlert {
  id: string
  type: 'breaking' | 'price' | 'regulatory' | 'technical'
  message: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  affectedSymbols: string[]
}

const EnhancedMarketNews = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSentiment, setSelectedSentiment] = useState("all")

  // Mock data - in real app, this would come from API
  const [news] = useState<NewsArticle[]>([
    {
      id: "1",
      title: "AI Trading Volume Surges 300% in December",
      summary: "Institutional adoption of AI trading strategies reaches new heights as major funds report significant gains...",
      source: "CryptoDaily",
      publishedAt: "2024-01-15T10:30:00Z",
      category: "Market Analysis",
      sentiment: "positive",
      impact: "high",
      relatedAgents: ["ALPHA", "BETA", "GAMMA"],
      url: "#"
    },
    {
      id: "2",
      title: "Regulatory Framework for AI Trading Released",
      summary: "New guidelines provide clarity for autonomous trading systems and compliance requirements...",
      source: "FinancialTimes",
      publishedAt: "2024-01-15T09:15:00Z",
      category: "Regulatory",
      sentiment: "neutral",
      impact: "high",
      relatedAgents: ["THETA", "SIGMA"],
      url: "#"
    },
    {
      id: "3",
      title: "DeFi Integration Boosts Trading Efficiency",
      summary: "Latest integration with major DeFi protocols shows 40% improvement in execution speeds...",
      source: "DeFi Pulse",
      publishedAt: "2024-01-15T08:45:00Z",
      category: "Technology",
      sentiment: "positive",
      impact: "medium",
      relatedAgents: ["DELTA", "EPSILON"],
      url: "#"
    }
  ])

  const [alerts] = useState<MarketAlert[]>([
    {
      id: "1",
      type: "breaking",
      message: "Major exchange announces AI trading integration",
      severity: "high",
      timestamp: "2024-01-15T11:00:00Z",
      affectedSymbols: ["BTC", "ETH", "SOL"]
    },
    {
      id: "2",
      type: "price",
      message: "ALPHA agent breaks $100 resistance level",
      severity: "medium",
      timestamp: "2024-01-15T10:45:00Z",
      affectedSymbols: ["ALPHA"]
    }
  ])

  const [trendingTopics] = useState([
    { topic: "AI Trading", mentions: 1250, change: "+15%" },
    { topic: "DeFi Integration", mentions: 890, change: "+8%" },
    { topic: "Regulatory Updates", mentions: 650, change: "-3%" },
    { topic: "Market Volatility", mentions: 420, change: "+22%" }
  ])

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    const matchesSentiment = selectedSentiment === "all" || article.sentiment === selectedSentiment
    
    return matchesSearch && matchesCategory && matchesSentiment
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />
      case 'negative': return <TrendingDown className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      default: return 'secondary'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Market Alerts */}
      {alerts.length > 0 && (
        <Card variant="elevated" className="border-primary/20 bg-card shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Market Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  alert.severity === 'high' ? 'border-destructive/30 bg-destructive/5 shadow-[0_0_15px_hsl(var(--destructive)/0.1)]' :
                  alert.severity === 'medium' ? 'border-accent/30 bg-accent/5 shadow-[0_0_15px_hsl(var(--accent)/0.1)]' :
                  'border-primary/30 bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.1)]'
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(alert.timestamp)}
                      {alert.affectedSymbols.length > 0 && (
                        <span>• Affects: {alert.affectedSymbols.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}
                    className="ml-3"
                  >
                    {alert.type}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="news" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news">Latest News</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          {/* Filters */}
          <Card variant="elevated" className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-64">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-primary/20"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-background/50 border-border/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                    <SelectItem value="Regulatory">Regulatory</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                  <SelectTrigger className="w-48 bg-background/50 border-border/50">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* News Articles */}
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <Card key={article.id} variant="elevated" className="border-border/50 bg-card/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-lg leading-tight">{article.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getImpactVariant(article.impact)}>
                          {article.impact} impact
                        </Badge>
                        <div className={cn("flex items-center gap-1", getSentimentColor(article.sentiment))}>
                          {getSentimentIcon(article.sentiment)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">{article.summary}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Newspaper className="h-4 w-4" />
                        {article.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                      <Badge variant="outline">{article.category}</Badge>
                      {article.relatedAgents.length > 0 && (
                        <span>Related: {article.relatedAgents.join(', ')}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        {article.relatedAgents.slice(0, 3).map((agent) => (
                          <Badge key={agent} variant="secondary" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card variant="elevated" className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
              <CardDescription>Most discussed topics in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-muted/20 rounded-lg border border-border/30 hover:border-primary/20 transition-colors">
                  <div>
                    <div className="font-semibold">{topic.topic}</div>
                    <div className="text-sm text-muted-foreground">{topic.mentions} mentions</div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    topic.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  )}>
                    {topic.change.startsWith('+') ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {topic.change}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card variant="elevated" className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
              <CardDescription>AI-powered insights and market sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">Bullish</div>
                    <div className="text-sm text-muted-foreground">Overall Sentiment</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">72%</div>
                    <div className="text-sm text-muted-foreground">Confidence Level</div>
                  </div>
                  <div className="text-center p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="text-2xl font-bold text-accent">High</div>
                    <div className="text-sm text-muted-foreground">Market Activity</div>
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    Current market analysis shows strong bullish sentiment driven by increased institutional adoption 
                    of AI trading strategies. Key factors include regulatory clarity, technological improvements, 
                    and growing confidence in autonomous trading systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedMarketNews