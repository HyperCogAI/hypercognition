import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface QueueNotificationParams {
  type: string
  category?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  title: string
  message: string
  actionUrl?: string
  data?: any
  scheduledFor?: string
  batchable?: boolean
}

export function useNotificationQueue() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const queueNotification = useMutation({
    mutationFn: async (params: QueueNotificationParams) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase.functions.invoke('queue-notification', {
        body: {
          userId: user.id,
          ...params
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    },
    onError: (error: any) => {
      console.error('Error queueing notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to queue notification',
        variant: 'destructive'
      })
    }
  })

  const processQueue = useMutation({
    mutationFn: async (batchSize: number = 50) => {
      const { data, error } = await supabase.functions.invoke('process-notifications', {
        body: { batch_size: batchSize }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      console.log(`Processed ${data.processed} notifications`)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    },
    onError: (error: any) => {
      console.error('Error processing notification queue:', error)
    }
  })

  return {
    queueNotification: queueNotification.mutate,
    queueNotificationAsync: queueNotification.mutateAsync,
    isQueuing: queueNotification.isPending,
    processQueue: processQueue.mutate,
    processQueueAsync: processQueue.mutateAsync,
    isProcessing: processQueue.isPending
  }
}
