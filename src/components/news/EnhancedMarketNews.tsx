import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Clock, Search, Filter, Globe, Newspaper, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { RealMarketSentimentService } from '@/services/RealMarketSentimentService'

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
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await RealMarketSentimentService.getMarketNews(50);
        const formattedNews: NewsArticle[] = newsData.map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          source: item.source,
          publishedAt: item.publishedAt,
          category: "Market Analysis",
          sentiment: item.sentiment > 0.2 ? "positive" : item.sentiment < -0.2 ? "negative" : "neutral",
          impact: item.impact,
          relatedAgents: ["ALPHA", "BETA", "GAMMA"],
          url: item.url
        }));
        setNews(formattedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const [alerts, setAlerts] = useState<MarketAlert[]>([])

  const generateMarketAlerts = (): MarketAlert[] => {
    const alertTypes = ['breaking', 'price', 'regulatory', 'technical'] as const
    const severities = ['high', 'medium', 'low'] as const
    const symbols = ['SOL', 'ETH', 'USDT', 'USDC', 'BONK', 'mSOL', 'ALPHA', 'BETA', 'GAMMA']
    
    const alertTemplates = [
      {
        type: 'breaking',
        messages: [
          'Major whale movement detected: {amount} {symbol} transferred to unknown wallet',
          'Large institutional buy order executed for {symbol}',
          'Breaking: {symbol} reaches new daily high amid heavy trading volume',
          'Alert: Unusual trading pattern detected in {symbol} market'
        ]
      },
      {
        type: 'price',
        messages: [
          '{symbol} price surge: +{percent}% in last hour',
          'Significant price drop: {symbol} down {percent}% from daily high',
          '{symbol} breaks key resistance level at ${price}',
          'Flash crash detected: {symbol} recovers from temporary dip'
        ]
      },
      {
        type: 'regulatory',
        messages: [
          'New regulations announced affecting {symbol} trading',
          'Regulatory clarity improves for {symbol} ecosystem',
          'Compliance update: Enhanced KYC requirements for {symbol}',
          'Government statement impacts {symbol} market sentiment'
        ]
      },
      {
        type: 'technical',
        messages: [
          'Golden cross formation detected in {symbol} chart',
          'RSI oversold condition reached for {symbol}',
          'Volume spike: {symbol} trading volume up {percent}%',
          'Technical breakout: {symbol} exits consolidation pattern'
        ]
      }
    ]

    const numAlerts = Math.floor(Math.random() * 4) + 2 // 2-5 alerts
    const alerts: MarketAlert[] = []
    
    for (let i = 0; i < numAlerts; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const template = alertTemplates.find(t => t.type === alertType)!
      const messageTemplate = template.messages[Math.floor(Math.random() * template.messages.length)]
      
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const affectedSymbols = [symbol, ...symbols.filter(s => s !== symbol).slice(0, Math.floor(Math.random() * 2))]
      
      // Generate dynamic values
      const amount = (Math.random() * 50000 + 10000).toFixed(0)
      const percent = (Math.random() * 20 + 5).toFixed(1)
      const price = (Math.random() * 100 + 10).toFixed(2)
      
      const message = messageTemplate
        .replace('{amount}', amount)
        .replace('{symbol}', symbol)
        .replace('{percent}', percent)
        .replace('{price}', price)
      
      // Determine severity based on alert type and random factors
      let severity: 'high' | 'medium' | 'low' = 'medium'
      if (alertType === 'breaking' && Math.random() > 0.5) severity = 'high'
      else if (alertType === 'regulatory' && Math.random() > 0.7) severity = 'high'
      else if (Math.random() > 0.8) severity = 'low'
      
      // Generate recent timestamp (within last 2 hours)
      const timestamp = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString()
      
      alerts.push({
        id: `alert_${Date.now()}_${i}`,
        type: alertType,
        message,
        severity,
        timestamp,
        affectedSymbols
      })
    }
    
    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  useEffect(() => {
    // Initial alert generation
    setAlerts(generateMarketAlerts())
    
    // Update alerts every 2 minutes
    const alertInterval = setInterval(() => {
      setAlerts(generateMarketAlerts())
    }, 120000)
    
    return () => clearInterval(alertInterval)
  }, [])

  // Filter news based on search and filters
  const filteredNews = news.filter(article => {
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    const matchesSentiment = selectedSentiment === "all" || article.sentiment === selectedSentiment
    
    return matchesSearch && matchesCategory && matchesSentiment
  })

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <div className="h-4 w-4 rounded-full bg-muted-foreground/40" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold flex items-center gap-3">
            <Newspaper className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Market News & Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time market news with AI-powered sentiment analysis
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
          Live Updates
        </Badge>
      </div>

      {/* Market Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Market Alerts
          </h2>
          <div className="grid gap-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "border-l-4",
                alert.severity === 'high' && "border-l-destructive bg-destructive/5",
                alert.severity === 'medium' && "border-l-orange-500 dark:border-l-orange-400 bg-orange-500/10 dark:bg-orange-950/20",
                alert.severity === 'low' && "border-l-primary bg-primary/5"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.type.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'} 
                          className={cn(
                            "text-xs",
                            alert.severity === 'medium' && "bg-orange-500 hover:bg-orange-600 text-white"
                          )}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                        <span>Affects: {alert.affectedSymbols.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="breaking">Breaking</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Regulatory">Regulatory</SelectItem>
                <SelectItem value="Economics">Economics</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {article.summary}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(article.sentiment)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">{article.source}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      
                      <Badge className={cn("text-xs border", getSentimentColor(article.sentiment))}>
                        {article.sentiment}
                      </Badge>
                      
                      <Badge variant={article.impact === 'high' ? 'destructive' : article.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {article.impact} impact
                      </Badge>
                    </div>
                    
                    {article.relatedAgents.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">Related:</span>
                        <div className="flex gap-1">
                          {article.relatedAgents.map((agent) => (
                            <Badge key={agent} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {filteredNews.length === 0 && !loading && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No news articles found matching your criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="breaking" className="space-y-6">
          <div className="grid gap-6">
            {filteredNews.filter(article => article.impact === 'high').map((article) => (
              <Card key={article.id} className="border-l-4 border-l-destructive bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="text-xs">BREAKING</Badge>
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{article.source}</span>
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6">
            {filteredNews.filter(article => article.category === 'Market Analysis').map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{article.source}</span>
                    <Badge className={cn("text-xs", getSentimentColor(article.sentiment))}>
                      {article.sentiment}
                    </Badge>
                    <span className="text-muted-foreground">{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <div className="grid gap-6">
            {filteredNews.filter(article => article.category === 'Regulatory').map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{article.source}</span>
                    <Badge variant="outline" className="text-xs">Regulatory</Badge>
                    <span className="text-muted-foreground">{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedMarketNews