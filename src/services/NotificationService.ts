import { supabase } from '@/integrations/supabase/client'
import { DatabaseService } from './DatabaseService'

export interface NotificationPreferences {
  id?: string
  user_id?: string
  // Channel preferences
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  in_app_enabled: boolean
  // Category preferences
  price_alerts: boolean
  order_updates: boolean
  portfolio_updates: boolean
  social_updates: boolean
  marketing_updates: boolean
  security_alerts: boolean
  // Timing preferences
  quiet_hours_start?: string | null
  quiet_hours_end?: string | null
  timezone: string
  // Batching preferences
  batch_notifications: boolean
  batch_interval_minutes: number
  // Thresholds
  min_price_change_percent: number
  created_at?: string
  updated_at?: string
}

export interface PriceAlert {
  id: string
  user_id: string
  agent_id: string
  agent_name: string
  agent_symbol: string
  alert_type: 'price_above' | 'price_below' | 'percent_change'
  target_value: number
  current_value: number
  is_active: boolean
  is_triggered: boolean
  triggered_at?: string
  created_at: string
}

export class NotificationService {
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Return defaults if no preferences found
    if (!data) {
      const defaults: NotificationPreferences = {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        in_app_enabled: true,
        price_alerts: true,
        order_updates: true,
        portfolio_updates: true,
        social_updates: true,
        marketing_updates: false,
        security_alerts: true,
        timezone: 'UTC',
        batch_notifications: false,
        batch_interval_minutes: 60,
        min_price_change_percent: 5.0
      }
      
      // Create default preferences
      await this.updateUserPreferences(userId, defaults)
      return defaults
    }

    return {
      email_enabled: (data as any).email_enabled ?? data.email_notifications_enabled ?? true,
      push_enabled: (data as any).push_enabled ?? data.push_notifications_enabled ?? true,
      sms_enabled: (data as any).sms_enabled ?? false,
      in_app_enabled: (data as any).in_app_enabled ?? true,
      price_alerts: (data as any).price_alerts ?? data.price_alerts_enabled ?? true,
      order_updates: (data as any).order_updates ?? true,
      portfolio_updates: (data as any).portfolio_updates ?? data.portfolio_updates_enabled ?? true,
      social_updates: (data as any).social_updates ?? data.social_updates_enabled ?? true,
      marketing_updates: (data as any).marketing_updates ?? false,
      security_alerts: (data as any).security_alerts ?? true,
      quiet_hours_start: (data as any).quiet_hours_start ?? undefined,
      quiet_hours_end: (data as any).quiet_hours_end ?? undefined,
      timezone: (data as any).timezone ?? 'UTC',
      batch_notifications: (data as any).batch_notifications ?? false,
      batch_interval_minutes: (data as any).batch_interval_minutes ?? 60,
      min_price_change_percent: data.min_price_change_percent ?? 5.0
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createPriceAlert(userId: string, alertData: {
    agent_id: string
    alert_type: 'price_above' | 'price_below' | 'percent_change'
    target_value: number
  }): Promise<PriceAlert> {
    // Get agent details
    const agent = await DatabaseService.getAgent(alertData.agent_id)
    if (!agent) throw new Error('Agent not found')

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: userId,
        agent_id: alertData.agent_id,
        agent_name: agent.name,
        agent_symbol: agent.symbol,
        alert_type: alertData.alert_type,
        target_value: alertData.target_value,
        current_value: agent.price,
        is_active: true,
        is_triggered: false
      })
      .select()
      .single()

