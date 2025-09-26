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
import { supabase } from '@/integrations/supabase/client';

export const TechnicalAnalysisDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch agents from database
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['agents-technical'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, symbol, price, change_24h, volume_24h')
        .order('volume_24h', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch technical indicators
  const { data: technicalIndicators = [] } = useQuery({
    queryKey: ['technical-indicators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technical_indicators')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Technical{" "}
            <span className="text-white">
              Analysis
            </span>
          </h1>
          <p className="text-muted-foreground">
            Advanced charting tools and technical indicators for professional trading analysis
          </p>
        </div>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Price Chart</TabsTrigger>
          <TabsTrigger value="screener">Market Screener</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Agent Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedAgent.id === agent.id ? 'border-primary bg-muted' : ''
                        }`}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{agent.symbol}</div>
                            <div className="text-sm text-muted-foreground">{agent.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(Number(agent.price))}</div>
                            <div className={`text-sm ${Number(agent.change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {Number(agent.change_24h) >= 0 ? '+' : ''}{Number(agent.change_24h).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                          <span>Vol: {formatVolume(Number(agent.volume_24h))}</span>
                          <Badge variant="outline" className="text-xs">
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
            <div className="lg:col-span-3">
              {loading || agentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-96" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                  </div>
                </div>
              ) : selectedAgent ? (
                <TechnicalChart
                  agentId={selectedAgent.id}
                  agentSymbol={selectedAgent.symbol}
                  currentPrice={Number(selectedAgent.price)}
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Select an agent to view technical analysis
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="screener" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Screener
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Volume</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Change %</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Technical Signal</Label>
                    <Select>
                      <SelectTrigger>
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

                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Scan Market
                </Button>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Symbol</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Change %</th>
                        <th className="text-right p-2">Volume</th>
                        <th className="text-right p-2">RSI</th>
                        <th className="text-right p-2">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.map((agent) => (
                        <tr key={agent.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{agent.symbol}</td>
                          <td className="text-right p-2">{formatCurrency(Number(agent.price))}</td>
                          <td className={`text-right p-2 ${Number(agent.change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {Number(agent.change_24h) >= 0 ? '+' : ''}{Number(agent.change_24h).toFixed(2)}%
                          </td>
                          <td className="text-right p-2">{formatVolume(Number(agent.volume_24h))}</td>
                          <td className="text-right p-2">
                            {technicalIndicators
                              .filter(ti => ti.agent_id === agent.id && ti.indicator_type === 'rsi')
                              .slice(0, 1)
                              .map(ti => Number(ti.value).toFixed(0))[0] || 'N/A'}
                          </td>
                          <td className="text-right p-2">
                            <Badge variant={Number(agent.change_24h) >= 0 ? 'default' : 'destructive'}>
                              {Number(agent.change_24h) >= 0 ? 'Buy' : 'Sell'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pattern Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pattern Type</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Timeframe</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Confidence</Label>
                    <Select>
                      <SelectTrigger>
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

                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Scan for Patterns
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technicalIndicators
                    .filter(ti => ['triangle', 'head_shoulders', 'double_top', 'flag'].includes(ti.indicator_type))
                    .slice(0, 4)
                    .map((indicator, index) => {
                      const agent = agents.find(a => a.id === indicator.agent_id);
                      return (
                        <div key={indicator.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{indicator.indicator_type.replace('_', ' ')}</h4>
                            <Badge variant="outline">
                              {indicator.strength ? `${Number(indicator.strength).toFixed(0)}%` : '65%'} confidence
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Found in: {agent?.symbol || 'Unknown'}
                          </div>
                          <div className="text-sm">
                            Pattern suggests {indicator.signal === 'buy' ? 'bullish' : 'bearish'} {indicator.signal || 'continuation'}.
                            {agent && (
                              <>Target: {formatCurrency(Number(agent.price) * (indicator.signal === 'buy' ? 1.05 : 0.95))}</>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {/* Fill with mock data if insufficient real data */}
                  {Array.from({ length: Math.max(0, 4 - technicalIndicators.filter(ti => ['triangle', 'head_shoulders', 'double_top', 'flag'].includes(ti.indicator_type)).length) }, (_, index) => (
                    <div key={`mock-${index}`} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Pattern Detection</h4>
                        <Badge variant="outline">Scanning...</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        No patterns detected in current timeframe
                      </div>
                    </div>
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