import { describe, it, expect, vi } from 'vitest'
import { render } from '../utils'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import App from '@/App'

// Mock necessary modules for E2E testing
vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    address: '0x123456789',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn()
  })
}))

vi.mock('@/lib/dataService', () => ({
  DataService: {
    getAgents: vi.fn().mockResolvedValue([
      {
        id: '1',
        name: 'AI Trader Pro',
        symbol: 'AITP',
        price: 150,
        change24h: 8.5,
        marketCap: 5000000,
        volume24h: 100000
      }
    ]),
    getAgentDetail: vi.fn().mockResolvedValue({
      id: '1',
      name: 'AI Trader Pro',
      symbol: 'AITP',
      description: 'Advanced AI trading agent',
      price: 150,
      change24h: 8.5,
      marketCap: 5000000,
      volume24h: 100000
    }),
    getUserPortfolio: vi.fn().mockResolvedValue({
      totalValue: 10000,
      totalPnL: 500,
      holdings: []
    })
  }
}))

describe('User Journey E2E Tests', () => {
  it('complete user trading journey', async () => {
    render(<App />)
    
    // 1. User lands on homepage
    await waitFor(() => {
      expect(screen.getByText(/hypercognition/i)).toBeInTheDocument()
    })
    
    // 2. Browse agent marketplace
    await waitFor(() => {
      expect(screen.getByText(/ai trader pro/i)).toBeInTheDocument()
    })
    
    // 3. Click on an agent to view details
    const agentCard = screen.getByText(/ai trader pro/i)
    fireEvent.click(agentCard)
    
    // 4. View agent details and trading panel
    await waitFor(() => {
      expect(screen.getByText(/trading panel/i)).toBeInTheDocument()
    })
    
    // 5. Wallet connection should be handled automatically
    expect(screen.queryByText(/connect wallet/i)).not.toBeInTheDocument()
    
    // 6. User can place trades (mocked)
    const buyButton = screen.getByRole('button', { name: /buy/i })
    expect(buyButton).toBeInTheDocument()
  })

  it('handles portfolio navigation', async () => {
    render(<App />)
    
    // Navigate to portfolio
    const portfolioLink = screen.getByText(/portfolio/i)
    fireEvent.click(portfolioLink)
    
    await waitFor(() => {
      expect(screen.getByText(/total value/i)).toBeInTheDocument()
    })
  })

  it('handles favorites functionality', async () => {
    render(<App />)
    
    // Navigate to favorites
    const favoritesLink = screen.getByText(/favorites/i)
    fireEvent.click(favoritesLink)
    
    await waitFor(() => {
      expect(screen.getByText(/your favorite agents/i)).toBeInTheDocument()
    })
  })
})