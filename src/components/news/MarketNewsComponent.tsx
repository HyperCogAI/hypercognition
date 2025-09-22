import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketNews } from '@/hooks/useMarketNews'
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  Filter,
  Clock,
  BarChart3,
  AlertTriangle,
  Zap,
  Brain,
  Globe
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MarketNewsComponentProps {
  selectedAgents?: string[]
  className?: string
}

export const MarketNewsComponent: React.FC<MarketNewsComponentProps> = ({ 
  selectedAgents = [],
  className = ""
}) => {
  const {
    loading,
    newsArticles,
    marketSentiment,
    trendingTopics,
    fetchMarketNews,
    fetchTrendingTopics,
    fetchMarketSentiment
  } = useMarketNews()

  useEffect(() => {
    // Load initial data
    fetchMarketNews('general', 'day', selectedAgents)
    fetchMarketSentiment()
    fetchTrendingTopics()
  }, [])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'negative':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
      case 'bullish':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'negative':
      case 'bearish':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const refreshData = async (category: 'general' | 'ai' | 'defi' | 'crypto' = 'general') => {
    await Promise.all([
      fetchMarketNews(category, 'day', selectedAgents),
      fetchMarketSentiment(),
      fetchTrendingTopics()
    ])
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Market News & Sentiment</h2>
            <p className="text-sm text-muted-foreground">
              Real-time market insights powered by AI analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Sentiment Overview */}
      {marketSentiment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                {getSentimentIcon(marketSentiment.overall_sentiment)}
                <div>
                  <p className="font-medium">Overall Sentiment</p>
                  <Badge className={getSentimentColor(marketSentiment.overall_sentiment)}>
                    {marketSentiment.overall_sentiment.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {Math.round(marketSentiment.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <p className="font-medium">Confidence</p>
                  <p className="text-sm text-muted-foreground">Analysis reliability</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Score: {marketSentiment.sentiment_score}</p>
                  <p className="text-sm text-muted-foreground">Range: -100 to +100</p>
                </div>
              </div>
            </div>
            
            {marketSentiment.key_factors && marketSentiment.key_factors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Key Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {marketSentiment.key_factors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Latest News
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {loading && newsArticles.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : newsArticles.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No news articles available. Try refreshing or check your connection.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                newsArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium line-clamp-2 flex-1">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-3">
                          {getSentimentIcon(article.sentiment)}
                          <Badge 
                            variant="outline"
                            className={`text-xs ${getSentimentColor(article.sentiment)}`}
                          >
                            {article.impact} impact
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(article.timestamp), { addSuffix: true })}
                          </span>
                          {article.source && (
                            <span>{article.source}</span>
                          )}
                        </div>
                        <span>Relevance: {Math.round(article.relevance_score * 100)}%</span>
                      </div>
                      
                      {article.related_agents && article.related_agents.length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Related:</span>
                          {article.related_agents.map((agent, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading && trendingTopics.length === 0 ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))
            ) : trendingTopics.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No trending topics available. Refresh to load latest data.
                  </p>
                </CardContent>
              </Card>
            ) : (
              trendingTopics.map((topic, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {topic.topic}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(topic.sentiment)}
                        {topic.urgency === 'high' && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {topic.mentions} mentions
                      </span>
                      <Badge 
                        variant="outline"
                        className={getSentimentColor(topic.sentiment)}
                      >
                        {topic.sentiment}
                      </Badge>
                    </div>
                    
                    {topic.related_agents.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Related Agents:</p>
                        <div className="flex flex-wrap gap-1">
                          {topic.related_agents.map((agent, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'ai', label: 'AI Agents', icon: Brain, color: 'text-purple-600' },
              { id: 'defi', label: 'DeFi', icon: BarChart3, color: 'text-blue-600' },
              { id: 'crypto', label: 'Crypto', icon: TrendingUp, color: 'text-green-600' },
              { id: 'trading', label: 'Trading', icon: Activity, color: 'text-orange-600' }
            ].map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => refreshData(category.id as any)}
                disabled={loading}
              >
                <category.icon className={`h-6 w-6 ${category.color}`} />
                <span className="text-sm">{category.label}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}