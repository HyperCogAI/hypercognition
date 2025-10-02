import { supabase } from '@/integrations/supabase/client'

export interface TraderStats {
  id: string
  user_id: string
  total_trades: number
  successful_trades: number
  total_pnl: number
  win_rate: number
  avg_trade_size: number
  total_volume: number
  follower_count: number
  ranking?: number
  is_verified: boolean
  bio?: string
  trading_style?: string[]
  specializations?: string[]
  updated_at: string
}

export interface CopyTradingSetting {
  id: string
  trader_id: string
  follower_id: string
  copy_percentage: number
  max_amount_per_trade?: number
  stop_loss_percentage?: number
  take_profit_percentage?: number
  is_active: boolean
  agents_to_copy?: string[]
  agents_to_exclude?: string[]
  copy_types?: string[]
  created_at: string
  updated_at: string
}

export class CopyTradingService {
  /**
   * Get top traders
   */
  async getTopTraders(limit: number = 20): Promise<TraderStats[]> {
    const { data, error } = await supabase
      .from('trader_stats' as any)
      .select('*')
      .order('ranking', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching top traders:', error)
      return []
    }

    return (data || []) as any[]
  }

  /**
   * Get trader stats
   */
  async getTraderStats(userId: string): Promise<TraderStats | null> {
    const { data, error } = await supabase
      .from('trader_stats' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching trader stats:', error)
      return null
    }

    return data as any
  }

  /**
   * Get user's copy trading settings
   */
  async getCopySettings(userId: string): Promise<CopyTradingSetting[]> {
    const { data, error } = await supabase
      .from('copy_trading_settings')
      .select('*')
      .eq('follower_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching copy settings:', error)
      return []
    }

    return data as CopyTradingSetting[]
  }

  /**
   * Start copying a trader
   */
  async startCopyTrading(params: {
    trader_id: string
    copy_percentage?: number
    max_amount_per_trade?: number
    stop_loss_percentage?: number
    take_profit_percentage?: number
    agents_to_copy?: string[]
    agents_to_exclude?: string[]
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('copy_trading_settings')
        .insert({
          follower_id: user.id,
          ...params,
          is_active: true
        } as any)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Stop copying a trader
   */
  async stopCopyTrading(settingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('copy_trading_settings')
        .update({ is_active: false } as any)
        .eq('id', settingId)
        .eq('follower_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Update copy trading settings
   */
  async updateCopySettings(settingId: string, updates: Partial<CopyTradingSetting>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('copy_trading_settings')
        .update(updates as any)
        .eq('id', settingId)
        .eq('follower_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get traders being copied by user
   */
  async getCopiedTraders(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('copy_trading_settings')
      .select(`
        *,
        trader_stats!trader_id(*)
      `)
      .eq('follower_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching copied traders:', error)
      return []
    }

    return data || []
  }
}

export const copyTradingService = new CopyTradingService()
