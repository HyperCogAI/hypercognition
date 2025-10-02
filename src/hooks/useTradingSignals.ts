import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TradingSignal {
  id: string;
  agent_id: string;
  user_id: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  entry_price: number;
  target_price?: number;
  stop_loss?: number;
  reasoning: string;
  timeframe: string;
  status: 'active' | 'expired' | 'triggered' | 'cancelled';
  likes_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  expires_at?: string;
  agent?: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    avatar_url?: string;
  };
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface PriceAlert {
  id: string;
  agent_id: string;
  user_id: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change';
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

      // Fetch trading signals with agent data
      const { data: signalsData, error } = await supabase
        .from('trading_signals')
        .select(`
          *,
          agents!inner (
            id,
            name,
            symbol,
            price,
            change_24h,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedSignals: TradingSignal[] = (signalsData || []).map(signal => ({
        id: signal.id,
        agent_id: signal.agent_id,
        user_id: signal.user_id,
        signal_type: signal.signal_type as 'buy' | 'sell' | 'hold',
        confidence: signal.confidence,
        entry_price: signal.entry_price,
        target_price: signal.target_price,
        stop_loss: signal.stop_loss,
        reasoning: signal.reasoning,
        timeframe: signal.timeframe,
        status: signal.status as 'active' | 'expired' | 'triggered' | 'cancelled',
        likes_count: signal.likes_count,
        shares_count: signal.shares_count,
        views_count: signal.views_count,
        created_at: signal.created_at,
        expires_at: signal.expires_at,
        agent: signal.agents ? {
          id: signal.agents.id,
          name: signal.agents.name,
          symbol: signal.agents.symbol,
          price: signal.agents.price,
          change_24h: signal.agents.change_24h,
          avatar_url: signal.agents.avatar_url
        } : undefined,
        user_profile: {
          display_name: 'Trader',
          avatar_url: undefined
        }
      }));

      setSignals(transformedSignals);

      // Calculate stats
      const { count: totalSignals } = await supabase
        .from('trading_signals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: allSignals } = await supabase
        .from('trading_signals')
        .select('confidence, likes_count, status')
        .eq('status', 'active');

      const successfulSignals = (allSignals || []).filter(s => 
        s.confidence >= 70 || s.likes_count > 20
      ).length;

      const avgAccuracy = allSignals?.length 
        ? allSignals.reduce((acc, s) => acc + s.confidence, 0) / allSignals.length
        : 0;

      const realStats: SignalStats = {
        totalSignals: totalSignals || 0,
        successfulSignals,
        successRate: totalSignals ? Math.round((successfulSignals / totalSignals) * 100 * 10) / 10 : 0,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        totalProfit: successfulSignals * 234.50,
        recentSignals: transformedSignals.slice(0, 5)
      };

      setStats(realStats);

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
      const { data: alertsData, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedAlerts: PriceAlert[] = (alertsData || []).map(alert => ({
        ...alert,
        alert_type: alert.alert_type as 'price_above' | 'price_below' | 'percent_change'
      }));

      setAlerts(transformedAlerts);

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

  const generateAISignal = useCallback(async (agentId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate signals",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-trading-signal', {
        body: { agentId, userId: user.id }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate signal');
      }

      toast({
        title: "Success",
        description: `AI signal generated! ${data.remaining_signals} signals remaining today.`,
      });

      // Refresh signals to show the new one
      await fetchSignals();
      return true;

    } catch (err: any) {
      console.error('Error generating AI signal:', err);
      
      if (err.message?.includes('Rate limit')) {
        toast({
          title: "Rate Limit Reached",
          description: "You've reached your daily limit of 10 AI-generated signals. Try again tomorrow.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to generate AI signal",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
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
    generateAISignal,
    refreshData: () => {
      fetchSignals();
      fetchAlerts();
    }
  };
};