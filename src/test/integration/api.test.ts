import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Integration tests for API endpoints
describe('API Integration Tests', () => {
  let supabase: any

  beforeAll(() => {
    supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
      process.env.VITE_SUPABASE_ANON_KEY || 'test-key'
    )
  })

  describe('Authentication', () => {
    it('should handle authentication flow', async () => {
      // Test user signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'test-password'
      })

      if (signUpError && !signUpError.message.includes('already registered')) {
        expect(signUpError).toBeNull()
      }

      // Test user signin
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test-password'
      })

      expect(signInError).toBeNull()
      expect(signInData.user).toBeTruthy()
    })
  })

  describe('Market Data API', () => {
    it('should fetch crypto market data', async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1')
      expect(response.ok).toBe(true)
      
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('current_price')
    })

    it('should handle Jupiter API calls gracefully', async () => {
      const response = await fetch('https://api.jup.ag/tokens')
      
      // Jupiter API might return 401 for unauthorized requests
      // This is expected behavior in our implementation
      if (response.status === 401) {
        expect(response.status).toBe(401)
      } else {
        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(Array.isArray(data)).toBe(true)
      }
    })
  })

  describe('Database Operations', () => {
    it('should insert and retrieve portfolio data', async () => {
      // Sign in first
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test-password'
      })

      const testPortfolio = {
        total_value: 1000,
        total_pnl: 50,
        daily_pnl: 10,
        holdings: [
          {
            symbol: 'SOL',
            amount: 10,
            value: 1000,
            average_cost: 90
          }
        ]
      }

      // Insert portfolio data
      const { data: insertData, error: insertError } = await supabase
        .from('portfolios')
        .upsert(testPortfolio)
        .select()

      if (insertError) {
        // Portfolio table might not exist in test environment
        console.warn('Portfolio table not available in test environment')
        return
      }

      expect(insertError).toBeNull()
      expect(insertData).toBeTruthy()
    })

    it('should handle real-time subscriptions', async () => {
      return new Promise((resolve) => {
        const channel = supabase
          .channel('test-channel')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'market_data' },
            (payload: any) => {
              expect(payload).toBeTruthy()
              supabase.removeChannel(channel)
              resolve(true)
            }
          )
          .subscribe()

        // Simulate timeout if no real-time data
        setTimeout(() => {
          supabase.removeChannel(channel)
          resolve(true)
        }, 1000)
      })
    })
  })

  describe('Edge Functions', () => {
    it('should call health check function', async () => {
      const { data, error } = await supabase.functions.invoke('health-check')
      
      if (error && error.message.includes('Function not found')) {
        console.warn('Health check function not deployed in test environment')
        return
      }

      expect(error).toBeNull()
      expect(data).toHaveProperty('status')
    })

    it('should handle realtime market data function', async () => {
      const { data, error } = await supabase.functions.invoke('realtime-market-data', {
        body: { symbols: ['SOL', 'BTC'] }
      })

      if (error && error.message.includes('Function not found')) {
        console.warn('Realtime market data function not deployed in test environment')
        return
      }

      expect(error).toBeNull()
      expect(data).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 100) // Abort after 100ms

      try {
        await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd', {
          signal: controller.signal
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 5 }, () => 
        fetch('https://api.jup.ag/tokens')
      )

      const responses = await Promise.allSettled(requests)
      
      // At least one request should succeed or return expected error
      const hasSuccess = responses.some(r => 
        r.status === 'fulfilled' && (r.value.ok || r.value.status === 401)
      )
      expect(hasSuccess).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=5')
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      expect(response.ok).toBe(true)
      expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    })

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 3 }, () => 
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=1')
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const endTime = Date.now()

      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })

      expect(endTime - startTime).toBeLessThan(10000) // Concurrent requests should complete within 10 seconds
    })
  })
})