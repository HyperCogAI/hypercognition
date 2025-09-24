import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SecurityDashboard } from '@/components/security/SecurityDashboard'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/integrations/supabase/client'

// Mock hooks and dependencies
vi.mock('@/hooks/useAdmin')
vi.mock('@/integrations/supabase/client')
vi.mock('@/hooks/use-toast')

const mockUseAdmin = vi.mocked(useAdmin)
const mockSupabase = vi.mocked(supabase)

describe('Security Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Access Control', () => {
    it('denies access to non-admin users', () => {
      mockUseAdmin.mockReturnValue({
        isAdmin: false,
        adminRole: null,
        isLoading: false,
        hasPermission: vi.fn().mockReturnValue(false),
        checkAdminStatus: vi.fn()
      })

      render(<SecurityDashboard />)
      
      expect(screen.getByText('Access denied. Admin privileges required.')).toBeInTheDocument()
    })

    it('allows access to admin users', () => {
      mockUseAdmin.mockReturnValue({
        isAdmin: true,
        adminRole: 'admin',
        isLoading: false,
        hasPermission: vi.fn().mockReturnValue(true),
        checkAdminStatus: vi.fn()
      })

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })

      render(<SecurityDashboard />)
      
      expect(screen.getByText('Security Dashboard')).toBeInTheDocument()
    })
  })

  describe('Security Events Display', () => {
    beforeEach(() => {
      mockUseAdmin.mockReturnValue({
        isAdmin: true,
        adminRole: 'super_admin',
        isLoading: false,
        hasPermission: vi.fn().mockReturnValue(true),
        checkAdminStatus: vi.fn()
      })
    })

    it('displays security events correctly', async () => {
      const mockEvents = [
        {
          id: '1',
          action: 'login_failed',
          resource: 'authentication',
          details: { reason: 'invalid_password' },
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...'
        }
      ]

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockEvents, error: null })
          })
        })
      })

      render(<SecurityDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('login_failed')).toBeInTheDocument()
      })
    })

    it('handles sensitive data visibility toggle', async () => {
      const mockEvents = [
        {
          id: '1',
          action: 'suspicious_activity',
          resource: 'api',
          details: {},
          created_at: new Date().toISOString(),
          ip_address: '10.0.0.1',
          user_agent: 'Bot/1.0'
        }
      ]

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockEvents, error: null })
          })
        })
      })

      render(<SecurityDashboard />)
      
      const toggleButton = screen.getByText('Show Sensitive Data')
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Hide Sensitive Data')).toBeInTheDocument()
      })
    })
  })

  describe('Rate Limits Display', () => {
    it('displays active rate limits', async () => {
      mockUseAdmin.mockReturnValue({
        isAdmin: true,
        adminRole: 'admin',
        isLoading: false,
        hasPermission: vi.fn().mockReturnValue(true),
        checkAdminStatus: vi.fn()
      })

      const mockRateLimits = [
        {
          id: '1',
          identifier: '192.168.1.100',
          endpoint: 'trading',
          request_count: 5,
          window_start: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]

      ;(mockSupabase.from as any).mockImplementation((table: string) => {
        if (table === 'security_audit_log') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null })
              })
            })
          }
        } else if (table === 'rate_limits') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockRateLimits, error: null })
              })
            })
          }
        }
      })

      render(<SecurityDashboard />)
      
      const rateLimitsTab = screen.getByText('Rate Limits')
      fireEvent.click(rateLimitsTab)
      
      await waitFor(() => {
        expect(screen.getByText('trading')).toBeInTheDocument()
      })
    })
  })

  describe('Security Metrics', () => {
    it('calculates and displays security metrics correctly', async () => {
      mockUseAdmin.mockReturnValue({
        isAdmin: true,
        adminRole: 'super_admin',
        isLoading: false,
        hasPermission: vi.fn().mockReturnValue(true),
        checkAdminStatus: vi.fn()
      })

      const recentEvents = [
        {
          id: '1',
          action: 'login_failed',
          resource: 'auth',
          details: {},
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          action: 'suspicious_activity',
          resource: 'api',
          details: {},
          created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
        }
      ]

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: recentEvents, error: null })
          })
        })
      })

      render(<SecurityDashboard />)
      
      const overviewTab = screen.getByText('Overview')
      fireEvent.click(overviewTab)
      
      await waitFor(() => {
        expect(screen.getByText('Security Events (24h)')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // Only one event in last 24h
      })
    })
  })
})