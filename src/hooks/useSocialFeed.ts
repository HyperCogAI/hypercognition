import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { socialService } from '@/services/SocialService'
import { toast } from '@/hooks/use-toast'

export function useSocialFeed() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch feed posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['social-feed'],
    queryFn: () => socialService.getFeedPosts(),
    refetchInterval: 30000,
  })

  // Fetch user's own posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return socialService.getUserPosts(user.id)
    },
    enabled: !!user?.id,
  })

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (post: Parameters<typeof socialService.createPost>[0]) =>
      socialService.createPost(post),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['social-feed'] })
        queryClient.invalidateQueries({ queryKey: ['user-posts'] })
        toast({
          title: 'Success',
          description: 'Post created successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create post',
          variant: 'destructive'
        })
      }
    }
  })

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => socialService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    }
  })

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: (postId: string) => socialService.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    }
  })

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: (userId: string) => socialService.followUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Now following user',
        })
      }
    }
  })

  // Unfollow user mutation
  const unfollowUserMutation = useMutation({
    mutationFn: (userId: string) => socialService.unfollowUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Unfollowed user',
        })
      }
    }
  })

  return {
    posts,
    userPosts,
    isLoading,
    createPost: createPostMutation.mutate,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
    followUser: followUserMutation.mutate,
    unfollowUser: unfollowUserMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
  }
}
