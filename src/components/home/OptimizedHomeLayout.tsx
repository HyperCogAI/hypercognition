import { Suspense, lazy } from 'react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { SEOHead } from '@/components/seo/SEOHead'
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/components/seo/StructuredData'
import { cn } from '@/lib/utils'

// Lazy load components for better performance
const EnhancedHero = lazy(() => import('@/components/sections/EnhancedHero').then(m => ({ default: m.EnhancedHero })))

const HyperFeatures = lazy(() => import('@/components/sections/HyperFeatures').then(m => ({ default: m.HyperFeatures })))
const HyperCTA = lazy(() => import('@/components/sections/HyperCTA').then(m => ({ default: m.HyperCTA })))

const EnhancedMarketNews = lazy(() => import('@/components/news/EnhancedMarketNews'))
const AgentMarketplace = lazy(() => import('@/components/sections/AgentMarketplace').then(m => ({ default: m.AgentMarketplace })))

// Enhanced Loading components with animations
const HeroSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card/50">
    <div className="container mx-auto px-6 text-center space-y-8">
      <div className="animate-fade-in">
        <Skeleton className="h-16 w-3/4 mx-auto skeleton-shimmer" />
      </div>
      <div className="animate-fade-in animate-stagger-1">
        <Skeleton className="h-8 w-1/2 mx-auto skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <EnhancedCard key={i} className={`animate-scale-in animate-stagger-${i + 2}`}>
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-16 mx-auto skeleton-shimmer" />
              <Skeleton className="h-4 w-24 mx-auto skeleton-shimmer" />
            </div>
          </EnhancedCard>
        ))}
      </div>
      <div className="flex gap-4 justify-center animate-fade-in animate-stagger-5">
        <Skeleton className="h-12 w-32 skeleton-shimmer" />
        <Skeleton className="h-12 w-32 skeleton-shimmer" />
      </div>
    </div>
  </div>
)

const MarketNewsSkeleton = () => (
  <EnhancedCard className="w-full animate-scale-in">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3 skeleton-shimmer" />
        <Skeleton className="h-6 w-20 skeleton-shimmer" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex gap-4 animate-fade-in animate-stagger-${i + 1}`}>
            <Skeleton className="h-16 w-16 rounded skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12 skeleton-shimmer" />
                <Skeleton className="h-5 w-16 skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </EnhancedCard>
)

const MarketplaceSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-1/4 skeleton-shimmer" />
      <Skeleton className="h-6 w-24 skeleton-shimmer" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <EnhancedCard key={i} className={`animate-scale-in animate-stagger-${Math.min(i + 1, 6)}`}>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full skeleton-shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 skeleton-shimmer" />
                <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
              </div>
            </div>
            <Skeleton className="h-4 w-full skeleton-shimmer" />
            <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-8 w-16 skeleton-shimmer" />
              <Skeleton className="h-8 w-20 skeleton-shimmer" />
            </div>
          </div>
        </EnhancedCard>
      ))}
    </div>
  </div>
)


const FeaturesSkeleton = () => (
  <section className="py-24 animate-fade-in">
    <div className="container mx-auto px-6 space-y-16">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-1/2 mx-auto skeleton-shimmer" />
        <Skeleton className="h-6 w-2/3 mx-auto skeleton-shimmer" />
      </div>
      
      {/* AI Bot Showcase Skeleton */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 skeleton-shimmer" />
          <Skeleton className="h-10 w-3/4 skeleton-shimmer" />
          <Skeleton className="h-5 w-full skeleton-shimmer" />
          <Skeleton className="h-5 w-5/6 skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <EnhancedCard key={i} className="p-4 animate-scale-in">
                <Skeleton className="h-6 w-20 mb-2 skeleton-shimmer" />
                <Skeleton className="h-8 w-16 mb-1 skeleton-shimmer" />
                <Skeleton className="h-3 w-24 skeleton-shimmer" />
              </EnhancedCard>
            ))}
          </div>
          <Skeleton className="h-12 w-32 skeleton-shimmer" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-80 w-80 rounded-full skeleton-shimmer" />
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <EnhancedCard key={i} className={`p-6 animate-scale-in animate-stagger-${Math.min(i + 1, 6)}`}>
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 skeleton-shimmer" />
              <Skeleton className="h-6 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-4 w-full skeleton-shimmer" />
              <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
              <div className="pt-2">
                <Skeleton className="h-8 w-16 skeleton-shimmer" />
                <Skeleton className="h-3 w-20 skeleton-shimmer" />
              </div>
            </div>
          </EnhancedCard>
        ))}
      </div>
    </div>
  </section>
)

const CTASkeleton = () => (
  <section className="py-16 animate-fade-in">
    <div className="container mx-auto px-6 text-center space-y-8">
      <Skeleton className="h-12 w-1/2 mx-auto skeleton-shimmer" />
      <Skeleton className="h-6 w-2/3 mx-auto skeleton-shimmer" />
      <Skeleton className="h-12 w-32 mx-auto skeleton-shimmer" />
    </div>
  </section>
)


export function OptimizedHomeLayout() {
  const { isMobile, isTablet } = useDeviceDetection()
  const { performanceData } = usePerformanceMonitoring('OptimizedHomeLayout')

  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData()
  ]

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="HyperCognition - AI Agent Trading Marketplace"
        description="Co-own next-gen AI trading agents with equal early access through Hyper Points. Enjoy a fair 24h bidding system and get a full refund if milestones aren't met."
        keywords="AI trading agents, autonomous trading, cryptocurrency, DeFi, blockchain, trading bots, AI marketplace, HyperCognition"
        structuredData={structuredData}
      />
      
      <main className="space-y-4 md:space-y-6 lg:space-y-8">
        {/* Hero Section with Priority Loading */}
        <Suspense fallback={<HeroSkeleton />}>
          <EnhancedHero />
        </Suspense>

        {/* Market News Section */}
        <section className={cn(
          "container mx-auto px-6 md:px-8 lg:px-12",
          isMobile && "px-4"
        )}>
          <Suspense fallback={<MarketNewsSkeleton />}>
            <EnhancedMarketNews />
          </Suspense>
        </section>

        {/* Agent Marketplace Section */}
        <section id="marketplace" className={cn(
          "scroll-mt-16 container mx-auto px-6 md:px-8 lg:px-12",
          isMobile && "px-4 scroll-mt-24"
        )}>
          <Suspense fallback={<MarketplaceSkeleton />}>
            <AgentMarketplace />
          </Suspense>
        </section>

        {/* Features Section */}
        <Suspense fallback={<FeaturesSkeleton />}>
          <HyperFeatures />
        </Suspense>

        {/* CTA Section */}
        <Suspense fallback={<CTASkeleton />}>
          <HyperCTA />
        </Suspense>
      </main>


    </div>
  )
}