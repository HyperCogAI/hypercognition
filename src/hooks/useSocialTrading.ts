import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TradingProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  total_pnl: number;
  pnl_percentage: number;
  win_rate: number;
  total_trades: number;
  total_followers: number;
  total_following: number;
  risk_score?: number;
  max_drawdown: number;
  sharpe_ratio?: number;
  is_verified: boolean;
  is_public: boolean;
}

interface TradingSignal {
  id: string;
  user_id: string;
  agent_id: string;
  signal_type: string;
  price: number;
  target_price?: number;
  stop_loss_price?: number;
  confidence_level?: number;
  reasoning?: string;
  time_horizon?: string;
  likes_count: number;
  views_count: number;
  comments_count: number;
  is_premium: boolean;
  created_at: string;
  expires_at?: string;
}

interface TradingCompetition {
  id: string;
  title: string;
  description?: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  prize_pool?: number;
  entry_fee?: number;
  current_participants: number;
  max_participants?: number;
  is_active: boolean;
  rules?: any;
  created_at: string;
}

export const useSocialTrading = () => {
  const [topTraders, setTopTraders] = useState<TradingProfile[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [competitions, setCompetitions] = useState<TradingCompetition[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(true);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);

  const fetchTopTraders = async () => {
    try {
      setLoadingTraders(true);
      // Mock data for now - will use real data once migration is run
      const mockTraders: TradingProfile[] = [
        {
          id: '1',
          user_id: 'user1',
          display_name: 'CryptoKing',
          total_pnl: 15000,
          pnl_percentage: 45.2,
          win_rate: 68.5,
          total_trades: 142,
          total_followers: 1250,
          total_following: 15,
          risk_score: 4,
          max_drawdown: 12.3,
          sharpe_ratio: 1.8,
          is_verified: true,
          is_public: true
        }
      ];
      setTopTraders(mockTraders);
    } catch (error) {
      console.error('Error in fetchTopTraders:', error);
    } finally {
      setLoadingTraders(false);
    }
  };

  const fetchTradingSignals = async () => {
    try {
      setLoadingSignals(true);
      const mockSignals: TradingSignal[] = [];
      setTradingSignals(mockSignals);
    } catch (error) {
      console.error('Error in fetchTradingSignals:', error);
    } finally {
      setLoadingSignals(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      setLoadingCompetitions(true);
      const mockCompetitions: TradingCompetition[] = [];
      setCompetitions(mockCompetitions);
    } catch (error) {
      console.error('Error in fetchCompetitions:', error);
    } finally {
      setLoadingCompetitions(false);
    }
  };

  useEffect(() => {
    fetchTopTraders();
    fetchTradingSignals();
    fetchCompetitions();
  }, []);

  return {
    topTraders,
    tradingSignals,
    competitions,
    loadingTraders,
    loadingSignals,
    loadingCompetitions,
    refreshTraders: fetchTopTraders,
    refreshSignals: fetchTradingSignals,
    refreshCompetitions: fetchCompetitions
  };
};