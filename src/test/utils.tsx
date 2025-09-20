import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Test data factories
export const createMockAgent = (overrides = {}) => ({
  id: '1',
  name: 'Test Agent',
  symbol: 'TEST',
  avatar: '/test-avatar.png',
  fdv: '$100.00m',
  change: '+5.50%',
  chain: 'ethereum',
  isPositive: true,
  description: 'A test trading agent',
  price: 100,
  change24h: 5.5,
  marketCap: 1000000,
  volume24h: 50000,
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  wallet_address: '0x123...456',
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockPortfolio = (overrides = {}) => ({
  totalValue: 10000,
  totalPnL: 500,
  totalPnLPercentage: 5.0,
  holdings: [
    {
      agent_id: '1',
      quantity: 10,
      averagePrice: 95,
      currentValue: 1000,
      pnl: 50,
      pnlPercentage: 5.26
    }
  ],
  transactions: [
    {
      id: 'tx-1',
      type: 'buy',
      agent_id: '1',
      quantity: 10,
      price: 95,
      timestamp: new Date().toISOString()
    }
  ],
  ...overrides
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { userEvent } from '@testing-library/user-event'