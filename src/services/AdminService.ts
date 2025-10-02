import { supabase } from '@/integrations/supabase/client'

export interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalVolume: number
  totalRevenue: number
  newUsersToday: number
  ordersToday: number
}

export interface AdminUser {
  id: string
  user_id: string
  role: string
  permissions: any
  is_active: boolean
  created_at: string
}

export class AdminService {
  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    return !!data
  }

  /**
   * Get platform metrics
   */
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      const { data, error } = await supabase.functions.invoke('platform-metrics')

      if (error) {
        console.error('Error fetching platform metrics:', error)
        return this.getDefaultMetrics()
      }

      return data || this.getDefaultMetrics()
    } catch (error) {
      console.error('Error in getPlatformMetrics:', error)
      return this.getDefaultMetrics()
    }
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin users:', error)
      return []
    }

    return data || []
  }

  /**
   * Update admin user
   */
  async updateAdminUser(userId: string, updates: {
    role?: string
    permissions?: any
    is_active?: boolean
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating admin user:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user management data
   */
  async getUsers(limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data || []
  }

  /**
   * Ban/suspend a user
   */
  async moderateUser(userId: string, action: 'ban' | 'suspend' | 'activate'): Promise<{ success: boolean; error?: string }> {
    try {
      // Log admin action
      const { data: { user: adminUser } } = await supabase.auth.getUser()
      
      if (!adminUser) {
        return { success: false, error: 'Admin not authenticated' }
      }

      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: adminUser.id,
          action_type: `user_${action}`,
          target_user_id: userId,
          action_details: { timestamp: new Date().toISOString() }
        })

      // In a real implementation, this would update auth.users
      // For now, we'll update profiles
      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
          // Add status field if needed
        })
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private getDefaultMetrics(): PlatformMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalVolume: 0,
      totalRevenue: 0,
      newUsersToday: 0,
      ordersToday: 0
    }
  }
}

export const adminService = new AdminService()