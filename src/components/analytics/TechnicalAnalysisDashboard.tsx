import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TechnicalChart } from '@/components/charts/TechnicalChart';
import { Search, TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { coinGeckoSolanaApi } from '@/lib/apis/coingeckoSolanaApi';

export const TechnicalAnalysisDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tokens from CoinGecko Solana API
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['tokens-technical'],
    queryFn: async () => {
      const tokens = await coinGeckoSolanaApi.getSolanaTokens();
      if (!tokens) return [];
      
      return tokens.slice(0, 20).map(token => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol.toUpperCase(),
        price: token.current_price,
        change_24h: token.price_change_percentage_24h || 0,
        volume_24h: token.total_volume || 0,
      }));
    }
  });

  // Generate mock technical indicators based on price data
  const { data: technicalIndicators = [] } = useQuery({
    queryKey: ['technical-indicators', agents],
    queryFn: async () => {
      return agents.map(agent => ({
        id: `${agent.id}-rsi`,
        agent_id: agent.id,
        indicator_type: 'rsi',
        value: 50 + Math.max(-30, Math.min(30, agent.change_24h)),
        calculated_at: new Date().toISOString(),
        strength: agent.change_24h > 5 ? 'Strong' : agent.change_24h > 0 ? 'Moderate' : agent.change_24h < -5 ? 'Weak' : 'Neutral',
        signal: agent.change_24h > 0 ? 'BUY' : agent.change_24h < 0 ? 'SELL' : 'HOLD',
      }));
    },
    enabled: !!agents.length
  });

  const [selectedAgent, setSelectedAgent] = useState(agents[0] || null);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgentSelect = (agent: typeof agents[0]) => {
    if (!agent) return;
    setLoading(true);
    setSelectedAgent(agent);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Technical Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced charting tools and technical indicators for professional trading analysis
        </p>
      </div>

      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 mx-auto">
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Price Chart
          </TabsTrigger>
          <TabsTrigger value="screener" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Market Screener
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pattern Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Agent Selector */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="h-5 w-5" />
                    Select Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Agents</Label>
                    <Input
                      id="search"
                      placeholder="Search by name or symbol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedAgent.id === agent.id ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-lg">{agent.symbol}</div>
                            <div className="text-sm text-muted-foreground truncate">{agent.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(Number(agent.price))}</div>
                            <div className={`text-sm font-medium ${Number(agent.change_24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Number(agent.change_24h) >= 0 ? '+' : ''}{Number(agent.change_24h).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Vol: {formatVolume(Number(agent.volume_24h))}</span>
                          <Badge variant={Number(agent.change_24h) >= 0 ? 'default' : 'destructive'} className="text-xs">
                            {Number(agent.change_24h) >= 0 ? 'Bullish' : 'Bearish'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Area */}
            <div className="xl:col-span-3">
              {loading || agentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-96 rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                  </div>
                </div>
              ) : selectedAgent ? (
                <TechnicalChart
                  agentId={selectedAgent.id}
                  agentSymbol={selectedAgent.symbol}
                  currentPrice={Number(selectedAgent.price)}
                />
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-muted-foreground">No Agent Selected</h3>
                      <p className="text-sm text-muted-foreground">Select an agent from the sidebar to view technical analysis</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="screener" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6" />
                Market Screener
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-50">$0 - $50</SelectItem>
                        <SelectItem value="50-100">$50 - $100</SelectItem>
                        <SelectItem value="100-200">$100 - $200</SelectItem>
                        <SelectItem value="200+">$200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Volume</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Min volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100k">100K+</SelectItem>
                        <SelectItem value="1m">1M+</SelectItem>
                        <SelectItem value="10m">10M+</SelectItem>
                        <SelectItem value="100m">100M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Change %</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Price change" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="5+">+5% or more</SelectItem>
                        <SelectItem value="-5">-5% or less</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Technical Signal</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Signal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">Bullish</SelectItem>
                        <SelectItem value="bearish">Bearish</SelectItem>
                        <SelectItem value="oversold">Oversold</SelectItem>
                        <SelectItem value="overbought">Overbought</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full h-12 text-base">
                  <Search className="h-5 w-5 mr-2" />
                  Scan Market
                </Button>

                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Symbol</th>
                          <th className="text-right p-4 font-medium">Price</th>
                          <th className="text-right p-4 font-medium">Change %</th>
                          <th className="text-right p-4 font-medium">Volume</th>
                          <th className="text-right p-4 font-medium">RSI</th>
                          <th className="text-right p-4 font-medium">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAgents.map((agent, index) => (
                          <tr key={agent.id} className={`border-b transition-colors hover:bg-muted/30 ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                            <td className="p-4 font-semibold">{agent.symbol}</td>
                            <td className="text-right p-4 font-medium">{formatCurrency(Number(agent.price))}</td>
                            <td className={`text-right p-4 font-medium ${Number(agent.change_24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Number(agent.change_24h) >= 0 ? '+' : ''}{Number(agent.change_24h).toFixed(2)}%
                            </td>
                            <td className="text-right p-4">{formatVolume(Number(agent.volume_24h))}</td>
                            <td className="text-right p-4 font-mono">
                              {technicalIndicators
                                .filter(ti => ti.agent_id === agent.id && ti.indicator_type === 'rsi')
                                .slice(0, 1)
                                .map(ti => Number(ti.value).toFixed(0))[0] || 'N/A'}
                            </td>
                            <td className="text-right p-4">
                              <Badge variant={Number(agent.change_24h) >= 0 ? 'default' : 'destructive'} className="font-medium">
                                {Number(agent.change_24h) >= 0 ? 'Buy' : 'Sell'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6" />
                Pattern Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pattern Type</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="triangle">Triangle</SelectItem>
                        <SelectItem value="head-shoulders">Head & Shoulders</SelectItem>
                        <SelectItem value="double-top">Double Top</SelectItem>
                        <SelectItem value="double-bottom">Double Bottom</SelectItem>
                        <SelectItem value="flag">Flag</SelectItem>
                        <SelectItem value="wedge">Wedge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Timeframe</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confidence</Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Min confidence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%+</SelectItem>
                        <SelectItem value="70">70%+</SelectItem>
                        <SelectItem value="80">80%+</SelectItem>
                        <SelectItem value="90">90%+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full h-12 text-base">
                  <Zap className="h-5 w-5 mr-2" />
                  Scan for Patterns
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {technicalIndicators
                    .filter(ti => ['triangle', 'head_shoulders', 'double_top', 'flag'].includes(ti.indicator_type))
                    .slice(0, 4)
                    .map((indicator, index) => {
                      const agent = agents.find(a => a.id === indicator.agent_id);
                      return (
                        <Card key={indicator.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg capitalize">{indicator.indicator_type.replace('_', ' ')}</h4>
                            <Badge variant="secondary" className="font-medium">
                              {indicator.strength ? `${Number(indicator.strength).toFixed(0)}%` : '65%'} confidence
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            Found in: <span className="font-medium text-foreground">{agent?.symbol || 'Unknown'}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>Pattern suggests <span className={`font-medium ${indicator.signal === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                              {indicator.signal === 'buy' ? 'bullish' : 'bearish'}</span> {indicator.signal || 'continuation'}.
                            </p>
                            {agent && (
                              <p className="text-muted-foreground">
                                Target: <span className="font-medium text-foreground">
                                  {formatCurrency(Number(agent.price) * (indicator.signal === 'buy' ? 1.05 : 0.95))}
                                </span>
                              </p>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  {/* Fill with mock data if insufficient real data */}
                  {Array.from({ length: Math.max(0, 4 - technicalIndicators.filter(ti => ['triangle', 'head_shoulders', 'double_top', 'flag'].includes(ti.indicator_type)).length) }, (_, index) => (
                    <Card key={`mock-${index}`} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Pattern Detection</h4>
                        <Badge variant="outline">Scanning...</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        No patterns detected in current timeframe
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};