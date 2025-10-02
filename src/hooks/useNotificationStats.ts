import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface NotificationStats {
  total: number
  unread: number
  read: number
  urgent: number
  high: number
  by_category: Record<string, number>
  queued: number
  delivery_stats: Record<string, number>
  delivery_rate: string
  last_updated: string
}

export function useNotificationStats() {
  const { user } = useAuth()

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['notification-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase.functions.invoke('get-notification-stats', {
        body: { userId: user.id }
      })

      if (error) {
        console.error('Error fetching notification stats:', error)
        throw error
      }

      return data as NotificationStats
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return {
    stats,
    isLoading,
    error
  }
}
