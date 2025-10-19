import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AIStrategy {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  strategy_type: string;
  parameters: any;
  is_active: boolean;
  is_system: boolean;
  win_rate: number;
  avg_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_trades: number;
  model_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface BacktestResult {
  id: string;
  strategy_id: string;
  period: string;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface AIModel {
  id: string;
  name: string;
  model_type: string;
  description: string | null;
  accuracy: number;
  status: string;
  performance_metrics: any;
}

export const useAIStrategies = () => {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<AIStrategy[]>([]);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStrategies = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_trading_strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load strategies',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBacktests = async (strategyId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('ai_backtest_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (strategyId) {
        query = query.eq('strategy_id', strategyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBacktests(data || []);
    } catch (error) {
      console.error('Error fetching backtests:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('status', 'active')
        .order('accuracy', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const runBacktest = async (
    strategyId: string, 
    period: string, 
    agentIds: string[]
  ) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('process-ai-backtest', {
        body: {
          strategyId,
          period,
          agentIds
        }
      });

      if (error) throw error;

      toast({
        title: 'Backtest Complete',
        description: `Total Return: ${data.results.totalReturn}%, Win Rate: ${data.results.winRate}%`
      });

      await fetchBacktests(strategyId);
      return data;
    } catch (error: any) {
      console.error('Backtest error:', error);
      toast({
        title: 'Backtest Failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSignal = async (
    agentId: string,
    timeframe: string,
    modelId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-signals', {
        body: {
          agentId,
          timeframe,
          modelId
        }
      });

      if (error) throw error;

      toast({
        title: 'Signal Generated',
        description: `${data.signal.signal_type.toUpperCase()} signal with ${data.signal.confidence}% confidence`
      });

      return data.signal;
    } catch (error: any) {
      console.error('Signal generation error:', error);
      toast({
        title: 'Signal Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const getUserStats = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_user_ai_stats', { user_id_param: user.id });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchStrategies();
      fetchModels();
    }
  }, [user]);

  return {
    strategies,
    backtests,
    models,
    isLoading,
    fetchStrategies,
    fetchBacktests,
    runBacktest,
    generateSignal,
    getUserStats
  };
};
