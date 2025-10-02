import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { copyTradingService } from '@/services/CopyTradingService'
import { toast } from '@/hooks/use-toast'

export function useCopyTrading() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch top traders
  const { data: topTraders = [], isLoading: tradersLoading } = useQuery({
    queryKey: ['top-traders'],
    queryFn: () => copyTradingService.getTopTraders(),
  })

  // Fetch user's copy settings
  const { data: copySettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['copy-settings', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return copyTradingService.getCopySettings(user.id)
    },
    enabled: !!user?.id,
  })

  // Fetch traders being copied
  const { data: copiedTraders = [] } = useQuery({
    queryKey: ['copied-traders', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return copyTradingService.getCopiedTraders(user.id)
    },
    enabled: !!user?.id,
  })

  // Fetch user's trader stats
  const { data: userTraderStats } = useQuery({
    queryKey: ['trader-stats', user?.id],
    queryFn: () => {
      if (!user?.id) return null
      return copyTradingService.getTraderStats(user.id)
    },
    enabled: !!user?.id,
  })

  // Start copy trading mutation
  const startCopyTradingMutation = useMutation({
    mutationFn: (params: Parameters<typeof copyTradingService.startCopyTrading>[0]) =>
      copyTradingService.startCopyTrading(params),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['copy-settings'] })
        queryClient.invalidateQueries({ queryKey: ['copied-traders'] })
        toast({
          title: 'Success',
          description: 'Started copying trader',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to start copy trading',
          variant: 'destructive'
        })
      }
    }
  })

  // Stop copy trading mutation
  const stopCopyTradingMutation = useMutation({
    mutationFn: (settingId: string) => copyTradingService.stopCopyTrading(settingId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['copy-settings'] })
        queryClient.invalidateQueries({ queryKey: ['copied-traders'] })
        toast({
          title: 'Success',
          description: 'Stopped copying trader',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to stop copy trading',
          variant: 'destructive'
        })
      }
    }
  })

  // Update copy settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: ({ settingId, updates }: { 
      settingId: string
      updates: Parameters<typeof copyTradingService.updateCopySettings>[1]
    }) => copyTradingService.updateCopySettings(settingId, updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['copy-settings'] })
        toast({
          title: 'Success',
          description: 'Settings updated',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update settings',
          variant: 'destructive'
        })
      }
    }
  })

  return {
    topTraders,
    copySettings,
    copiedTraders,
    userTraderStats,
    isLoading: tradersLoading || settingsLoading,
    startCopyTrading: startCopyTradingMutation.mutate,
    stopCopyTrading: stopCopyTradingMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    isStarting: startCopyTradingMutation.isPending,
    isStopping: stopCopyTradingMutation.isPending,
    isUpdating: updateSettingsMutation.isPending,
  }
}
