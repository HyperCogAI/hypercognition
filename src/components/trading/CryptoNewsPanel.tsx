import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketNewsData } from "@/hooks/useMarketNewsData";
import { format } from "date-fns";

const getSentimentIcon = (score?: number) => {
  if (!score) return null;
  if (score > 0.2) return <TrendingUp className="h-3 w-3" />;
  if (score < -0.2) return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

const getSentimentColor = (score?: number) => {
  if (!score) return '';
  if (score > 0.2) return 'text-green-500';
  if (score < -0.2) return 'text-red-500';
  return 'text-yellow-500';
};

const getImpactVariant = (level?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

export const CryptoNewsPanel = () => {
  const { loading, newsArticles, refreshAll } = useMarketNewsData();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                <CardTitle>Crypto News Feed</CardTitle>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <CardDescription>
              Latest cryptocurrency news and market updates
            </CardDescription>
          </CardHeader>
        </Card>

        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!loading && newsArticles.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                <CardTitle>Crypto News Feed</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAll}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Latest cryptocurrency news and market updates
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No news articles available</p>
            <Button onClick={refreshAll} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              <CardTitle>Crypto News Feed</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAll}
              className="h-8 w-8 p-0"
              title="Refresh news"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Latest cryptocurrency news and market updates
          </CardDescription>
        </CardHeader>
      </Card>

      {newsArticles.map((news) => (
        <Card key={news.id} className="hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{news.category}</Badge>
                  
                  {news.impactLevel && (
                    <Badge variant={getImpactVariant(news.impactLevel)}>
                      {news.impactLevel}
                    </Badge>
                  )}
                  
                  {news.sentimentScore !== undefined && (
                    <Badge variant="outline" className={getSentimentColor(news.sentimentScore)}>
                      {getSentimentIcon(news.sentimentScore)}
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {format(news.publishedAt, 'MMM d, h:mm a')}
                  </span>
                </div>
                <CardTitle className="text-lg hover:text-primary cursor-pointer">
                  {news.title}
                </CardTitle>
                
                {news.relatedTokens && news.relatedTokens.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {news.relatedTokens.slice(0, 3).map(token => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {news.url && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{news.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
