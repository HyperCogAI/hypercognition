import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Notification {
  id: string
  user_id: string
  type: string
  category: string
  priority: string
  title: string
  message: string
  read: boolean
  action_url?: string
  data?: any
  created_at: string
  read_at?: string
}

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

export function useNotificationSystem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data as Notification[]
    },
    enabled: !!user?.id,
  })

  // Fetch preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error)
        return null
      }

      // Create default preferences if none exist
      if (!data) {
        const { data: newPrefs } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
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
            min_price_change_percent: 5
          })
          .select()
          .single()

        return newPrefs
      }

      return data
    },
    enabled: !!user?.id,
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user?.id)
        .eq('read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('notification_preferences')
        .update(prefs as any)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    }
  })

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending
  }
}