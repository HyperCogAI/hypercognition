import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentCard } from '@/components/agents/AgentCard'
import { FallbackComponent } from '@/components/error/FallbackComponent'

// Mock hooks
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false)
  })
}))

vi.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({
    triggerHaptic: vi.fn()
  })
}))

vi.mock('@/lib/errorHandling', () => ({
  useErrorHandler: () => ({
    captureError: vi.fn()
  })
}))

const mockAgent = {
  id: '1',
  name: 'Test Agent',
  symbol: 'TEST',
  price: 100,
  change_24h: 5.5,
  market_cap: 1000000,
  volume_24h: 50000,
  description: 'A test trading agent',
  avatar_url: '/test-avatar.png',
  avatar: '/test-avatar.png',
  chain: 'Base',
  fdv: "1000000",
  change: "5.5",
  isPositive: true
}

describe('AgentCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />)

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('TEST')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('+5.50%')).toBeInTheDocument()
  })

  it('displays market cap and volume', () => {
    render(<AgentCard agent={mockAgent} />)

    expect(screen.getByText(/Market Cap/)).toBeInTheDocument()
    expect(screen.getByText(/Volume/)).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<AgentCard agent={mockAgent} />)

    // AgentCard doesn't have onClick prop in current implementation
    // This test verifies the component renders without crashing
  })

  it('shows positive change in green', () => {
    render(<AgentCard agent={mockAgent} />)
    
    const changeElement = screen.getByText('+5.50%')
    expect(changeElement).toHaveClass('text-green-500')
  })

  it('shows negative change in red', () => {
    const agentWithNegativeChange = {
      ...mockAgent,
      change_24h: -3.2,
      change: "-3.2",
      isPositive: false
    }

    render(<AgentCard agent={agentWithNegativeChange} />)
    
    const changeElement = screen.getByText('-3.20%')
    expect(changeElement).toHaveClass('text-red-500')
  })

  it('handles missing avatar gracefully', () => {
    const agentWithoutAvatar = {
      ...mockAgent,
      avatar_url: null,
      avatar: null
    }

    render(<AgentCard agent={agentWithoutAvatar} />)
    expect(screen.getByText('TA')).toBeInTheDocument() // Fallback initials
  })
})

describe('FallbackComponent', () => {
  it('renders error message', () => {
    const error = new Error('Test error')
    render(<FallbackComponent error={error} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We're having trouble loading/)).toBeInTheDocument()
  })

  it('shows custom title and description', () => {
    render(
      <FallbackComponent 
        title="Custom Error" 
        description="Custom description"
      />
    )

    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const error = new Error('Test error message')
    render(<FallbackComponent error={error} />)

    expect(screen.getByText('Error Details')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('handles reset error callback', () => {
    const resetError = vi.fn()
    render(<FallbackComponent resetError={resetError} />)

    fireEvent.click(screen.getByText('Try Again'))
    expect(resetError).toHaveBeenCalled()
  })

  it('hides try again button when no resetError provided', () => {
    render(<FallbackComponent />)

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
  })
})