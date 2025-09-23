import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Brain, TrendingUp, BarChart3, Settings, Play, Pause, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIStrategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean_reversion' | 'arbitrage' | 'sentiment' | 'neural_network';
  status: 'active' | 'paused' | 'training' | 'backtesting';
  performance: {
    roi: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  allocatedCapital: number;
  modelVersion: string;
}

interface BacktestResult {
  strategy: string;
  period: string;
  roi: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  volatility: number;
}

interface AIModel {
  id: string;
  name: string;
  type: 'transformer' | 'lstm' | 'cnn' | 'reinforcement' | 'ensemble';
  description: string;
  accuracy: number;
  trainingData: string;
  lastUpdated: string;
  status: 'active' | 'training' | 'deprecated';
}

const AITradingStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<AIStrategy[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize AI strategies
    const mockStrategies: AIStrategy[] = [
      {
        id: '1',
        name: 'Neural Momentum Alpha',
        description: 'Deep learning model for momentum trading using transformer architecture',
        type: 'neural_network',
        status: 'active',
        performance: {
          roi: 24.7,
          sharpeRatio: 1.85,
          maxDrawdown: -8.2,
          winRate: 67.3,
          totalTrades: 1247
        },
        riskLevel: 'medium',
        allocatedCapital: 500000,
        modelVersion: 'v2.1.3'
      },
      {
        id: '2',
        name: 'Sentiment Arbitrage Bot',
        description: 'NLP-powered sentiment analysis for market inefficiency exploitation',
        type: 'sentiment',
        status: 'active',
        performance: {
          roi: 18.4,
          sharpeRatio: 2.12,
          maxDrawdown: -5.1,
          winRate: 71.8,
          totalTrades: 892
        },
        riskLevel: 'low',
        allocatedCapital: 250000,
        modelVersion: 'v1.8.2'
      },
      {
        id: '3',
        name: 'Quantum Mean Reversion',
        description: 'Quantum-inspired ML algorithm for mean reversion strategies',
        type: 'mean_reversion',
        status: 'training',
        performance: {
          roi: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          winRate: 0,
          totalTrades: 0
        },
        riskLevel: 'high',
        allocatedCapital: 100000,
        modelVersion: 'v0.9.1'
      }
    ];

    const mockBacktests: BacktestResult[] = [
      {
        strategy: 'Neural Momentum Alpha',
        period: '2023-2024',
        roi: 31.2,
        sharpeRatio: 1.94,
        maxDrawdown: -12.3,
        totalTrades: 1580,
        winRate: 65.8,
        volatility: 16.7
      },
      {
        strategy: 'Sentiment Arbitrage Bot',
        period: '2023-2024',
        roi: 22.8,
        sharpeRatio: 2.31,
        maxDrawdown: -7.9,
        totalTrades: 1120,
        winRate: 73.2,
        volatility: 12.4
      }
    ];

    const mockModels: AIModel[] = [
      {
        id: '1',
        name: 'GPT-5 Financial',
        type: 'transformer',
        description: 'Large language model fine-tuned on financial data',
        accuracy: 87.3,
        trainingData: '10TB financial news, reports, and market data',
        lastUpdated: '2024-01-10',
        status: 'active'
      },
      {
        id: '2',
        name: 'LSTM Price Predictor',
        type: 'lstm',
        description: 'Long Short-Term Memory network for price prediction',
        accuracy: 78.6,
        trainingData: '5 years of OHLCV data across 500+ assets',
        lastUpdated: '2024-01-08',
        status: 'active'
      },
      {
        id: '3',
        name: 'Reinforcement Trader',
        type: 'reinforcement',
        description: 'Deep Q-Network for autonomous trading decisions',
        accuracy: 82.1,
        trainingData: 'Simulated trading environment with 1M episodes',
        lastUpdated: '2024-01-12',
        status: 'training'
      }
    ];

    setStrategies(mockStrategies);
    setBacktestResults(mockBacktests);
    setAiModels(mockModels);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'paused':
        return <Badge variant="secondary"><Pause className="w-3 h-3 mr-1" />Paused</Badge>;
      case 'training':
        return <Badge className="bg-blue-500"><Brain className="w-3 h-3 mr-1" />Training</Badge>;
      case 'backtesting':
        return <Badge className="bg-yellow-500"><BarChart3 className="w-3 h-3 mr-1" />Backtesting</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-500">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const runBacktest = () => {
    toast({
      title: "Backtest Started",
      description: "Running historical simulation for the selected strategy.",
    });
  };

  const deployStrategy = () => {
    toast({
      title: "Strategy Deployed",
      description: "AI strategy is now live and trading with allocated capital.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Trading Strategies</h1>
          <p className="text-muted-foreground">Advanced AI models and automated trading strategies</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Bot className="w-4 h-4 mr-2" />
                Create Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create AI Trading Strategy</DialogTitle>
                <DialogDescription>Build a new AI-powered trading strategy</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Strategy Name</Label>
                    <Input placeholder="My AI Strategy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Strategy Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momentum">Momentum</SelectItem>
                        <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                        <SelectItem value="arbitrage">Arbitrage</SelectItem>
                        <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                        <SelectItem value="neural_network">Neural Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your strategy..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Capital</Label>
                    <Input type="number" placeholder="100000" />
                  </div>
                </div>
                <Button className="w-full">Create Strategy</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.filter(s => s.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {strategies.filter(s => s.status === 'training').length} in training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capital</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${strategies.reduce((sum, s) => sum + s.allocatedCapital, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Allocated across all strategies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg ROI</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(strategies.filter(s => s.status === 'active').reduce((sum, s) => sum + s.performance.roi, 0) / 
                strategies.filter(s => s.status === 'active').length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 12 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiModels.length}</div>
            <p className="text-xs text-muted-foreground">
              {aiModels.filter(m => m.status === 'active').length} active models
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    {getStatusBadge(strategy.status)}
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Type</span>
                    <Badge variant="outline">{strategy.type.replace('_', ' ')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level</span>
                    {getRiskBadge(strategy.riskLevel)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">ROI</span>
                      <span className="font-medium text-green-500">+{strategy.performance.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sharpe Ratio</span>
                      <span className="font-medium">{strategy.performance.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Win Rate</span>
                      <span className="font-medium">{strategy.performance.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capital</span>
                      <span className="font-medium">${strategy.allocatedCapital.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {strategy.status === 'active' ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiModels.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Type</span>
                    <Badge variant="outline">{model.type}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="font-medium">{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Training Data</span>
                    <p className="text-xs text-muted-foreground">{model.trainingData}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm font-medium">{model.lastUpdated}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Zap className="w-4 h-4 mr-1" />
                      Retrain
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backtesting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Backtesting</CardTitle>
              <CardDescription>Historical performance simulation and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Select Strategy</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <Select defaultValue="1y">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="6m">6 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="2y">2 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Initial Capital</Label>
                  <Input type="number" defaultValue={100000} />
                </div>
              </div>
              
              <Button onClick={runBacktest} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Backtest
              </Button>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Recent Backtest Results</h3>
                {backtestResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.strategy}</h4>
                      <Badge variant="outline">{result.period}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">ROI</span>
                        <p className="font-medium text-green-500">+{result.roi}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sharpe</span>
                        <p className="font-medium">{result.sharpeRatio}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max DD</span>
                        <p className="font-medium text-red-500">{result.maxDrawdown}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Win Rate</span>
                        <p className="font-medium">{result.winRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Top Performers</h3>
                  {strategies
                    .filter(s => s.status === 'active')
                    .sort((a, b) => b.performance.roi - a.performance.roi)
                    .map((strategy, index) => (
                    <div key={strategy.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-sm text-muted-foreground">{strategy.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+{strategy.performance.roi}%</p>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Risk Metrics</h3>
                  {strategies.filter(s => s.status === 'active').map((strategy) => (
                    <div key={strategy.id} className="p-3 border rounded space-y-2">
                      <p className="font-medium">{strategy.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Sharpe Ratio</span>
                          <span>{strategy.performance.sharpeRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown</span>
                          <span className="text-red-500">{strategy.performance.maxDrawdown}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate</span>
                          <span>{strategy.performance.winRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Trade Statistics</h3>
                  {strategies.filter(s => s.status === 'active').map((strategy) => (
                    <div key={strategy.id} className="p-3 border rounded space-y-2">
                      <p className="font-medium">{strategy.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Trades</span>
                          <span>{strategy.performance.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capital</span>
                          <span>${strategy.allocatedCapital.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model Version</span>
                          <span>{strategy.modelVersion}</span>
                        </div>
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

export default AITradingStrategies;