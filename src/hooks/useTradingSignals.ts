import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TradingSignal {
  id: string;
  agent_id: string;
  user_id: string;
  signal_type: 'buy' | 'sell' | 'hold';
  price: number;
  target_price?: number;
  stop_loss_price?: number;
  confidence_level: number; // 1-10
  time_horizon: string;
  reasoning: string;
  created_at: string;
  expires_at?: string;
  is_premium: boolean;
  likes_count: number;
  views_count: number;
  comments_count: number;
  agent?: {
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
  };
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

export interface PriceAlert {
  id: string;
  agent_id: string;
  user_id: string;
  alert_type: 'price_above' | 'price_below' | 'volume_spike' | 'change_percent';
  target_value: number;
  current_value?: number;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string;
  agent_name: string;
  agent_symbol: string;
  created_at: string;
}

export interface SignalStats {
  totalSignals: number;
  successfulSignals: number;
  successRate: number;
  avgAccuracy: number;
  totalProfit: number;
  recentSignals: TradingSignal[];
}

export const useTradingSignals = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSignals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use mock data for demonstration since trading_signals table might not exist yet
      const mockSignals: TradingSignal[] = [
        {
          id: '1',
          agent_id: 'agent-1',
          user_id: 'user-1',
          signal_type: 'buy',
          price: 1250.50,
          target_price: 1350.00,
          stop_loss_price: 1200.00,
          confidence_level: 8,
          time_horizon: 'short',
          reasoning: 'Strong bullish momentum with high volume breakout above resistance. Technical indicators suggest continued upward movement.',
          created_at: new Date().toISOString(),
          is_premium: false,
          likes_count: 24,
          views_count: 156,
          comments_count: 8,
          agent: {
            name: 'Bitcoin Trading Agent',
            symbol: 'BTC-AGENT',
            price: 1250.50,
            change_24h: 5.2
          },
          user_profile: {
            display_name: 'CryptoAnalyst',
            avatar_url: '',
            is_verified: true
          }
        },
        {
          id: '2',
          agent_id: 'agent-2',
          user_id: 'user-2',
          signal_type: 'sell',
          price: 890.25,
          target_price: 820.00,
          stop_loss_price: 920.00,
          confidence_level: 7,
          time_horizon: 'medium',
          reasoning: 'Overbought conditions on RSI with bearish divergence. Expecting correction to support levels.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_premium: true,
          likes_count: 18,
          views_count: 89,
          comments_count: 5,
          agent: {
            name: 'Ethereum Trading Agent',
            symbol: 'ETH-AGENT',
            price: 890.25,
            change_24h: -2.1
          },
          user_profile: {
            display_name: 'TradingPro',
            avatar_url: '',
            is_verified: true
          }
        }
      ];

      setSignals(mockSignals);

      // Calculate stats
      const mockStats: SignalStats = {
        totalSignals: 125,
        successfulSignals: 91,
        successRate: 73.2,
        avgAccuracy: 78.5,
        totalProfit: 24850.67,
        recentSignals: mockSignals
      };

      setStats(mockStats);

    } catch (err) {
      console.error('Error fetching trading signals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trading signals');
      toast({
        title: "Error",
        description: "Failed to fetch trading signals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAlerts = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Use mock data for demonstration
      const mockAlerts: PriceAlert[] = [
        {
          id: '1',
          agent_id: 'agent-1',
          user_id: user.id,
          alert_type: 'price_above',
          target_value: 1300.00,
          current_value: 1250.50,
          is_active: true,
          is_triggered: false,
          agent_name: 'Bitcoin Trading Agent',
          agent_symbol: 'BTC-AGENT',
          created_at: new Date().toISOString()
        }
      ];

      setAlerts(mockAlerts);

    } catch (err) {
      console.error('Error fetching price alerts:', err);
      toast({
        title: "Error",
        description: "Failed to fetch price alerts",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  const createPriceAlert = useCallback(async (alertData: {
    agent_id: string;
    alert_type: string;
    target_value: number;
    agent_name: string;
    agent_symbol: string;
  }) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create price alerts",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('price_alerts')
        .insert({
          ...alertData,
          user_id: user.id,
          is_active: true,
          is_triggered: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price alert created successfully",
      });

      // Refresh alerts
      fetchAlerts();
      return true;

    } catch (err) {
      console.error('Error creating price alert:', err);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, fetchAlerts]);

  const toggleAlert = useCallback(async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAlerts();

    } catch (err) {
      console.error('Error toggling alert:', err);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  }, [user?.id, toast, fetchAlerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });

      fetchAlerts();

    } catch (err) {
      console.error('Error deleting alert:', err);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  }, [user?.id, toast, fetchAlerts]);

  const createTradingSignal = useCallback(async (signalData: {
    agent_id: string;
    signal_type: 'buy' | 'sell' | 'hold';
    price: number;
    target_price?: number;
    stop_loss_price?: number;
    confidence_level: number;
    time_horizon: string;
    reasoning: string;
    is_premium?: boolean;
  }) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create trading signals",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Mock implementation for demonstration
      toast({
        title: "Success",
        description: "Trading signal would be published successfully",
      });

      // Add mock signal to local state
      const mockSignal: TradingSignal = {
        id: Date.now().toString(),
        ...signalData,
        user_id: user.id,
        is_premium: signalData.is_premium || false,
        likes_count: 0,
        views_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        agent: {
          name: 'Mock Agent',
          symbol: 'MOCK',
          price: signalData.price,
          change_24h: 0
        },
        user_profile: {
          display_name: 'You',
          is_verified: false
        }
      };

      setSignals(prev => [mockSignal, ...prev]);
      return true;

    } catch (err) {
      console.error('Error creating trading signal:', err);
      toast({
        title: "Error",
        description: "Failed to create trading signal",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, fetchSignals]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchSignals();
    fetchAlerts();

    // Subscribe to new signals
    const signalsChannel = supabase
      .channel('trading-signals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trading_signals'
        },
        () => {
          fetchSignals();
        }
      )
      .subscribe();

    // Subscribe to price alert triggers
    const alertsChannel = supabase
      .channel('price-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'price_alerts'
        },
        (payload) => {
          if (payload.new.is_triggered && !payload.old.is_triggered) {
            // Alert was just triggered
            toast({
              title: "Price Alert Triggered!",
              description: `${payload.new.agent_symbol} has reached your target price`,
            });
          }
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(signalsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [fetchSignals, fetchAlerts, toast]);

  return {
    signals,
    alerts,
    stats,
    isLoading,
    error,
    createPriceAlert,
    toggleAlert,
    deleteAlert,
    createTradingSignal,
    refreshData: () => {
      fetchSignals();
      fetchAlerts();
    }
  };
};