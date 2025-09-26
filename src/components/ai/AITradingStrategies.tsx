import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RealAITradingService, AITradingStrategy, BacktestResult, AIModel } from '@/services/RealAITradingService';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  Play, 
  Plus, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export const AITradingStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<AITradingStrategy[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setIsLoading(true);
      const [strategiesData, backtestsData, modelsData] = await Promise.all([
        RealAITradingService.getAIStrategies(),
        RealAITradingService.getBacktestResults(),
        RealAITradingService.getAIModels()
      ]);

      setStrategies(strategiesData);
      setBacktestResults(backtestsData);
      setAiModels(modelsData);
    } catch (error) {
      console.error('Error loading AI data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI trading data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runBacktest = async (strategyId: string) => {
    try {
      setIsBacktesting(true);
      const result = await RealAITradingService.runBacktest(strategyId, '6M');
      setBacktestResults(prev => [...prev, result]);
      
      toast({
        title: "Backtest Complete",
        description: `Backtest completed with ${result.totalReturn.toFixed(2)}% return`,
      });
    } catch (error) {
      console.error('Error running backtest:', error);
      toast({
        title: "Backtest Failed",
        description: "Failed to run backtest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBacktesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'training':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Training</Badge>;
      case 'inactive':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
            AI Trading{" "}
            <span className="text-white">
              Strategies
            </span>
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered trading strategies and backtesting
          </p>
        </div>
        <Button onClick={loadAIData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="backtests">Backtests</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    {getStatusBadge(strategy.isActive ? 'active' : 'inactive')}
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {strategy.winRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {strategy.avgReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Return</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => runBacktest(strategy.id)}
                    disabled={isBacktesting}
                    size="sm"
                    className="w-full"
                  >
                    {isBacktesting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Backtest
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backtests" className="space-y-4">
          <div className="grid gap-4">
            {backtestResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">Strategy {result.strategyId}</CardTitle>
                  <CardDescription>
                    Period: {result.period} | Run Date: {result.runDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.totalReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {result.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {result.maxDrawdown.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {result.winRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {aiModels.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Accuracy</span>
                      <span className="font-semibold">{model.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline">{model.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm">{model.lastUpdated}</span>
                    </div>
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