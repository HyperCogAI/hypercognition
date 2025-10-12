import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useKaitoAttention } from '@/hooks/useKaitoAttention';
import { Sparkles, TrendingUp, Zap, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/ui/search-input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_USERNAMES = [
  'VitalikButerin','brian_armstrong','saylor','APompliano','balajis','naval','aantonop','ErikVoorhees','TuurDemeester',
  'cobie','ChainLinkGod','sassal0x','udiWertheimer','ercwl','hosseeb','iamDCinvestor','VanceSpencer','tarunchitra','haydenzadams',
  'StaniKulechov','IOHK_Charles','garrytan','katie_haun','cdixon','fredwilson','BarrySilbert','elonmusk','jack','Melt_Dem',
  'notgrubles','nlw','RyanSAdams','TrustlessState','SatoshiLite','roasbeef','PeterMcCormack','LynAldenContact','aeyakovenko','BanklessHQ',
  'TheCryptoLark','AltcoinDailyio','coinbureau','CryptoHayes','lightcrypto','kylesamani','0xQuit','punk6529','hasufl','bertcmiller'
];

// X (formerly Twitter) logo component
const XLogo = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="X">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const KaitoInfluenceDashboard = () => {
  const { topAgents, isLoadingTop, syncMultiple, isSyncing, formatYaps, getInfluenceTier, syncForUsernameAsync } = useKaitoAttention();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedAgents, setSearchedAgents] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const autoSyncedRef = useRef(false);
  const { toast } = useToast();

  // Auto-bootstrap: if list is sparse, sync a default set of influencers
  useEffect(() => {
    if (!isLoadingTop && !isSyncing && topAgents.length < 100 && !autoSyncedRef.current) {
      autoSyncedRef.current = true;
      console.log('Auto-syncing influencers, current count:', topAgents.length, 'syncing:', DEFAULT_USERNAMES.length);
      const toSync = DEFAULT_USERNAMES;
      syncMultiple({ usernames: toSync });
    }
  }, [isLoadingTop, isSyncing, topAgents.length]);

  // Combine top agents with searched agents and filter
  const allAgents = useMemo(() => {
    const combined = [...topAgents, ...searchedAgents];
    // Remove duplicates by twitter_username
    const seen = new Set<string>();
    return combined.filter(agent => {
      if (seen.has(agent.twitter_username)) return false;
      seen.add(agent.twitter_username);
      return true;
    });
  }, [topAgents, searchedAgents]);

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return allAgents;
    
    const query = searchQuery.toLowerCase();
    return allAgents.filter(agent => 
      agent.twitter_username.toLowerCase().includes(query)
    );
  }, [allAgents, searchQuery]);

  const handleRefresh = () => {
    // Sync top 100 agents or bootstrap defaults if list is small
    const usernames = (topAgents.length >= 10
      ? topAgents.slice(0, 100).map(agent => agent.twitter_username)
      : DEFAULT_USERNAMES.slice(0, 100)
    );
    syncMultiple({ usernames });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchQuery.trim();
    const username = raw.replace(/^@+/, '').slice(0, 50);

    if (!username || /[^A-Za-z0-9_]/.test(username)) {
      console.warn('Invalid X username');
      toast({ title: 'Invalid username', description: 'Use only letters, numbers, or underscore.', variant: 'destructive' });
      return;
    }

    // Check if already exists in current data
    const exists = allAgents.some(
      agent => agent.twitter_username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      // Already loaded; filtering will show it
      return;
    }

    setIsSearching(true);
    try {
      // Trigger backend sync and wait for completion
      await syncForUsernameAsync(username);

      // Try to fetch newly upserted record with retries and backoff
      let fetched: any = null;
      for (let i = 0; i < 12; i++) {
        const { data, error } = await supabase
          .from('kaito_attention_scores')
          .select('id, agent_id, twitter_user_id, twitter_username, yaps_24h, yaps_48h, yaps_7d, yaps_30d, yaps_3m, yaps_6m, yaps_12m, yaps_all, created_at, updated_at, metadata')
          .ilike('twitter_username', username)
          .maybeSingle();
        if (data && !error) { fetched = data; break; }
        await new Promise(r => setTimeout(r, Math.min(1500, 300 + i * 200)));
      }

      if (fetched) {
        const zeroish = [
          fetched.yaps_24h, fetched.yaps_48h, fetched.yaps_7d,
          fetched.yaps_30d, fetched.yaps_3m, fetched.yaps_6m,
          fetched.yaps_12m, fetched.yaps_all
        ].every((v: any) => !v || Number(v) === 0);

        if (zeroish) {
          toast({
            title: 'No Kaito data found',
            description: `Kaito did not return analytics for @${username}. This can happen for non-crypto accounts or during rate limits.`,
            variant: 'destructive',
          });
        } else {
          setSearchedAgents(prev => {
            const exists = prev.some(a => a.twitter_username.toLowerCase() === fetched.twitter_username.toLowerCase());
            return exists ? prev : [...prev, fetched];
          });
        }
      } else {
        toast({
          title: 'User not found',
          description: `Could not fetch Kaito stats for @${username}. Try again later.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error searching for username:', error);
      toast({ title: 'Fetch failed', description: error?.message || 'Kaito sync failed. Please try again later.', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Social Influence Rankings
            </CardTitle>
            <CardDescription>
              Powered by Kaito AI • Showing {allAgents.length} influencers
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="bg-blue-950/80 sm:bg-background border-blue-900/50 sm:border-border text-blue-100 sm:text-foreground hover:bg-blue-900/90 sm:hover:bg-accent disabled:bg-blue-950/60 sm:disabled:bg-background disabled:opacity-100 sm:disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
        
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <SearchInput
              placeholder="Search or fetch X username (e.g., VitalikButerin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 sm:bg-background border-gray-800 sm:border-border text-white sm:text-foreground placeholder:text-gray-500 sm:placeholder:text-muted-foreground hover:border-gray-700 sm:hover:border-gray-600 focus:border-gray-700 sm:focus:border-gray-600"
              disabled={isSearching || isSyncing}
            />
            <Button 
              type="submit" 
              size="sm"
              variant="ghost"
              disabled={isSearching || isSyncing || !searchQuery.trim()}
              className="w-full sm:w-auto border bg-blue-950/80 sm:bg-background border-blue-900/50 sm:border-border text-blue-100 sm:text-foreground hover:bg-blue-900/90 sm:hover:bg-accent"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Note:</strong> Kaito tracks crypto-specific social influence. Try crypto accounts like VitalikButerin, brian_armstrong, or saylor. Non-crypto accounts will return zero Yaps.
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {topAgents.length === 0 ? (
              <>
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No attention data available yet</p>
                <p className="text-sm mt-1">Sync agents to see their social influence</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No influencers match your search</p>
                <p className="text-sm mt-1">Try a different username</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map((agent) => {
              const influenceTier = getInfluenceTier(agent.yaps_30d);
              const yaps30d = formatYaps(agent.yaps_30d);
              const yaps7d = formatYaps(agent.yaps_7d);
              const change = agent.yaps_7d > 0 
                ? ((agent.yaps_30d - agent.yaps_7d) / agent.yaps_7d * 100).toFixed(1)
                : 0;
              
              // Find original rank in the full list
              const originalRank = allAgents.findIndex(a => a.id === agent.id) + 1;

              return (
                <div
                  key={agent.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border border-blue-900/30 sm:border-border bg-blue-950/40 sm:bg-card hover:bg-blue-900/50 sm:hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      #{originalRank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate max-w-[50vw] sm:max-w-none">@{agent.twitter_username}</span>
                        <a
                          href={`https://x.com/${agent.twitter_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                          aria-label={`Visit @${agent.twitter_username} on X`}
                        >
                          <XLogo className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className={influenceTier.color}>{influenceTier.tier}</span>
                        <span>•</span>
                        <span className="truncate">{influenceTier.description}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="flex justify-between sm:block">
                      <div className="text-xs sm:text-sm text-muted-foreground">30d Yaps</div>
                      <div className="text-base sm:text-lg font-bold text-primary">{yaps30d}</div>
                    </div>
                    
                    <div className="flex justify-between sm:block">
                      <div className="text-xs sm:text-sm text-muted-foreground">7d Yaps</div>
                      <div className="text-base sm:text-lg font-semibold">{yaps7d}</div>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
                      Number(change) > 0 ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {Number(change) > 0 && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />}
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
