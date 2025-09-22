import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Trader {
  id: string;
  user_id: string;
  username: string;
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
  is_following?: boolean;
  copy_trading_enabled?: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_return: number;
  monthly_return: number;
  followers_count: number;
  following_count: number;
  avg_hold_time: string;
  verified: boolean;
  created_at: string;
}

export interface SocialPost {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  type: 'trade_signal' | 'market_analysis' | 'achievement' | 'general';
  content: string;
  trade_data?: {
    symbol: string;
    action: 'buy' | 'sell';
    price: number;
    target?: number;
    stop_loss?: number;
    confidence: number;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  is_liked?: boolean;
  verified_trade?: boolean;
}

export interface CopyTradingSettings {
  id: string;
  trader_id: string;
  is_active: boolean;
  allocation_percentage: number;
  max_position_size: number;
  risk_management: {
    max_drawdown: number;
    stop_copy_threshold: number;
    max_daily_trades: number;
  };
  filters: {
    min_confidence: number;
    excluded_symbols: string[];
    max_position_duration: number;
  };
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
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [following, setFollowing] = useState<Trader[]>([]);
  const [copyTradingSettings, setCopyTradingSettings] = useState<CopyTradingSettings[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [competitions, setCompetitions] = useState<TradingCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTraders, setLoadingTraders] = useState(true);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockTraders: Trader[] = [
    {
      id: 'trader-1',
      user_id: 'user1',
      username: 'CryptoMaster99',
      display_name: 'CryptoMaster99',
      avatar_url: '/api/placeholder/40/40',
      bio: 'Professional trader with 8+ years experience in crypto markets',
      total_pnl: 15000,
      pnl_percentage: 45.2,
      win_rate: 78.5,
      total_trades: 1247,
      total_followers: 2847,
      total_following: 156,
      risk_score: 7.2,
      max_drawdown: 12.3,
      sharpe_ratio: 1.8,
      is_verified: true,
      is_public: true,
      is_following: false,
      copy_trading_enabled: true,
      tier: 'platinum',
      total_return: 156.7,
      monthly_return: 12.3,
      followers_count: 2847,
      following_count: 156,
      avg_hold_time: '2d 4h',
      verified: true,
      created_at: '2023-01-15'
    },
    {
      id: 'trader-2',
      user_id: 'user2',
      username: 'AITraderPro',
      display_name: 'AITraderPro',
      avatar_url: '/api/placeholder/40/40',
      bio: 'AI-powered trading strategies with proven results',
      total_pnl: 12000,
      pnl_percentage: 34.2,
      win_rate: 82.1,
      total_trades: 892,
      total_followers: 1923,
      total_following: 89,
      risk_score: 6.8,
      max_drawdown: 8.5,
      sharpe_ratio: 2.1,
      is_verified: true,
      is_public: true,
      is_following: true,
      copy_trading_enabled: true,
      tier: 'gold',
      total_return: 134.2,
      monthly_return: 9.8,
      followers_count: 1923,
      following_count: 89,
      avg_hold_time: '1d 12h',
      verified: true,
      created_at: '2023-03-20'
    }
  ];

  const mockSocialFeed: SocialPost[] = [
    {
      id: 'post-1',
      user_id: 'trader-1',
      username: 'CryptoMaster99',
      avatar_url: '/api/placeholder/40/40',
      type: 'trade_signal',
      content: 'Strong bullish momentum on AGENT-7. Technical indicators showing potential breakout above $2.50 resistance.',
      trade_data: {
        symbol: 'AGENT-7',
        action: 'buy',
        price: 2.34,
        target: 2.85,
        stop_loss: 2.10,
        confidence: 85
      },
      likes_count: 127,
      comments_count: 23,
      shares_count: 45,
      created_at: '2024-01-15T10:30:00Z',
      is_liked: false,
      verified_trade: true
    }
  ];

  const fetchTopTraders = useCallback(async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from Supabase
      setTopTraders(mockTraders);
      setError(null);
    } catch (err) {
      setError('Failed to fetch top traders');
      console.error('Error fetching traders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSocialFeed = useCallback(async () => {
    try {
      setSocialFeed(mockSocialFeed);
    } catch (err) {
      console.error('Error fetching social feed:', err);
    }
  }, []);

  const followTrader = useCallback(async (traderId: string) => {
    try {
      setTopTraders(prev => 
        prev.map(trader => 
          trader.id === traderId 
            ? { ...trader, is_following: true, followers_count: trader.followers_count + 1 }
            : trader
        )
      );

      toast({
        title: "Following trader",
        description: "You are now following this trader",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to follow trader",
        variant: "destructive",
      });
    }
  }, [toast]);

  const unfollowTrader = useCallback(async (traderId: string) => {
    try {
      setTopTraders(prev => 
        prev.map(trader => 
          trader.id === traderId 
            ? { ...trader, is_following: false, followers_count: trader.followers_count - 1 }
            : trader
        )
      );

      toast({
        title: "Unfollowed trader",
        description: "You are no longer following this trader",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unfollow trader",
        variant: "destructive",
      });
    }
  }, [toast]);

  const enableCopyTrading = useCallback(async (traderId: string, settings: Partial<CopyTradingSettings>) => {
    try {
      const newSettings: CopyTradingSettings = {
        id: `copy-${traderId}`,
        trader_id: traderId,
        is_active: true,
        allocation_percentage: settings.allocation_percentage || 10,
        max_position_size: settings.max_position_size || 1000,
        risk_management: {
          max_drawdown: 15,
          stop_copy_threshold: 10,
          max_daily_trades: 5,
          ...settings.risk_management
        },
        filters: {
          min_confidence: 70,
          excluded_symbols: [],
          max_position_duration: 7,
          ...settings.filters
        }
      };

      setCopyTradingSettings(prev => [...prev, newSettings]);

      toast({
        title: "Copy trading enabled",
        description: "You will now copy this trader's signals",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to enable copy trading",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disableCopyTrading = useCallback(async (traderId: string) => {
    try {
      setCopyTradingSettings(prev => 
        prev.filter(setting => setting.trader_id !== traderId)
      );

      toast({
        title: "Copy trading disabled",
        description: "You will no longer copy this trader's signals",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to disable copy trading",
        variant: "destructive",
      });
    }
  }, [toast]);

  const likePost = useCallback(async (postId: string) => {
    try {
      setSocialFeed(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }, []);

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
    fetchSocialFeed();
    fetchTradingSignals();
    fetchCompetitions();
  }, [fetchTopTraders, fetchSocialFeed]);

  return {
    topTraders,
    socialFeed,
    following,
    copyTradingSettings,
    tradingSignals,
    competitions,
    loading,
    loadingTraders,
    loadingSignals,
    loadingCompetitions,
    error,
    followTrader,
    unfollowTrader,
    enableCopyTrading,
    disableCopyTrading,
    likePost,
    refreshTraders: fetchTopTraders,
    refreshSignals: fetchTradingSignals,
    refreshCompetitions: fetchCompetitions,
    fetchTopTraders,
    fetchSocialFeed
  };
};