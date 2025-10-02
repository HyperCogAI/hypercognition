import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { communityService } from '@/services/CommunityService'
import { toast } from '@/hooks/use-toast'

export function useCommunity(communityId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all communities
  const { data: communities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: () => communityService.getCommunities(),
  })

  // Fetch user's communities
  const { data: userCommunities = [] } = useQuery({
    queryKey: ['user-communities', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return communityService.getUserCommunities(user.id)
    },
    enabled: !!user?.id,
  })

  // Fetch community posts
  const { data: communityPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: () => {
      if (!communityId) return []
      return communityService.getCommunityPosts(communityId)
    },
    enabled: !!communityId,
  })

  // Fetch community members
  const { data: communityMembers = [] } = useQuery({
    queryKey: ['community-members', communityId],
    queryFn: () => {
      if (!communityId) return []
      return communityService.getCommunityMembers(communityId)
    },
    enabled: !!communityId,
  })

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: (community: Parameters<typeof communityService.createCommunity>[0]) =>
      communityService.createCommunity(community),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['communities'] })
        queryClient.invalidateQueries({ queryKey: ['user-communities'] })
        toast({
          title: 'Success',
          description: 'Community created successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create community',
          variant: 'destructive'
        })
      }
    }
  })

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => communityService.joinCommunity(communityId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['communities'] })
        queryClient.invalidateQueries({ queryKey: ['user-communities'] })
        queryClient.invalidateQueries({ queryKey: ['community-members'] })
        toast({
          title: 'Success',
          description: 'Joined community',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to join community',
          variant: 'destructive'
        })
      }
    }
  })

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => communityService.leaveCommunity(communityId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user-communities'] })
        queryClient.invalidateQueries({ queryKey: ['community-members'] })
        toast({
          title: 'Success',
          description: 'Left community',
        })
      }
    }
  })

  // Create community post mutation
  const createPostMutation = useMutation({
    mutationFn: (post: Parameters<typeof communityService.createCommunityPost>[0]) =>
      communityService.createCommunityPost(post),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['community-posts'] })
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

  return {
    communities,
    userCommunities,
    communityPosts,
    communityMembers,
    isLoading: communitiesLoading || postsLoading,
    createCommunity: createCommunityMutation.mutate,
    joinCommunity: joinCommunityMutation.mutate,
    leaveCommunity: leaveCommunityMutation.mutate,
    createPost: createPostMutation.mutate,
    isCreatingCommunity: createCommunityMutation.isPending,
    isJoining: joinCommunityMutation.isPending,
    isCreatingPost: createPostMutation.isPending,
  }
}
