import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { socialTradingService } from '@/services/SocialTradingService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export const useSocialTrading = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch top traders
  const { data: topTraders = [], isLoading: loadingTraders } = useQuery({
    queryKey: ['top-traders'],
    queryFn: () => socialTradingService.getTopTraders(),
  })

  // Fetch trading signals
  const { data: tradingSignals = [], isLoading: loadingSignals } = useQuery({
    queryKey: ['trading-signals'],
    queryFn: () => socialTradingService.getTradingSignals(),
  })

  // Fetch active competitions
  const { data: competitions = [], isLoading: loadingCompetitions } = useQuery({
    queryKey: ['active-competitions'],
    queryFn: () => socialTradingService.getActiveCompetitions(),
  })

  // Fetch user's copy settings
  const { data: copyTradingSettings = [] } = useQuery({
    queryKey: ['copy-settings', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return socialTradingService.getCopySettings(user.id)
    },
    enabled: !!user?.id,
  })

  // Fetch following list
  const { data: followingIds = [] } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return socialTradingService.getFollowing(user.id)
    },
    enabled: !!user?.id,
  })

  // Follow trader mutation
  const followTraderMutation = useMutation({
    mutationFn: (traderId: string) => socialTradingService.followTrader(traderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['top-traders'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
      toast({
        title: 'Following trader',
        description: 'You are now following this trader',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to follow trader',
        variant: 'destructive',
      })
    },
  })

  // Unfollow trader mutation
  const unfollowTraderMutation = useMutation({
    mutationFn: (traderId: string) => socialTradingService.unfollowTrader(traderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['top-traders'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })
      toast({
        title: 'Unfollowed trader',
        description: 'You are no longer following this trader',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to unfollow trader',
        variant: 'destructive',
      })
    },
  })

  // Enable copy trading mutation
  const enableCopyTradingMutation = useMutation({
    mutationFn: ({ traderId, settings }: { traderId: string; settings: any }) =>
      socialTradingService.enableCopyTrading(traderId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copy-settings'] })
      toast({
        title: 'Copy trading enabled',
        description: "You will now copy this trader's signals",
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to enable copy trading',
        variant: 'destructive',
      })
    },
  })

  // Disable copy trading mutation
  const disableCopyTradingMutation = useMutation({
    mutationFn: (traderId: string) => socialTradingService.disableCopyTrading(traderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copy-settings'] })
      toast({
        title: 'Copy trading disabled',
        description: "You will no longer copy this trader's signals",
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to disable copy trading',
        variant: 'destructive',
      })
    },
  })

  // Like signal mutation
  const likeSignalMutation = useMutation({
    mutationFn: (signalId: string) => socialTradingService.likeSignal(signalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-signals'] })
    },
  })

  return {
    // Data
    topTraders,
    tradingSignals,
    competitions,
    copyTradingSettings,
    following: topTraders.filter(t => followingIds.includes(t.user_id)),
    socialFeed: [], // Empty for now, can be populated from social service
    
    // Loading states
    loading: loadingTraders || loadingSignals || loadingCompetitions,
    loadingTraders,
    loadingSignals,
    loadingCompetitions,
    error: null,
    
    // Actions
    followTrader: followTraderMutation.mutate,
    unfollowTrader: unfollowTraderMutation.mutate,
    enableCopyTrading: (traderId: string, settings: any) =>
      enableCopyTradingMutation.mutate({ traderId, settings }),
    disableCopyTrading: disableCopyTradingMutation.mutate,
    likePost: likeSignalMutation.mutate,
    
    // Refresh functions
    refreshTraders: () => queryClient.invalidateQueries({ queryKey: ['top-traders'] }),
    refreshSignals: () => queryClient.invalidateQueries({ queryKey: ['trading-signals'] }),
    refreshCompetitions: () => queryClient.invalidateQueries({ queryKey: ['active-competitions'] }),
    fetchTopTraders: () => queryClient.invalidateQueries({ queryKey: ['top-traders'] }),
    fetchSocialFeed: () => {},
  }
}
