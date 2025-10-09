import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMarketNewsData } from '@/hooks/useMarketNewsData'
import { useChainAnalyticsSync } from '@/hooks/useChainAnalyticsSync'
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
  Globe,
  Radio
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MarketNewsComponentProps {
  selectedAgents?: string[]
  className?: string
  maxArticles?: number
}

export const MarketNewsComponent: React.FC<MarketNewsComponentProps> = ({ 
  selectedAgents = [],
  className = "",
  maxArticles = 20
}) => {
  const {
    loading,
    newsArticles,
    marketSentiment,
    selectedCategory,
    setSelectedCategory,
    selectedTimeframe,
    setSelectedTimeframe,
    refreshAll
  } = useMarketNewsData();

  const { syncMarketSentiment, isSyncing } = useChainAnalyticsSync(false);
  
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  
  // Filter articles by source API
  const filteredArticles = useMemo(() => {
    if (sourceFilter === 'all') return newsArticles;
    return newsArticles.filter(article => 
      (article as any).source_api === sourceFilter
    );
  }, [newsArticles, sourceFilter]);

  const handleRefresh = async () => {
    await Promise.all([
      refreshAll(),
      syncMarketSentiment()
    ]);
  };

  const getSentimentText = (score: number) => {
    if (score > 0.6) return 'Extremely Bullish';
    if (score > 0.15) return 'Bullish';
    if (score < -0.6) return 'Extremely Bearish';
    if (score < -0.15) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'text-green-600';
    if (score > 0.15) return 'text-green-500';
    if (score < -0.6) return 'text-red-600';
    if (score < -0.15) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getImpactColor = (impact?: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getSourceBadgeColor = (sourceApi?: string) => {
    switch (sourceApi) {
      case 'CryptoPanic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CoinGecko': return 'bg-green-100 text-green-700 border-green-200';
      case 'NewsAPI': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                Market News & Sentiment
              </CardTitle>
              <CardDescription className="mt-2">
                Real-time market insights and AI-powered sentiment analysis
              </CardDescription>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || isSyncing) ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Market Sentiment Overview */}
      {marketSentiment && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Sentiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(marketSentiment.overallSentiment)}`}>
                  {getSentimentText(marketSentiment.overallSentiment)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fear & Greed Index</p>
                <p className="text-2xl font-bold">{marketSentiment.fearGreedIndex}</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${marketSentiment.fearGreedIndex}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bullish</p>
                <p className="text-2xl font-bold text-green-500">
                  {marketSentiment.bullishPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Positive sentiment
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bearish</p>
                <p className="text-2xl font-bold text-red-500">
                  {marketSentiment.bearishPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Negative sentiment
                </p>
              </div>
            </div>

            {marketSentiment.volumeSentiment && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Volume: {marketSentiment.volumeSentiment}
                  </Badge>
                  <Badge variant="outline">
                    Social: {marketSentiment.socialSentiment}
                  </Badge>
                  <Badge variant="outline">
                    Timeframe: {marketSentiment.timeframe}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Latest Market News
              <Badge variant="outline" className="text-xs">
                {filteredArticles.length} articles
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="CryptoPanic">CryptoPanic</SelectItem>
                  <SelectItem value="CoinGecko">CoinGecko</SelectItem>
                  <SelectItem value="NewsAPI">NewsAPI</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All News</SelectItem>
                  <SelectItem value="market-analysis">Market Analysis</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="regulation">Regulation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-border/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && newsArticles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No news articles available</p>
              </div>
            )}

            {!loading && filteredArticles.slice(0, maxArticles).map((article) => {
              const sourceApi = (article as any).source_api;
              
              return (
                <div 
                  key={article.id} 
                  className="mb-4 p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {sourceApi && (
                          <Badge className={`text-xs ${getSourceBadgeColor(sourceApi)}`}>
                            <Radio className="h-3 w-3 mr-1" />
                            {sourceApi}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        {article.impactLevel && (
                          <Badge className={`text-xs ${getImpactColor(article.impactLevel)}`}>
                            {article.impactLevel} impact
                          </Badge>
                        )}
                        {article.sentimentScore !== undefined && (
                          <Badge variant="outline" className={`text-xs ${getSentimentColor(article.sentimentScore)}`}>
                            {getSentimentText(article.sentimentScore)}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold mb-2 text-foreground">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {article.summary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {article.source}
                          {sourceApi && sourceApi !== article.source && (
                            <span className="text-muted-foreground/70">via {sourceApi}</span>
                          )}
                        </span>
                        {article.relatedChains && article.relatedChains.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {article.relatedChains.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>

                      {article.url && (
                        <a 
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          Read full article →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}