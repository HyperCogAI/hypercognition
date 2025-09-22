import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Volume2,
  Zap,
  Wifi,
  WifiOff,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  Bell,
  BarChart3,
  Radio
} from 'lucide-react';
import { useRealTimeMarketData } from '@/hooks/useRealTimeMarketData';
import { RealTimeOrderBook } from '@/components/trading/RealTimeOrderBook';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  change_percent_24h: number;
  volume_24h: number;
}

interface RealTimeMarketDashboardProps {
  agents: Agent[];
  selectedAgentId?: string;
  onAgentSelect?: (agentId: string) => void;
}

export const RealTimeMarketDashboard: React.FC<RealTimeMarketDashboardProps> = ({
  agents,
  selectedAgentId,
  onAgentSelect
}) => {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const agentIds = Array.from(watchlist);
  const {
    tickers,
    orderBooks,
    recentTrades,
    isConnected,
    getTickerForAgent,
    getOrderBookForAgent,
    getTradesForAgent
  } = useRealTimeMarketData({
    agentIds,
    enableOrderBook: true,
    enableTrades: true
  });

  const { toast } = useToast();

  useEffect(() => {
    // Add initial agents to watchlist
    if (agents.length > 0 && watchlist.size === 0) {
      setWatchlist(new Set(agents.slice(0, 5).map(a => a.id)));
    }
  }, [agents, watchlist.size]);

  const toggleWatchlist = (agentId: string) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
        if (notifications) {
          toast({
            title: "Added to Watchlist",
            description: `${agents.find(a => a.id === agentId)?.symbol} is now being monitored`,
          });
        }
      }
      return newSet;
    });
  };

  const renderMarketTicker = (agent: Agent) => {
    const ticker = getTickerForAgent(agent.id);
    const trades = getTradesForAgent(agent.id);
    const orderBook = getOrderBookForAgent(agent.id);
    
    const currentPrice = ticker?.last_price || agent.price;
    const change24h = ticker?.change_percent_24h || agent.change_percent_24h;
    const volume24h = ticker?.volume_24h || agent.volume_24h;
    const isWatched = watchlist.has(agent.id);
    
    return (
      <Card 
        key={agent.id} 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedAgentId === agent.id && "ring-2 ring-primary",
          isWatched && "border-primary/50"
        )}
        onClick={() => onAgentSelect?.(agent.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-sm font-semibold">{agent.symbol}</CardTitle>
                <p className="text-xs text-muted-foreground">{agent.name}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(agent.id);
                }}
              >
                {isWatched ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {isWatched && (
              <div className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Price */}
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">
              ${currentPrice.toFixed(4)}
            </div>
            <div className={cn(
              "text-sm font-medium flex items-center justify-center gap-1",
              change24h >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change24h.toFixed(2)}%
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Volume 24h</span>
              <div className="font-semibold">{volume24h.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Trades</span>
              <div className="font-semibold">{trades.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Bid/Ask</span>
              <div className="font-semibold font-mono">
                {orderBook.bids[0]?.price.toFixed(4) || '--'}/
                {orderBook.asks[0]?.price.toFixed(4) || '--'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Spread</span>
              <div className="font-semibold">
                {orderBook.bids[0] && orderBook.asks[0] 
                  ? ((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price * 100).toFixed(3) + '%'
                  : '--'
                }
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          {trades.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Recent Trades</div>
              <div className="space-y-1 max-h-16 overflow-hidden">
                {trades.slice(0, 3).map((trade, index) => (
                  <div 
                    key={trade.id}
                    className={cn(
                      "flex items-center justify-between text-xs p-1 rounded",
                      trade.side === 'buy' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                      index === 0 && "animate-pulse"
                    )}
                  >
                    <span className="font-mono">${trade.price.toFixed(4)}</span>
                    <span>{trade.size.toFixed(2)}</span>
                    <span className="text-xs opacity-70">
                      {new Date(trade.timestamp).toLocaleTimeString().slice(-8, -3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Real-Time Market Data
          </h1>
          <p className="text-muted-foreground">
            Live market data, order books, and trading activity
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <span className="text-sm">Notifications</span>
          </div>
          
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto Refresh</span>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist ({watchlist.size})</TabsTrigger>
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          <TabsTrigger value="trades">Live Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.slice(0, 12).map(renderMarketTicker)}
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
          {watchlist.size === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No items in watchlist</h3>
                <p className="text-muted-foreground mb-4">
                  Add agents to your watchlist to monitor their real-time data
                </p>
                <Button onClick={() => setSelectedTab('overview')}>
                  Browse Market
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.filter(a => watchlist.has(a.id)).map(renderMarketTicker)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orderbook" className="space-y-6">
          {selectedAgent ? (
            <RealTimeOrderBook 
              symbol={selectedAgent.symbol}
              precision={4}
              maxDepth={20}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select an agent</h3>
                <p className="text-muted-foreground">
                  Choose an agent from the market overview to view its order book
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <div className="grid gap-6">
            {watchlist.size > 0 ? (
              Array.from(watchlist).map(agentId => {
                const agent = agents.find(a => a.id === agentId);
                if (!agent) return null;
                
                const trades = getTradesForAgent(agentId);
                
                return (
                  <Card key={agentId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Live Trades - {agent.symbol}
                        <Badge variant="outline">{trades.length} trades</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {trades.length > 0 ? (
                            trades.map((trade, index) => (
                              <div
                                key={trade.id}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded border-l-2 transition-colors",
                                  trade.side === 'buy' 
                                    ? "border-green-500 bg-green-50/50" 
                                    : "border-red-500 bg-red-50/50",
                                  index === 0 && "animate-pulse"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'}>
                                    {trade.side.toUpperCase()}
                                  </Badge>
                                  <span className="font-mono font-semibold">
                                    ${trade.price.toFixed(4)}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {trade.size.toFixed(4)} {agent.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(trade.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Zap className="w-8 h-8 mx-auto mb-2" />
                              <p>No trades yet</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Add agents to watchlist</h3>
                  <p className="text-muted-foreground">
                    Monitor live trading activity by adding agents to your watchlist
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};