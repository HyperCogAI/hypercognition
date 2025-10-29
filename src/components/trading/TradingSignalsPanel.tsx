import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTradingSignals } from '@/hooks/useTradingSignals';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  BellOff, 
  Plus, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle,
  Target,
  AlertTriangle,
  Shield,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateAlertDialog: React.FC<CreateAlertDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    agent_id: '',
    agent_name: '',
    agent_symbol: '',
    alert_type: 'price_above',
    target_value: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_value: parseFloat(formData.target_value)
    });
    onClose();
    setFormData({
      agent_id: '',
      agent_name: '',
      agent_symbol: '',
      alert_type: 'price_above',
      target_value: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Set up automatic notifications when your conditions are met
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent_symbol">Agent Symbol</Label>
            <Input
              id="agent_symbol"
              placeholder="e.g., BTC-AGENT"
              value={formData.agent_symbol}
              onChange={(e) => setFormData({ ...formData, agent_symbol: e.target.value, agent_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert_type">Alert Type</Label>
            <Select value={formData.alert_type} onValueChange={(value) => setFormData({ ...formData, alert_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
                 <SelectContent>
                  <SelectItem value="price_above">Price Above</SelectItem>
                  <SelectItem value="price_below">Price Below</SelectItem>
                  <SelectItem value="percent_change">Percent Change</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_value">Target Value</Label>
            <Input
              id="target_value"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Alert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface CreateSignalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// Note: This component is no longer used - AI signal generation is used instead
const CreateSignalDialog: React.FC<CreateSignalDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  return null;
};

export const TradingSignalsPanel: React.FC = () => {
  const { signals, alerts, stats, isLoading, createPriceAlert, toggleAlert, deleteAlert, generateAISignal, refreshData } = useTradingSignals();
  const { toast } = useToast();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedAgentForSignal, setSelectedAgentForSignal] = useState<string>('');
  const [showAIDialog, setShowAIDialog] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500">High ({confidence}%)</Badge>;
    if (confidence >= 60) return <Badge variant="secondary">Medium ({confidence}%)</Badge>;
    return <Badge variant="outline">Low ({confidence}%)</Badge>;
  };

  const handleGenerateSignal = async (agentId: string) => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "Please enter an agent ID",
        variant: "destructive",
      });
      return;
    }
    await generateAISignal(agentId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Trading Signals & Alerts</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time market insights and notifications</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm" className="self-start sm:self-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Signals</p>
                  <p className="text-2xl font-bold">{stats.totalSignals}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-500">{stats.successRate}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">{stats.avgAccuracy}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalProfit)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12 text-xs sm:text-sm bg-[#16181f]">
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
           <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Trading Signals</h3>
            <Button onClick={() => setShowAIDialog(true)} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Signal
            </Button>
          </div>

          <div className="space-y-4">
            {signals.map((signal) => (
              <Card key={signal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getSignalIcon(signal.signal_type)}
                        <span className={cn("font-bold uppercase", getSignalColor(signal.signal_type))}>
                          {signal.signal_type}
                        </span>
                        <span className="font-medium">{signal.agent?.symbol || 'AGENT'}</span>
                        {getConfidenceBadge(signal.confidence)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-medium">{formatCurrency(signal.entry_price)}</span>
                        </div>
                        {signal.target_price && (
                          <div>
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium">{formatCurrency(signal.target_price)}</span>
                          </div>
                        )}
                        {signal.stop_loss && (
                          <div>
                            <span className="text-muted-foreground">Stop Loss: </span>
                            <span className="font-medium">{formatCurrency(signal.stop_loss)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Timeframe: </span>
                          <span className="font-medium capitalize">{signal.timeframe}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{signal.reasoning}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {signal.views_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {signal.likes_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(signal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Price Alerts</h3>
            <Button onClick={() => setShowCreateAlert(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{alert.agent_symbol}</span>
                        <Badge variant={alert.is_triggered ? "destructive" : "secondary"}>
                          {alert.is_triggered ? "Triggered" : "Active"}
                        </Badge>
                        {alert.alert_type === 'price_above' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {alert.alert_type === 'price_below' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Alert when {alert.alert_type.replace('_', ' ')} {formatCurrency(alert.target_value)}
                        {alert.current_value && ` (Current: ${formatCurrency(alert.current_value)})`}
                      </p>
                      {alert.triggered_at && (
                        <p className="text-xs text-muted-foreground">
                          Triggered: {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlert(alert.id, !alert.is_active)}
                      >
                        {alert.is_active ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {alerts.length === 0 && (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Price Alerts</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first price alert to get notified of important price movements
                  </p>
                  <Button onClick={() => setShowCreateAlert(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Price Alert</CardTitle>
                <CardDescription>
                  Get notified when specific price conditions are met
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateAlert(true)} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Create Price Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate AI Trading Signal</CardTitle>
                <CardDescription>
                  Let AI analyze market data and generate trading signals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAIDialog(true)} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Signal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateAlertDialog
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        onSubmit={createPriceAlert}
      />

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Trading Signal</DialogTitle>
            <DialogDescription>
              Enter an agent ID to generate an AI-powered trading signal (10 per day)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-id">Agent ID</Label>
              <Input
                id="agent-id"
                placeholder="Enter agent ID"
                value={selectedAgentForSignal}
                onChange={(e) => setSelectedAgentForSignal(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleGenerateSignal(selectedAgentForSignal)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Signal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};