    if (error) throw error
    return data as PriceAlert
  }

  static async getUserPriceAlerts(userId: string, activeOnly: boolean = true): Promise<PriceAlert[]> {
    let query = supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data as PriceAlert[] || []
  }

  static async updatePriceAlert(alertId: string, updates: Partial<PriceAlert>) {
    const { data, error } = await supabase
      .from('price_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePriceAlert(alertId: string) {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', alertId)

    if (error) throw error
  }

  static async sendPriceAlertNotification(userId: string, alert: PriceAlert, currentPrice: number) {
    const preferences = await this.getUserPreferences(userId)
    
    if (!preferences.price_alerts) return

    let message = ''
    switch (alert.alert_type) {
      case 'price_above':
        message = `${alert.agent_symbol} has risen above $${alert.target_value}. Current price: $${currentPrice}`
        break
      case 'price_below':
        message = `${alert.agent_symbol} has dropped below $${alert.target_value}. Current price: $${currentPrice}`
        break
      case 'percent_change':
        const changePercent = ((currentPrice - alert.current_value) / alert.current_value) * 100
        message = `${alert.agent_symbol} has changed by ${changePercent.toFixed(2)}%. Current price: $${currentPrice}`
        break
    }

    await DatabaseService.createNotification(userId, {
      type: 'price_alert',
      category: 'trading',
      priority: 'high',
      title: 'Price Alert Triggered',
      message,
      action_url: `/agent/${alert.agent_id}`,
      data: {
        alert_id: alert.id,
        agent_id: alert.agent_id,
        current_price: currentPrice,
        target_value: alert.target_value
      }
    })
  }

  static async sendPortfolioUpdateNotification(userId: string, updateData: {
    type: 'buy' | 'sell' | 'performance'
    agent_id?: string
    agent_symbol?: string
    amount?: number
    price?: number
    pnl_change?: number
  }) {
    const preferences = await this.getUserPreferences(userId)
    
    if (!preferences.portfolio_updates) return

    let title = 'Portfolio Update'
    let message = ''
    let priority: 'low' | 'normal' | 'high' = 'normal'

    switch (updateData.type) {
      case 'buy':
        title = 'Purchase Completed'
        message = `Successfully bought ${updateData.amount} ${updateData.agent_symbol} at $${updateData.price}`
        break
      case 'sell':
        title = 'Sale Completed'
        message = `Successfully sold ${updateData.amount} ${updateData.agent_symbol} at $${updateData.price}`
        break
      case 'performance':
        title = 'Portfolio Performance Update'
        const pnlChange = updateData.pnl_change || 0
        if (Math.abs(pnlChange) >= preferences.min_price_change_percent) {
          message = `Your portfolio has ${pnlChange > 0 ? 'gained' : 'lost'} ${Math.abs(pnlChange).toFixed(2)}% today`
          priority = Math.abs(pnlChange) >= 10 ? 'high' : 'normal'
        } else {
          return // Don't send notification for small changes
        }
        break
    }

    await DatabaseService.createNotification(userId, {
      type: 'portfolio_update',
      category: 'trading',
      priority,
      title,
      message,
      action_url: '/portfolio',
      data: updateData
    })
  }

  static async sendMarketNewsNotification(userId: string, newsData: {
    title: string
    summary: string
    affected_agents?: string[]
    severity?: 'low' | 'medium' | 'high'
  }) {
    const preferences = await this.getUserPreferences(userId)
    
    // Market news would fall under portfolio_updates category
    if (!preferences.portfolio_updates) return

    await DatabaseService.createNotification(userId, {
      type: 'market_news',
      category: 'news',
      priority: newsData.severity === 'high' ? 'high' : 'normal',
      title: newsData.title,
      message: newsData.summary,
      action_url: '/analytics',
      data: newsData
    })
  }

  static async sendSocialUpdateNotification(userId: string, socialData: {
    type: 'follow' | 'comment' | 'rating' | 'mention'
    from_user_id: string
    agent_id?: string
    content?: string
  }) {
    const preferences = await this.getUserPreferences(userId)
    
    if (!preferences.social_updates) return

    let title = 'Social Update'
    let message = ''

    switch (socialData.type) {
      case 'follow':
        title = 'New Follower'
        message = 'Someone started following your trading activity'
        break
      case 'comment':
        title = 'New Comment'
        message = 'Someone commented on your activity'
        break
      case 'rating':
        title = 'New Rating'
        message = 'Someone rated your trading performance'
        break
      case 'mention':
        title = 'You were mentioned'
        message = socialData.content || 'You were mentioned in a discussion'
        break
    }

    await DatabaseService.createNotification(userId, {
      type: 'social_update',
      category: 'social',
      priority: 'low',
      title,
      message,
      action_url: '/social',
      data: socialData
    })
  }

  static async processTriggeredAlerts() {
    // Get all active price alerts
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('is_active', true)
      .eq('is_triggered', false)

    if (error || !alerts) return

    for (const alert of alerts) {
      // Get current agent price
      const { data: agent } = await supabase
        .from('agents')
        .select('price')
        .eq('id', alert.agent_id)
        .single()
      
      const currentPrice = agent?.price || alert.current_value
      let shouldTrigger = false

      switch (alert.alert_type) {
        case 'price_above':
          shouldTrigger = currentPrice >= alert.target_value
          break
        case 'price_below':
          shouldTrigger = currentPrice <= alert.target_value
          break
        case 'percent_change':
          const changePercent = Math.abs((currentPrice - alert.current_value) / alert.current_value) * 100
          shouldTrigger = changePercent >= alert.target_value
          break
      }

      if (shouldTrigger) {
        // Mark alert as triggered
        await this.updatePriceAlert(alert.id, {
          is_triggered: true,
          triggered_at: new Date().toISOString(),
          current_value: currentPrice
        })

        // Send notification
        await this.sendPriceAlertNotification(alert.user_id, alert as PriceAlert, currentPrice)
      }
    }
  }
}