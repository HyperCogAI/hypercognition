import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '@/services/CommunityService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function useCommunity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch community stats
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: () => communityService.getCommunityStats(),
  })

  // Fetch forum posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => communityService.getPosts(),
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['community-categories'],
    queryFn: () => communityService.getCategories(),
  })

  // Fetch chat messages
  const { data: chatMessages = [], isLoading: chatLoading } = useQuery({
    queryKey: ['community-chat'],
    queryFn: () => communityService.getChatMessages(),
  })

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: () => communityService.getLeaderboard(),
  })

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (post: { title: string; content: string; category_id?: string }) =>
      communityService.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
      queryClient.invalidateQueries({ queryKey: ['community-stats'] })
      toast({ title: 'Success', description: 'Post created successfully' })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      })
    },
  })

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => communityService.sendChatMessage(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-chat'] })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    },
  })

  // Subscribe to real-time chat updates
  useEffect(() => {
    const channel = communityService.subscribeToChat((message) => {
      queryClient.setQueryData(['community-chat'], (old: any) => {
        if (!old) return [message]
        return [...old, message]
      })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  return {
    // Data
    stats,
    posts,
    categories,
    chatMessages,
    leaderboard,
    
    // Loading states
    isLoading: postsLoading || chatLoading || leaderboardLoading,
    postsLoading,
    chatLoading,
    leaderboardLoading,
    
    // Mutations
    createPost: createPostMutation.mutate,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    
    // Mutation states
    isCreatingPost: createPostMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
  }
}
