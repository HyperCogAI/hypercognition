// Advanced analytics system
interface AnalyticsEvent {
  id: string
  name: string
  properties?: Record<string, any>
  userId?: string
  sessionId: string
  timestamp: Date
  page?: string
  source?: string
}

interface UserSession {
  id: string
  userId?: string
  startTime: Date
  endTime?: Date
  pageViews: number
  events: number
  referrer?: string
  userAgent: string
  device: 'mobile' | 'tablet' | 'desktop'
}

class AnalyticsEngine {
  private events: AnalyticsEvent[] = []
  private session: UserSession
  private maxEvents = 2000
  private batchSize = 50
  private flushInterval = 30000 // 30 seconds
  
  constructor() {
    this.session = this.createSession()
    this.setupEventListeners()
    this.startPeriodicFlush()
  }
  
  private createSession(): UserSession {
    return {
      id: this.generateSessionId(),
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      device: this.detectDevice()
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
  
  private setupEventListeners() {
    // Page view tracking
    window.addEventListener('popstate', () => {
      this.trackPageView()
    })
    
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.dataset.track) {
        this.track('click', {
          element: target.tagName,
          text: target.textContent?.slice(0, 50),
          trackId: target.dataset.track
        })
      }
    })
    
    // Session end tracking
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })
    
    // Visibility change tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden')
      } else {
        this.track('page_visible')
      }
    })
  }
  
  private startPeriodicFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }
  
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      name: eventName,
      properties,
      sessionId: this.session.id,
      timestamp: new Date(),
      page: window.location.pathname,
      source: 'web'
    }
    
    // Add user ID if available
    try {
      const authUser = localStorage.getItem('auth_user')
      if (authUser) {
        event.userId = JSON.parse(authUser).id
      }
    } catch {
      // Ignore error
    }
    
    this.events.push(event)
    this.session.events++
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
    
    console.log('Analytics event:', event)
  }
  
  trackPageView(page?: string) {
    this.session.pageViews++
    this.track('page_view', {
      page: page || window.location.pathname,
      title: document.title
    })
  }
  
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties
    })
  }
  
  trackBusinessEvent(event: string, properties?: Record<string, any>) {
    this.track('business_event', {
      event,
      ...properties
    })
  }
  
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    })
  }
  
  trackPerformance(metric: string, value: number, context?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...context
    })
  }
  
  setUserId(userId: string) {
    this.session.userId = userId
    this.track('user_identified', { userId })
  }
  
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private endSession() {
    this.session.endTime = new Date()
    this.track('session_end', {
      duration: this.session.endTime.getTime() - this.session.startTime.getTime(),
      pageViews: this.session.pageViews,
      events: this.session.events
    })
    this.flush()
  }
  
  private async flush() {
    if (this.events.length === 0) return
    
    const batch = this.events.splice(0, this.batchSize)
    
    try {
      // In production, send to analytics service
      console.log('Flushing analytics batch:', batch)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error('Failed to flush analytics:', error)
      // Re-add events to queue
      this.events.unshift(...batch)
    }
  }
  
  getEvents(filters?: {
    name?: string
    userId?: string
    since?: Date
    limit?: number
  }): AnalyticsEvent[] {
    let filtered = [...this.events]
    
    if (filters) {
      if (filters.name) {
        filtered = filtered.filter(e => e.name === filters.name)
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId)
      }
      if (filters.since) {
        filtered = filtered.filter(e => e.timestamp >= filters.since!)
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit)
      }
    }
    
    return filtered
  }
  
  getSessionInfo(): UserSession {
    return { ...this.session }
  }
  
  getMetrics() {
    const now = new Date()
    const sessionDuration = now.getTime() - this.session.startTime.getTime()
    
    return {
      sessionDuration,
      pageViews: this.session.pageViews,
      eventsCount: this.session.events,
      device: this.session.device,
      userAgent: this.session.userAgent
    }
  }
}

export const analytics = new AnalyticsEngine()

// Business intelligence functions
export const businessAnalytics = {
  // Trading analytics
  trackTrade: (type: 'buy' | 'sell', agentId: string, amount: number, price: number) => {
    analytics.trackBusinessEvent('trade_executed', {
      type,
      agentId,
      amount,
      price,
      value: amount * price
    })
  },
  
  trackOrderPlaced: (orderType: string, agentId: string, amount: number) => {
    analytics.trackBusinessEvent('order_placed', {
      orderType,
      agentId,
      amount
    })
  },
  
  // Social analytics
  trackRating: (agentId: string, rating: number) => {
    analytics.trackBusinessEvent('agent_rated', {
      agentId,
      rating
    })
  },
  
  trackComment: (agentId: string, commentLength: number) => {
    analytics.trackBusinessEvent('comment_posted', {
      agentId,
      commentLength
    })
  },
  
  // User engagement
  trackAgentView: (agentId: string, timeSpent: number) => {
    analytics.trackBusinessEvent('agent_viewed', {
      agentId,
      timeSpent
    })
  },
  
  trackFeatureUsage: (feature: string, action: string) => {
    analytics.trackBusinessEvent('feature_used', {
      feature,
      action
    })
  },
  
  // Conversion tracking
  trackConversion: (type: string, value?: number) => {
    analytics.trackBusinessEvent('conversion', {
      type,
      value
    })
  },
  
  trackFunnel: (step: string, funnel: string) => {
    analytics.trackBusinessEvent('funnel_step', {
      step,
      funnel
    })
  }
}

// Analytics hooks
import { useEffect, useRef } from 'react'

export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics)
  }
}

export const usePageTracking = (pageName?: string) => {
  useEffect(() => {
    analytics.trackPageView(pageName)
  }, [pageName])
}

export const useTimeTracking = (eventName: string) => {
  const startTime = useRef<number>()
  
  useEffect(() => {
    startTime.current = Date.now()
    
    return () => {
      if (startTime.current) {
        const duration = Date.now() - startTime.current
        analytics.trackPerformance(eventName, duration)
      }
    }
  }, [eventName])
}

export const useClickTracking = () => {
  const trackClick = (element: string, properties?: Record<string, any>) => {
    analytics.trackUserAction('click', {
      element,
      ...properties
    })
  }
  
  return { trackClick }
}