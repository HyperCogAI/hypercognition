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
  RefreshCw
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
                <SelectItem value="volume_spike">Volume Spike</SelectItem>
                <SelectItem value="change_percent">Change Percentage</SelectItem>
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

const CreateSignalDialog: React.FC<CreateSignalDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    agent_id: '',
    signal_type: 'buy',
    price: '',
    target_price: '',
    stop_loss_price: '',
    confidence_level: '7',
    time_horizon: 'short',
    reasoning: '',
    is_premium: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      target_price: formData.target_price ? parseFloat(formData.target_price) : undefined,
      stop_loss_price: formData.stop_loss_price ? parseFloat(formData.stop_loss_price) : undefined,
      confidence_level: parseInt(formData.confidence_level)
    });
    onClose();
    setFormData({
      agent_id: '',
      signal_type: 'buy',
      price: '',
      target_price: '',
      stop_loss_price: '',
      confidence_level: '7',
      time_horizon: 'short',
      reasoning: '',
      is_premium: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Trading Signal</DialogTitle>
          <DialogDescription>
            Share your trading insights with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signal_type">Signal Type</Label>
              <Select value={formData.signal_type} onValueChange={(value) => setFormData({ ...formData, signal_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Current Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                placeholder="Optional"
                value={formData.target_price}
                onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stop_loss_price">Stop Loss</Label>
              <Input
                id="stop_loss_price"
                type="number"
                step="0.01"
                placeholder="Optional"
                value={formData.stop_loss_price}
                onChange={(e) => setFormData({ ...formData, stop_loss_price: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confidence_level">Confidence Level ({formData.confidence_level}/10)</Label>
            <Input
              id="confidence_level"
              type="range"
              min="1"
              max="10"
              value={formData.confidence_level}
              onChange={(e) => setFormData({ ...formData, confidence_level: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reasoning">Analysis & Reasoning</Label>
            <Textarea
              id="reasoning"
              placeholder="Explain your analysis and reasoning for this signal..."
              value={formData.reasoning}
              onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Publish Signal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const TradingSignalsPanel: React.FC = () => {
  const { signals, alerts, stats, isLoading, createPriceAlert, toggleAlert, deleteAlert, createTradingSignal, refreshData } = useTradingSignals();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showCreateSignal, setShowCreateSignal] = useState(false);

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

  const getConfidenceBadge = (level: number) => {
    if (level >= 8) return <Badge className="bg-green-500">High</Badge>;
    if (level >= 6) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trading Signals & Alerts</h2>
          <p className="text-muted-foreground">Real-time market insights and notifications</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Trading Signals</h3>
            <Button onClick={() => setShowCreateSignal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Signal
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
                        {getConfidenceBadge(signal.confidence_level)}
                        {signal.is_premium && <Badge variant="outline">Premium</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-medium">{formatCurrency(signal.price)}</span>
                        </div>
                        {signal.target_price && (
                          <div>
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium">{formatCurrency(signal.target_price)}</span>
                          </div>
                        )}
                        {signal.stop_loss_price && (
                          <div>
                            <span className="text-muted-foreground">Stop Loss: </span>
                            <span className="font-medium">{formatCurrency(signal.stop_loss_price)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Horizon: </span>
                          <span className="font-medium capitalize">{signal.time_horizon}</span>
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
                          <MessageCircle className="h-3 w-3" />
                          {signal.comments_count}
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
                <CardContent className="p-8 text-center">
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
                <CardTitle>Create Trading Signal</CardTitle>
                <CardDescription>
                  Share your analysis and trading insights with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateSignal(true)} className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Create Trading Signal
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

      <CreateSignalDialog
        isOpen={showCreateSignal}
        onClose={() => setShowCreateSignal(false)}
        onSubmit={createTradingSignal}
      />
    </div>
  );
};