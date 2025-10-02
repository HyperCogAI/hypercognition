import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Zap, DollarSign, 
  Layers, ArrowUpDown, RefreshCw, Database
} from 'lucide-react';
import { RealTimeChainAnalytics, ChainMetrics, TokenMetrics } from '@/services/RealTimeChainAnalytics';
import { useChainAnalyticsSync } from '@/hooks/useChainAnalyticsSync';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const EnterpriseChainAnalytics: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<'all' | 'solana' | 'ethereum' | 'base' | 'polygon'>('all');
  const [solanaMetrics, setSolanaMetrics] = useState<ChainMetrics | null>(null);
  const [evmMetrics, setEvmMetrics] = useState<Record<string, ChainMetrics>>({});
  const [topTokens, setTopTokens] = useState<TokenMetrics[]>([]);
  const [crossChainData, setCrossChainData] = useState<any>(null);
  const [liquidityPools, setLiquidityPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { syncAll, isSyncing, lastSyncTime } = useChainAnalyticsSync(false); // Disable auto-sync, we'll control it manually

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [solana, ethereum, base, polygon, tokens, crossChain, pools] = await Promise.all([
        RealTimeChainAnalytics.getSolanaMetrics(),
        RealTimeChainAnalytics.getEVMMetrics('ethereum'),
        RealTimeChainAnalytics.getEVMMetrics('base'),
        RealTimeChainAnalytics.getEVMMetrics('polygon'),
        RealTimeChainAnalytics.getTopTokensByVolume(20),
        RealTimeChainAnalytics.getCrossChainAnalytics(),
        RealTimeChainAnalytics.getLiquidityPools()
      ]);

      setSolanaMetrics(solana);
      setEvmMetrics({ ethereum, base, polygon });
      setTopTokens(tokens);
      setCrossChainData(crossChain);
      setLiquidityPools(pools);
    } catch (error) {
      console.error('Error fetching chain analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch real-time chain analytics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Sync data from APIs, then fetch from database
    const syncAndFetch = async () => {
      await syncAll();
      await fetchData();
    };

    // Initial sync and fetch
    syncAndFetch();
    
    // Set up interval - sync APIs and fetch data every 60 seconds
    const interval = setInterval(syncAndFetch, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatCompact = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const allChains = [
    { key: 'solana', data: solanaMetrics, name: 'Solana', color: '#14F195' },
    { key: 'ethereum', data: evmMetrics.ethereum, name: 'Ethereum', color: '#627EEA' },
    { key: 'base', data: evmMetrics.base, name: 'Base', color: '#0052FF' },
    { key: 'polygon', data: evmMetrics.polygon, name: 'Polygon', color: '#8247E5' }
  ];

  const chainColors: Record<string, string> = {
    'Solana': '#14F195',
    'Ethereum': '#627EEA',
    'Base': '#0052FF',
    'Polygon': '#8247E5'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </CardHeader>
        </Card>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filteredTokens = selectedChain === 'all' 
    ? topTokens 
    : topTokens.filter(t => t.chain.toLowerCase() === selectedChain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Real-Time Chain Analytics</CardTitle>
            <CardDescription className="text-base flex items-center gap-2">
              Live metrics from Helius API (Solana) & CoinGecko API (Price Data)
              {lastSyncTime && (
                <span className="text-xs text-green-500">
                  Last updated: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            onClick={async () => { 
              await syncAll(); 
              await fetchData();
            }} 
            disabled={isSyncing || isLoading}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(isSyncing || isLoading) ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </CardHeader>
      </Card>

      {/* Chain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allChains.map(({ key, data, name, color }) => data && (
          <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedChain(key as any)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{name}</span>
                <div className="flex items-center gap-2">
                  {key === 'solana' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Helius API
                    </span>
                  )}
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatNumber(data.tvl)}</div>
                <div className="text-sm text-muted-foreground">TVL</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Volume 24h:</span>
                  <span className="font-medium">{formatNumber(data.volume24h)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>TPS:</span>
                  <span className="font-medium text-green-600">{data.tps}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Status Indicator */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live API Data Active</span>
            </div>
            <div className="text-xs text-green-600">
              Helius (Solana) • CoinGecko (Prices) • Alternative.me (Sentiment)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Chain Distribution */}
      {crossChainData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Cross-Chain Volume Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={crossChainData.chainDistribution}
                    dataKey="volume"
                    nameKey="chain"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ chain, percentage }) => `${chain}: ${percentage.toFixed(1)}%`}
                  >
                    {crossChainData.chainDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={chainColors[entry.chain] || `hsl(${index * 60}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {crossChainData.chainDistribution.map((chain: any) => (
                <div key={chain.chain} className="text-center">
                  <div className="text-sm text-muted-foreground">{chain.chain}</div>
                  <div className="font-bold">{formatNumber(chain.volume)}</div>
                  <div className="text-xs text-muted-foreground">{chain.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="comparison">Chain Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {['all', 'solana', 'ethereum', 'base', 'polygon'].map(chain => (
              <Badge
                key={chain}
                variant={selectedChain === chain ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedChain(chain as any)}
              >
                {chain}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {filteredTokens.map((token, index) => (
              <Card key={`${token.address}-${index}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${token.price.toFixed(4)}</div>
                      <div className={`text-sm flex items-center gap-1 ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {token.priceChange24h.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right ml-8">
                      <div className="text-sm text-muted-foreground">Vol 24h</div>
                      <div className="font-medium">{formatNumber(token.volume24h)}</div>
                    </div>
                    <Badge variant="outline" className="ml-4">{token.chain}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Liquidity Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liquidityPools.slice(0, 15).map((pool, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-semibold">{pool.pair}</div>
                      <div className="text-sm text-muted-foreground">{pool.chain}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(pool.liquidity)}</div>
                      <div className="text-sm text-muted-foreground">Liquidity</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(pool.volume24h)}</div>
                      <div className="text-sm text-muted-foreground">Volume 24h</div>
                    </div>
                    <Badge variant="secondary">{pool.apy.toFixed(1)}% APY</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chain Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allChains.filter(c => c.data).map(c => ({
                    name: c.name,
                    TVL: c.data!.tvl / 1e9,
                    Volume: c.data!.volume24h / 1e6,
                    TPS: c.data!.tps,
                    color: c.color
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="TVL" fill="#8b5cf6" name="TVL (B)" />
                    <Bar yAxisId="left" dataKey="Volume" fill="#3b82f6" name="Volume (M)" />
                    <Bar yAxisId="right" dataKey="TPS" fill="#10b981" name="TPS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allChains.filter(c => c.data).map(({ key, data, name }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{name} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Time:</span>
                    <span className="font-medium">{data!.blockTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TPS:</span>
                    <span className="font-medium">{data!.tps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tx 24h:</span>
                    <span className="font-medium">{formatCompact(data!.transactions24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Addresses:</span>
                    <span className="font-medium">{formatCompact(data!.activeAddresses24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Gas:</span>
                    <span className="font-medium">{data!.avgGasPrice.toFixed(6)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
