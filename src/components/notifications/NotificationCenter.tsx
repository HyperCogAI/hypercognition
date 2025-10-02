import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Settings,
  Volume2,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  agent_id: string;
  agent_symbol: string;
  agent_name: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike';
  target_value: number;
  current_value: number;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}

interface NotificationPreferences {
  price_alerts_enabled: boolean;
  portfolio_updates_enabled: boolean;
  market_news_enabled: boolean;
  social_updates_enabled: boolean;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  min_price_change_percent: number;
}

interface Agent {
  id: string;
  symbol: string;
  name: string;
  price: number;
}

const NotificationCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  
  // New alert form state
  const [newAlert, setNewAlert] = useState({
    agent_id: '',
    alert_type: 'price_above' as const,
    target_value: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's price alerts
  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts((data || []) as PriceAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch available agents
  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, symbol, name, price')
        .order('market_cap', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          price_alerts_enabled: true,
          portfolio_updates_enabled: true,
          market_news_enabled: true,
          social_updates_enabled: true,
          email_notifications_enabled: false,
          push_notifications_enabled: true,
          min_price_change_percent: 5.0
        };
        
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs)
          .select()
          .single();
        
        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Create price alert
  const createAlert = async () => {
    if (!user || !newAlert.agent_id || !newAlert.target_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedAgent = agents.find(a => a.id === newAlert.agent_id);
      if (!selectedAgent) throw new Error('Agent not found');

      const alertData = {
        user_id: user.id,
        agent_id: newAlert.agent_id,
        agent_symbol: selectedAgent.symbol,
        agent_name: selectedAgent.name,
        alert_type: newAlert.alert_type,
        target_value: parseFloat(newAlert.target_value),
        current_value: selectedAgent.price
      };

      const { error } = await supabase
        .from('price_alerts')
        .insert(alertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert created successfully",
      });

      setNewAlert({
        agent_id: '',
        alert_type: 'price_above',
        target_value: ''
      });
      setShowCreateAlert(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert deleted",
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete price alert",
        variant: "destructive",
      });
    }
  };

  // Toggle alert active status
  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPreferences({ ...preferences, ...updates });
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchAgents();
      fetchPreferences();
    }
  }, [user]);

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'price_below': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'percent_change': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'volume_spike': return <Volume2 className="h-4 w-4 text-purple-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatAlertType = (type: string) => {
    switch (type) {
      case 'price_above': return 'Price Above';
      case 'price_below': return 'Price Below';
      case 'percent_change': return 'Price Change %';
      case 'volume_spike': return 'Volume Spike';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button onClick={() => setShowCreateAlert(true)} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <div className="relative">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-2 h-auto rounded-xl">
            <TabsTrigger 
              value="alerts" 
              className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
            >
              Price Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
            >
              Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="alerts" className="space-y-6 animate-fade-in">
          {/* Create Alert Form */}
          {showCreateAlert && (
            <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Create Price Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">AI Agent</Label>
                    <Select 
                      value={newAlert.agent_id} 
                      onValueChange={(value) => setNewAlert(prev => ({ ...prev, agent_id: value }))}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.symbol} - {agent.name} (${agent.price.toFixed(4)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Alert Type</Label>
                    <Select 
                      value={newAlert.alert_type} 
                      onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, alert_type: value }))}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price_above">Price Above</SelectItem>
                        <SelectItem value="price_below">Price Below</SelectItem>
                        <SelectItem value="percent_change">Price Change %</SelectItem>
                        <SelectItem value="volume_spike">Volume Spike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Target Value</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Enter target value"
                      value={newAlert.target_value}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, target_value: e.target.value }))}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateAlert(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createAlert} 
                    disabled={isLoading}
                  >
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Bell className="h-5 w-5" />
                Your Price Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-6">
                      <Target className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">No Price Alerts</h3>
                    <p className="leading-relaxed">Create your first price alert to get notified when AI agents hit your target prices.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg transition-all border ${
                          alert.is_triggered 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : alert.is_active 
                            ? 'border-border/50 bg-background/50' 
                            : 'border-muted/50 bg-muted/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAlertTypeIcon(alert.alert_type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{alert.agent_symbol}</span>
                                <Badge variant="outline" className="text-xs">{formatAlertType(alert.alert_type)}</Badge>
                                {alert.is_triggered && (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Triggered
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {alert.agent_name} • Target: {alert.alert_type.includes('percent') ? `${alert.target_value}%` : `$${alert.target_value}`}
                              </p>
                              {alert.triggered_at && (
                                <p className="text-xs text-green-600 mt-1">
                                  Triggered: {new Date(alert.triggered_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={alert.is_active}
                              onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                              disabled={alert.is_triggered}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAlert(alert.id)}
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {preferences && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Notification Types</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when price targets are hit</p>
                      </div>
                      <Switch
                        checked={preferences.price_alerts_enabled}
                        onCheckedChange={(checked) => updatePreferences({ price_alerts_enabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Portfolio Updates</Label>
                        <p className="text-sm text-muted-foreground">Portfolio performance and changes</p>
                      </div>
                      <Switch
                        checked={preferences.portfolio_updates_enabled}
                        onCheckedChange={(checked) => updatePreferences({ portfolio_updates_enabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Market News</Label>
                        <p className="text-sm text-muted-foreground">Important market events and news</p>
                      </div>
                      <Switch
                        checked={preferences.market_news_enabled}
                        onCheckedChange={(checked) => updatePreferences({ market_news_enabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Social Updates</Label>
                        <p className="text-sm text-muted-foreground">Following and community updates</p>
                      </div>
                      <Switch
                        checked={preferences.social_updates_enabled}
                        onCheckedChange={(checked) => updatePreferences({ social_updates_enabled: checked })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Delivery Methods</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                      </div>
                      <Switch
                        checked={preferences.push_notifications_enabled}
                        onCheckedChange={(checked) => updatePreferences({ push_notifications_enabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications to your email</p>
                      </div>
                      <Switch
                        checked={preferences.email_notifications_enabled}
                        onCheckedChange={(checked) => updatePreferences({ email_notifications_enabled: checked })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Minimum Price Change %</Label>
                      <p className="text-sm text-muted-foreground">Only notify for changes above this threshold</p>
                      <Input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={preferences.min_price_change_percent}
                        onChange={(e) => updatePreferences({ min_price_change_percent: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;