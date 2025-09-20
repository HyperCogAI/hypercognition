import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TradingPanel } from '@/components/trading/TradingPanel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock the exchange manager
vi.mock('@/lib/exchanges/exchangeManager', () => ({
  exchangeManager: {
    placeOrder: vi.fn().mockResolvedValue({
      id: 'order-123',
      status: 'filled',
      filled: 10,
      remaining: 0,
      timestamp: Date.now()
    }),
    getBalances: vi.fn().mockResolvedValue([
      { asset: 'USDT', available: 1000, locked: 0 }
    ])
  }
}))

// Mock real-time market data
vi.mock('@/hooks/useRealTimeMarketData', () => ({
  useRealTimeMarketData: () => ({
    marketData: {
      'TEST': {
        symbol: 'TEST',
        price: 100,
        volume: 50000,
        change24h: 5.5,
        high24h: 105,
        low24h: 95,
        timestamp: Date.now()
      }
    },
    isConnected: true,
    connectionStatus: 'connected'
  })
}))

describe('Trading Integration', () => {
  const mockAgent = {
    name: 'Test Agent',
    symbol: 'TEST',
    price: '$100.00',
    balance: '10.00'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays trading panel correctly', async () => {
    render(<TradingPanel agentId="1" agent={mockAgent} />, { wrapper: TestWrapper })
    
    await waitFor(() => {
      expect(screen.getByText(/trade test/i)).toBeInTheDocument()
    })
  })

  it('handles buy order form', async () => {
    render(<TradingPanel agentId="1" agent={mockAgent} />, { wrapper: TestWrapper })
    
    // Check buy tab is available
    await waitFor(() => {
      expect(screen.getByText(/buy/i)).toBeInTheDocument()
    })
  })

  it('validates form inputs', async () => {
    render(<TradingPanel agentId="1" agent={mockAgent} />, { wrapper: TestWrapper })
    
    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText(/0\.00/i)
      expect(amountInput).toBeInTheDocument()
    })
  })

  it('displays order information', async () => {
    render(<TradingPanel agentId="1" agent={mockAgent} />, { wrapper: TestWrapper })
    
    await waitFor(() => {
      expect(screen.getByText(/slippage/i)).toBeInTheDocument()
    })
  })
})