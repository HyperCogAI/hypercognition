import { supabase } from '@/integrations/supabase/client'

export interface TraderProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  total_pnl: number
  pnl_percentage: number
  win_rate: number
  total_trades: number
  total_followers: number
  total_following: number
  risk_score?: number
  max_drawdown: number
  sharpe_ratio?: number
  is_verified: boolean
  is_public: boolean
  copy_trading_enabled: boolean
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_return: number
  monthly_return: number
  avg_hold_time?: string
  created_at: string
}

export interface TradingSignal {
  id: string
  user_id: string
  agent_id: string
  signal_type: 'buy' | 'sell' | 'hold' | 'exit'
  price: number
  target_price?: number
  stop_loss_price?: number
  confidence_level: number
  reasoning?: string
  time_horizon?: string
  likes_count: number
  views_count: number
  comments_count: number
  is_premium: boolean
  created_at: string
  expires_at?: string
  trader_profiles?: TraderProfile
  agents?: {
    name: string
    symbol: string
    avatar_url?: string
  }
}

export interface CopyTradingSettings {
  id: string
  follower_id: string
  trader_id: string
  is_active: boolean
  allocation_percentage: number
  max_position_size: number
  risk_management: {
    max_drawdown: number
    stop_copy_threshold: number
    max_daily_trades: number
  }
  filters: {
    min_confidence: number
    excluded_symbols: string[]
    max_position_duration: number
  }
}

class SocialTradingService {
  // ==================== TRADER PROFILES ====================
  
  async getTopTraders(limit = 20) {
    const { data, error } = await supabase
      .from('trader_profiles')
      .select('*')
      .eq('is_public', true)
      .order('pnl_percentage', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as any as TraderProfile[]
  }
  
  async getTraderProfile(userId: string) {
    const { data, error } = await supabase
      .from('trader_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data as any as TraderProfile
  }
  
  async updateTraderProfile(userId: string, updates: Partial<TraderProfile>) {
    const { data, error } = await supabase
      .from('trader_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, profile: data }
  }
  
  // ==================== FOLLOW/UNFOLLOW ====================
  
  async followTrader(traderId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('trader_follows' as any)
      .insert({
        follower_id: userId,
        trader_id: traderId
      })
    
    if (error) throw error
    return { success: true }
  }
  
  async unfollowTrader(traderId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('trader_follows' as any)
      .delete()
      .eq('follower_id', userId)
      .eq('trader_id', traderId)
    
    if (error) throw error
    return { success: true }
  }
  
  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('trader_follows' as any)
      .select('trader_id')
      .eq('follower_id', userId)
    
    if (error) throw error
    return (data || []).map((f: any) => f.trader_id)
  }
  
  // ==================== TRADING SIGNALS ====================
  
  async getTradingSignals(limit = 20) {
    const { data, error } = await supabase
      .from('trading_signals' as any)
      .select(`
        *,
        trader_profiles!trading_signals_user_id_fkey(username, display_name, avatar_url, is_verified),
        agents(name, symbol, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as any as TradingSignal[]
  }
  
  async createSignal(signal: {
    agent_id: string
    signal_type: 'buy' | 'sell' | 'hold' | 'exit'
    price: number
    target_price?: number
    stop_loss_price?: number
    confidence_level: number
    reasoning?: string
    time_horizon?: string
  }) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { data, error} = await supabase
      .from('trading_signals' as any)
      .insert({
        ...signal,
        user_id: userId
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, signal: data }
  }
  
  async likeSignal(signalId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('signal_likes' as any)
      .insert({
        signal_id: signalId,
        user_id: userId
      })
    
    if (error) throw error
    return { success: true }
  }
  
  async unlikeSignal(signalId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('signal_likes' as any)
      .delete()
      .eq('signal_id', signalId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { success: true }
  }
  
  // ==================== COPY TRADING ====================
  
  async getCopySettings(userId: string) {
    const { data, error } = await supabase
      .from('copy_trading_settings' as any)
      .select('*')
      .eq('follower_id', userId)
    
    if (error) throw error
    return data as any as CopyTradingSettings[]
  }
  
  async enableCopyTrading(traderId: string, settings: Partial<CopyTradingSettings>) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('copy_trading_settings' as any)
      .insert({
        follower_id: userId,
        trader_id: traderId,
        is_active: true,
        allocation_percentage: settings.allocation_percentage || 10,
        max_position_size: settings.max_position_size || 1000,
        risk_management: settings.risk_management || {
          max_drawdown: 15,
          stop_copy_threshold: 10,
          max_daily_trades: 5
        },
        filters: settings.filters || {
          min_confidence: 70,
          excluded_symbols: [],
          max_position_duration: 7
        }
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, settings: data }
  }
  
  async disableCopyTrading(traderId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('copy_trading_settings' as any)
      .delete()
      .eq('follower_id', userId)
      .eq('trader_id', traderId)
    
    if (error) throw error
    return { success: true }
  }
  
  async updateCopySettings(traderId: string, updates: Partial<CopyTradingSettings>) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('copy_trading_settings' as any)
      .update(updates)
      .eq('follower_id', userId)
      .eq('trader_id', traderId)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, settings: data }
  }
  
  // ==================== COMPETITIONS ====================
  
  async getActiveCompetitions() {
    const { data, error } = await supabase
      .from('trading_competitions' as any)
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: true })
    
    if (error) throw error
    return data
  }
  
  async getCompetition(id: string) {
    const { data, error } = await supabase
      .from('trading_competitions' as any)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

export const socialTradingService = new SocialTradingService()
