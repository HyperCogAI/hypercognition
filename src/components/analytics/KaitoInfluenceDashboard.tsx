import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useKaitoAttention } from '@/hooks/useKaitoAttention';
import { Sparkles, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const KaitoInfluenceDashboard = () => {
  const { topAgents, isLoadingTop, syncMultiple, isSyncing, formatYaps, getInfluenceTier } = useKaitoAttention();

  const handleRefresh = () => {
    // Sync top 20 agents
    const usernames = topAgents.slice(0, 20).map(agent => agent.twitter_username);
    syncMultiple({ usernames });
  };

  if (isLoadingTop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Social Influence (Kaito)
          </CardTitle>
          <CardDescription>Loading attention metrics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Social Influence Rankings
            </CardTitle>
            <CardDescription>
              Powered by Kaito AI • Real-time attention metrics
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {topAgents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No attention data available yet</p>
            <p className="text-sm mt-1">Sync agents to see their social influence</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topAgents.map((agent, index) => {
              const influenceTier = getInfluenceTier(agent.yaps_30d);
              const yaps30d = formatYaps(agent.yaps_30d);
              const yaps7d = formatYaps(agent.yaps_7d);
              const change = agent.yaps_7d > 0 
                ? ((agent.yaps_30d - agent.yaps_7d) / agent.yaps_7d * 100).toFixed(1)
                : 0;

              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">@{agent.twitter_username}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={influenceTier.color}>{influenceTier.tier}</span>
                        <span>•</span>
                        <span>{influenceTier.description}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">30d Yaps</div>
                      <div className="text-lg font-bold text-primary">{yaps30d}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">7d Yaps</div>
                      <div className="text-lg font-semibold">{yaps7d}</div>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      Number(change) > 0 ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {Number(change) > 0 && <TrendingUp className="h-4 w-4" />}
                      {Number(change) > 0 ? `+${change}%` : 'Stable'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <div className="font-semibold text-foreground mb-1">About Yaps (Kaito AI)</div>
              <p>
                Yaps measure tokenized attention - a metric tracking social influence and engagement
                across crypto Twitter. Higher Yaps indicate stronger community presence and thought leadership.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
