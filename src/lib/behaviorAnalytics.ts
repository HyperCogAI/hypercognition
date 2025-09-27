// User behavior analysis and A/B testing
import { analytics } from './analytics'
interface ABTest {
  id: string
  name: string
  variants: string[]
  weights: number[]
  active: boolean
  startDate: Date
  endDate?: Date
}

interface UserVariant {
  testId: string
  variant: string
  assignedAt: Date
}

class ABTestingEngine {
  private tests: Map<string, ABTest> = new Map()
  private userVariants: Map<string, UserVariant> = new Map()
  
  createTest(test: Omit<ABTest, 'id'>): string {
    const id = `test_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`
    const fullTest: ABTest = {
      id,
      ...test
    }
    
    this.tests.set(id, fullTest)
    return id
  }
  
  getVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId)
    if (!test || !test.active) return null
    
    // Check if user already has a variant assigned
    const existingVariant = this.userVariants.get(`${testId}_${userId}`)
    if (existingVariant) {
      return existingVariant.variant
    }
    
    // Assign variant based on user ID hash and weights
    const hash = this.hashUserId(userId, testId)
    const variant = this.selectVariant(test.variants, test.weights, hash)
    
    // Store assignment
    this.userVariants.set(`${testId}_${userId}`, {
      testId,
      variant,
      assignedAt: new Date()
    })
    
    // Track assignment
    analytics.track('ab_test_assigned', {
      testId,
      variant,
      userId
    })
    
    return variant
  }
  
  private hashUserId(userId: string, testId: string): number {
    const combined = `${userId}_${testId}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
  
  private selectVariant(variants: string[], weights: number[], hash: number): string {
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    const normalized = hash % total
    
    let cumulative = 0
    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i]
      if (normalized < cumulative) {
        return variants[i]
      }
    }
    
    return variants[0] // Fallback
  }
  
  trackConversion(testId: string, userId: string, conversionType: string, value?: number) {
    const variant = this.userVariants.get(`${testId}_${userId}`)
    if (!variant) return
    
    analytics.track('ab_test_conversion', {
      testId,
      variant: variant.variant,
      conversionType,
      value,
      userId
    })
  }
  
  getTestResults(testId: string) {
    const test = this.tests.get(testId)
    if (!test) return null
    
    // In a real implementation, this would query the analytics data
    // For now, return mock data structure
    return {
      test,
      participants: 0,
      conversions: 0,
      conversionRate: 0,
      variantResults: test.variants.map(variant => ({
        variant,
        participants: 0,
        conversions: 0,
        conversionRate: 0
      }))
    }
  }
}

export const abTesting = new ABTestingEngine()

// Behavioral analytics
class BehaviorAnalyzer {
  private interactions: Array<{
    type: string
    element: string
    timestamp: Date
    properties?: Record<string, any>
  }> = []
  
  trackInteraction(type: string, element: string, properties?: Record<string, any>) {
    this.interactions.push({
      type,
      element,
      timestamp: new Date(),
      properties
    })
    
    // Analyze patterns
    this.analyzePatterns()
  }
  
  private analyzePatterns() {
    // Detect rapid clicking (possible frustration)
    const recentClicks = this.interactions
      .filter(i => i.type === 'click' && Date.now() - i.timestamp.getTime() < 5000)
    
    if (recentClicks.length > 5) {
      analytics.track('user_behavior_rapid_clicking', {
        clickCount: recentClicks.length,
        timespan: 5000
      })
    }
    
    // Detect long idle periods
    const lastInteraction = this.interactions[this.interactions.length - 1]
    if (lastInteraction && Date.now() - lastInteraction.timestamp.getTime() > 60000) {
      analytics.track('user_behavior_idle', {
        idleDuration: Date.now() - lastInteraction.timestamp.getTime()
      })
    }
  }
  
  getEngagementScore(): number {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    
    const recentInteractions = this.interactions.filter(
      i => i.timestamp.getTime() > oneHourAgo
    )
    
    // Simple engagement score based on interaction frequency and variety
    const frequency = recentInteractions.length
    const variety = new Set(recentInteractions.map(i => i.type)).size
    
    return Math.min(100, (frequency * variety) / 10)
  }
  
  getUserJourney(): Array<{ page: string; timestamp: Date; duration?: number }> {
    const pageViews = this.interactions.filter(i => i.type === 'page_view')
    
    return pageViews.map((view, index) => ({
      page: view.properties?.page || 'unknown',
      timestamp: view.timestamp,
      duration: index < pageViews.length - 1 
        ? pageViews[index + 1].timestamp.getTime() - view.timestamp.getTime()
        : undefined
    }))
  }
}

export const behaviorAnalyzer = new BehaviorAnalyzer()

// Feature usage analytics
class FeatureAnalytics {
  private featureUsage: Map<string, {
    uses: number
    users: Set<string>
    lastUsed: Date
    avgDuration: number
  }> = new Map()
  
  trackFeatureUse(feature: string, userId: string, duration?: number) {
    const current = this.featureUsage.get(feature) || {
      uses: 0,
      users: new Set(),
      lastUsed: new Date(),
      avgDuration: 0
    }
    
    current.uses++
    current.users.add(userId)
    current.lastUsed = new Date()
    
    if (duration) {
      current.avgDuration = (current.avgDuration + duration) / 2
    }
    
    this.featureUsage.set(feature, current)
    
    analytics.track('feature_used', {
      feature,
      userId,
      duration
    })
  }
  
  getFeatureStats() {
    const stats: Record<string, any> = {}
    
    for (const [feature, data] of this.featureUsage.entries()) {
      stats[feature] = {
        totalUses: data.uses,
        uniqueUsers: data.users.size,
        lastUsed: data.lastUsed,
        avgDuration: data.avgDuration
      }
    }
    
    return stats
  }
  
  getMostUsedFeatures(limit = 10) {
    return Array.from(this.featureUsage.entries())
      .sort(([, a], [, b]) => b.uses - a.uses)
      .slice(0, limit)
      .map(([feature, data]) => ({
        feature,
        uses: data.uses,
        users: data.users.size
      }))
  }
}

export const featureAnalytics = new FeatureAnalytics()

// Analytics dashboard data provider
export const analyticsDashboard = {
  getRealTimeStats: () => ({
    activeUsers: 1, // Would be calculated from active sessions
    pageViews: analytics.getEvents({ name: 'page_view', since: new Date(Date.now() - 86400000) }).length,
    events: analytics.getEvents({ since: new Date(Date.now() - 86400000) }).length,
    averageSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 }
  }),
  
  getUserInsights: (userId: string) => ({
    totalSessions: 0,
    totalPageViews: 0,
    averageSessionDuration: 0,
    mostVisitedPages: [],
    featureUsage: featureAnalytics.getFeatureStats(),
    engagementScore: behaviorAnalyzer.getEngagementScore(),
    userJourney: behaviorAnalyzer.getUserJourney()
  }),
  
  getBusinessMetrics: () => ({
    totalTrades: analytics.getEvents({ name: 'business_event' }).filter(e => e.properties?.event === 'trade_executed').length,
    totalVolume: 0,
    activeTraders: 0,
    conversionRate: 0,
    popularAgents: [],
    revenueMetrics: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  })
}