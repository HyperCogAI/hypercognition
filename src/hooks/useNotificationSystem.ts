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
  email_notifications_enabled: boolean
  push_notifications_enabled: boolean
  price_alerts_enabled: boolean
  portfolio_updates_enabled: boolean
  social_updates_enabled: boolean
  market_news_enabled: boolean
  min_price_change_percent: number
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
            email_notifications_enabled: true,
            push_notifications_enabled: true,
            price_alerts_enabled: true,
            portfolio_updates_enabled: true,
            social_updates_enabled: true,
            market_news_enabled: true,
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