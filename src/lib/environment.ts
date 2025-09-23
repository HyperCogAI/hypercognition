// Environment configuration and feature flags
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production'
  API_BASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  ENABLE_ANALYTICS: boolean
  ENABLE_ERROR_TRACKING: boolean
  ENABLE_PERFORMANCE_MONITORING: boolean
  ENABLE_DEBUG_LOGGING: boolean
  RATE_LIMIT_ENABLED: boolean
  CACHE_ENABLED: boolean
  REAL_TIME_ENABLED: boolean
  MAINTENANCE_MODE: boolean
}

// Feature flags
interface FeatureFlags {
  ADVANCED_TRADING: boolean
  SOCIAL_FEATURES: boolean
  MOBILE_FEATURES: boolean
  NOTIFICATIONS: boolean
  ANALYTICS_DASHBOARD: boolean
  USER_PROFILES: boolean
  DARK_MODE: boolean
  EXPERIMENTAL_FEATURES: boolean
}

class EnvironmentManager {
  private config: EnvironmentConfig
  private features: FeatureFlags
  
  constructor() {
    this.config = this.loadConfig()
    this.features = this.loadFeatureFlags()
  }
  
  private loadConfig(): EnvironmentConfig {
    return {
      NODE_ENV: (import.meta.env.MODE as any) || 'development',
      API_BASE_URL: window.location.origin,
      SUPABASE_URL: 'https://xdinlkmqmjlrmunsjswf.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM',
      ENABLE_ANALYTICS: true,
      ENABLE_ERROR_TRACKING: true,
      ENABLE_PERFORMANCE_MONITORING: true,
      ENABLE_DEBUG_LOGGING: import.meta.env.MODE === 'development',
      RATE_LIMIT_ENABLED: true,
      CACHE_ENABLED: true,
      REAL_TIME_ENABLED: true,
      MAINTENANCE_MODE: false
    }
  }
  
  private loadFeatureFlags(): FeatureFlags {
    return {
      ADVANCED_TRADING: true,
      SOCIAL_FEATURES: true,
      MOBILE_FEATURES: true,
      NOTIFICATIONS: true,
      ANALYTICS_DASHBOARD: true,
      USER_PROFILES: true,
      DARK_MODE: true,
      EXPERIMENTAL_FEATURES: import.meta.env.MODE === 'development'
    }
  }
  
  
  getConfig(): EnvironmentConfig {
    return { ...this.config }
  }
  
  getFeatureFlags(): FeatureFlags {
    return { ...this.features }
  }
  
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.features[feature]
  }
  
  isProduction(): boolean {
    return this.config.NODE_ENV === 'production'
  }
  
  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development'
  }
  
  isStaging(): boolean {
    return this.config.NODE_ENV === 'staging'
  }
  
  isMaintenanceMode(): boolean {
    return this.config.MAINTENANCE_MODE
  }
  
  updateFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
    this.features[feature] = enabled
    // In a real app, this would sync with a backend service
    localStorage.setItem('feature_flags', JSON.stringify(this.features))
  }
}

export const environment = new EnvironmentManager()

// Environment-aware console logging
class Logger {
  private config = environment.getConfig()
  
  debug(...args: any[]) {
    if (this.config.ENABLE_DEBUG_LOGGING) {
      console.debug('[DEBUG]', ...args)
    }
  }
  
  info(...args: any[]) {
    console.info('[INFO]', ...args)
  }
  
  warn(...args: any[]) {
    console.warn('[WARN]', ...args)
  }
  
  error(...args: any[]) {
    console.error('[ERROR]', ...args)
    if (this.config.ENABLE_ERROR_TRACKING) {
      const { errorTracker } = require('./monitoring')
      errorTracker.captureError(new Error(args.join(' ')), {
        severity: 'medium',
        tags: ['logger']
      })
    }
  }
  
  performance(name: string, value: number) {
    if (this.config.ENABLE_PERFORMANCE_MONITORING) {
      const { performanceMonitor } = require('./monitoring')
      performanceMonitor.recordMetric(name, value, { source: 'logger' })
    }
  }
}

export const logger = new Logger()

// Environment hooks
import { useState, useEffect } from 'react'

export const useEnvironment = () => {
  const [config] = useState(() => environment.getConfig())
  const [features] = useState(() => environment.getFeatureFlags())
  
  return {
    config,
    features,
    isProduction: environment.isProduction(),
    isDevelopment: environment.isDevelopment(),
    isFeatureEnabled: environment.isFeatureEnabled.bind(environment),
    isMaintenanceMode: environment.isMaintenanceMode()
  }
}

export const useFeatureFlag = (feature: keyof FeatureFlags) => {
  const [enabled, setEnabled] = useState(() => environment.isFeatureEnabled(feature))
  
  const toggle = (newValue?: boolean) => {
    const value = newValue !== undefined ? newValue : !enabled
    environment.updateFeatureFlag(feature, value)
    setEnabled(value)
  }
  
  return [enabled, toggle] as const
}