import { supabase } from '@/integrations/supabase/client'

export interface BackupMetadata {
  id: string
  user_id: string
  backup_type: 'full' | 'portfolio' | 'settings' | 'transactions'
  file_size: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  error_message?: string
  download_url?: string
}

export interface BackupData {
  portfolio: any[]
  orders: any[]
  notifications: any[]
  preferences: any
  price_alerts: any[]
  metadata: {
    exported_at: string
    export_version: string
    user_id: string
  }
}

export class BackupService {
  static async createUserBackup(userId: string, backupType: 'full' | 'portfolio' | 'settings' | 'transactions' = 'full'): Promise<BackupData> {
    const backupData: BackupData = {
      portfolio: [],
      orders: [],
      notifications: [],
      preferences: {},
      price_alerts: [],
      metadata: {
        exported_at: new Date().toISOString(),
        export_version: '1.0',
        user_id: userId
      }
    }

    try {
      if (backupType === 'full' || backupType === 'portfolio') {
        // Backup portfolio data
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select(`
            *,
            agent:agents(*)
          `)
          .eq('user_id', userId)

        backupData.portfolio = portfolio || []
      }

      if (backupType === 'full' || backupType === 'transactions') {
        // Backup orders/transactions
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            *,
            agent:agents(*),
            executions:order_executions(*)
          `)
          .eq('user_id', userId)

        backupData.orders = orders || []
      }

      if (backupType === 'full' || backupType === 'settings') {
        // Backup notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)

        backupData.notifications = notifications || []

        // Backup preferences
        const { data: preferences } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()

        backupData.preferences = preferences || {}

        // Backup price alerts
        const { data: priceAlerts } = await supabase
          .from('price_alerts')
          .select('*')
          .eq('user_id', userId)

        backupData.price_alerts = priceAlerts || []
      }

      return backupData
    } catch (error) {
      console.error('Backup creation failed:', error)
      throw new Error('Failed to create backup')
    }
  }

  static async restoreUserData(userId: string, backupData: BackupData): Promise<void> {
    if (backupData.metadata.user_id !== userId) {
      throw new Error('Backup data belongs to a different user')
    }

    try {
      // Restore portfolio data
      if (backupData.portfolio.length > 0) {
        // Clear existing portfolio
        await supabase
          .from('portfolios')
          .delete()
          .eq('user_id', userId)

        // Insert backup data
        const portfolioData = backupData.portfolio.map(item => ({
          user_id: userId,
          agent_id: item.agent_id,
          amount: item.amount,
          purchase_price: item.purchase_price,
          purchase_date: item.purchase_date
        }))

        await supabase
          .from('portfolios')
          .insert(portfolioData)
      }

      // Restore preferences
      if (Object.keys(backupData.preferences).length > 0) {
        await supabase
          .from('notification_preferences')
          .upsert({
            user_id: userId,
            ...backupData.preferences
          })
      }

      // Restore price alerts
      if (backupData.price_alerts.length > 0) {
        // Clear existing alerts
        await supabase
          .from('price_alerts')
          .delete()
          .eq('user_id', userId)

        // Insert backup alerts
        const alertData = backupData.price_alerts.map(alert => ({
          user_id: userId,
          agent_id: alert.agent_id,
          agent_name: alert.agent_name,
          agent_symbol: alert.agent_symbol,
          alert_type: alert.alert_type,
          target_value: alert.target_value,
          current_value: alert.current_value,
          is_active: alert.is_active,
          is_triggered: false // Reset trigger status
        }))

        await supabase
          .from('price_alerts')
          .insert(alertData)
      }
    } catch (error) {
      console.error('Restore failed:', error)
      throw new Error('Failed to restore backup data')
    }
  }

  static async exportToJSON(userId: string, backupType: 'full' | 'portfolio' | 'settings' | 'transactions' = 'full'): Promise<string> {
    const backupData = await this.createUserBackup(userId, backupType)
    return JSON.stringify(backupData, null, 2)
  }

  static async importFromJSON(userId: string, jsonData: string): Promise<void> {
    try {
      const backupData: BackupData = JSON.parse(jsonData)
      
      // Validate backup data structure
      if (!backupData.metadata || !backupData.metadata.user_id) {
        throw new Error('Invalid backup data format')
      }

      await this.restoreUserData(userId, backupData)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format')
      }
      throw error
    }
  }

  static async scheduleAutomaticBackup(userId: string, frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    // In a real implementation, this would schedule a background job
    // For now, we'll just store the preference
    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        backup_frequency: frequency,
        auto_backup_enabled: true,
        updated_at: new Date().toISOString()
      })
  }

  static async getBackupHistory(userId: string): Promise<BackupMetadata[]> {
    // This would typically come from a backup_history table
    // For now, return empty array as we're not storing backup metadata
    return []
  }

  static generateBackupFileName(userId: string, backupType: string): string {
    const timestamp = new Date().toISOString().split('T')[0]
    return `hypercognition-backup-${backupType}-${timestamp}.json`
  }

  static validateBackupData(backupData: any): boolean {
    try {
      return (
        backupData &&
        backupData.metadata &&
        backupData.metadata.user_id &&
        backupData.metadata.exported_at &&
        backupData.metadata.export_version &&
        Array.isArray(backupData.portfolio) &&
        Array.isArray(backupData.orders) &&
        Array.isArray(backupData.notifications) &&
        Array.isArray(backupData.price_alerts)
      )
    } catch {
      return false
    }
  }

  static calculateBackupSize(backupData: BackupData): number {
    return new Blob([JSON.stringify(backupData)]).size
  }
}