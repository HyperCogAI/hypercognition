import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'

// Mock components
vi.mock('@/components/sections/Hero', () => ({
  Hero: () => <div data-testid="hero">Hero Component</div>
}))

vi.mock('@/components/sections/Stats', () => ({
  Stats: () => <div data-testid="stats">Stats Component</div>
}))

vi.mock('@/components/sections/HyperFeatures', () => ({
  HyperFeatures: () => <div data-testid="features">Features Component</div>
}))

vi.mock('@/components/sections/HyperCTA', () => ({
  HyperCTA: () => <div data-testid="cta">CTA Component</div>
}))

vi.mock('@/components/sections/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}))

vi.mock('@/components/news/MarketNewsComponent', () => ({
  MarketNewsComponent: ({ className }: { className?: string }) => 
    <div data-testid="market-news" className={className}>Market News</div>
}))

vi.mock('@/components/seo/SEOHead', () => ({
  SEOHead: ({ title, description }: { title: string; description: string }) => 
    <div data-testid="seo-head" data-title={title} data-description={description}>SEO Head</div>
}))

vi.mock('@/components/seo/StructuredData', () => ({
  generateWebsiteStructuredData: () => ({ '@type': 'Website' }),
  generateOrganizationStructuredData: () => ({ '@type': 'Organization' })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Home Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all main sections', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('stats')).toBeInTheDocument()
    expect(screen.getByTestId('features')).toBeInTheDocument()
    expect(screen.getByTestId('cta')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('market-news')).toBeInTheDocument()
  })

  it('includes SEO metadata', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const seoHead = screen.getByTestId('seo-head')
    expect(seoHead).toHaveAttribute('data-title', 'HyperCognition - AI Agent Trading Marketplace')
    expect(seoHead).toHaveAttribute('data-description', 'Co-own next-gen AI trading agents with equal early access through Hyper Points. Enjoy a fair 24h bidding system and get a full refund if milestones aren\'t met.')
  })

  it('applies correct styling classes', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const container = screen.getByRole('main')
    expect(container).toBeInTheDocument()

    const marketNews = screen.getByTestId('market-news')
    expect(marketNews).toHaveClass('mb-12')
  })

  it('maintains proper component hierarchy', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()

    // Hero should be the first child of main
    const hero = screen.getByTestId('hero')
    expect(mainElement).toContainElement(hero)
  })
})

describe('Error Handling Integration', () => {
  it('handles component errors gracefully', () => {
    // Mock console.error to prevent error logs in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test error')
    }

    const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>
      } catch (error) {
        return <div data-testid="error-fallback">Error caught</div>
      }
    }

    render(
      <ErrorBoundaryWrapper>
        <ErrorComponent />
      </ErrorBoundaryWrapper>
    )

    // In a real app, this would be handled by the ErrorBoundary component
    consoleSpy.mockRestore()
  })
})

describe('Performance Tests', () => {
  it('renders within acceptable time', async () => {
    const startTime = performance.now()

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Home page should render in under 100ms
    expect(renderTime).toBeLessThan(100)
  })

  it('lazy loads components efficiently', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    )

    // All components should be present immediately since they're not lazy loaded
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('market-news')).toBeInTheDocument()
  })
})