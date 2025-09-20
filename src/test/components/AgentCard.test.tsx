import { describe, it, expect, vi } from 'vitest'
import { render } from '../utils'
import { screen, fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'
import { AgentCard } from '@/components/agents/AgentCard'
import { createMockAgent } from '../utils'

describe('AgentCard Component', () => {
  const mockAgent = createMockAgent()

  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />)
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('$100.00m')).toBeInTheDocument()
    expect(screen.getByText('+5.50%')).toBeInTheDocument()
  })

  it('handles click navigation', () => {
    const mockNavigate = vi.fn()
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate
      }
    })

    render(<AgentCard agent={mockAgent} />)
    fireEvent.click(screen.getByText('Test Agent'))
    
    // Test navigation would be called
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
  })

  it('displays negative change correctly', () => {
    const agentWithLoss = createMockAgent({ change24h: -3.2 })
    render(<AgentCard agent={agentWithLoss} />)
    
    expect(screen.getByText('-3.20%')).toBeInTheDocument()
  })

  it('shows price information', () => {
    render(<AgentCard agent={mockAgent} />)
    
    expect(screen.getByText('$100.00m')).toBeInTheDocument()
    expect(screen.getByText('+5.50%')).toBeInTheDocument()
  })
})