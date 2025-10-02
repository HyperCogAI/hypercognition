import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { adminService } from '@/services/AdminService'
import { toast } from '@/hooks/use-toast'

export function useAdminSystem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Check if user is admin
  const { data: isAdmin = false, isLoading: checkingAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: () => adminService.isAdmin(),
    enabled: !!user?.id,
  })

  // Fetch platform metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: () => adminService.getPlatformMetrics(),
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch admin users
  const { data: adminUsers = [], isLoading: adminUsersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getAdminUsers(),
    enabled: isAdmin,
  })

  // Fetch users for management
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-management'],
    queryFn: () => adminService.getUsers(),
    enabled: isAdmin,
  })

  // Update admin user mutation
  const updateAdminMutation = useMutation({
    mutationFn: ({ userId, updates }: { 
      userId: string; 
      updates: { role?: string; permissions?: any; is_active?: boolean } 
    }) => adminService.updateAdminUser(userId, updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        toast({
          title: 'Success',
          description: 'Admin user updated',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update admin user',
          variant: 'destructive'
        })
      }
    }
  })

  // Moderate user mutation
  const moderateUserMutation = useMutation({
    mutationFn: ({ userId, action }: { 
      userId: string; 
      action: 'ban' | 'suspend' | 'activate' 
    }) => adminService.moderateUser(userId, action),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['users-management'] })
        toast({
          title: 'Success',
          description: 'User moderation action completed',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to moderate user',
          variant: 'destructive'
        })
      }
    }
  })

  return {
    isAdmin,
    checkingAdmin,
    metrics,
    adminUsers,
    users,
    isLoading: metricsLoading || adminUsersLoading || usersLoading,
    updateAdminUser: updateAdminMutation.mutate,
    moderateUser: moderateUserMutation.mutate,
    isUpdatingAdmin: updateAdminMutation.isPending,
    isModeratingUser: moderateUserMutation.isPending
  }
}