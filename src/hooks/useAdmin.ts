import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface AdminUser {
  id: string
  user_id: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  is_active: boolean
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAdmin(false)
        setAdminRole(null)
        setIsLoading(false)
        return
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role, is_active, permissions')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (adminData) {
        setIsAdmin(true)
        setAdminRole(adminData.role)
      } else {
        setIsAdmin(false)
        setAdminRole(null)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      setAdminRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!isAdmin) return false
    if (adminRole === 'super_admin') return true
    // Add more granular permission checks here
    return true
  }

  return {
    isAdmin,
    adminRole,
    isLoading,
    hasPermission,
    checkAdminStatus
  }
}