import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'

export interface SystemMetrics {
  id: string
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_io: number
  active_connections: number
  database_connections: number
  response_time_avg: number
  error_rate: number
  throughput_rps: number
}

export interface Alert {
  id: string
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'error_rate' | 'response_time'
  severity: 'info' | 'warning' | 'critical'
  message: string
  value: number
  threshold: number
  created_at: string
  resolved_at?: string
  status: 'active' | 'resolved' | 'acknowledged'
}

export interface MonitoringDashboard {
  current_metrics: SystemMetrics
  alerts: Alert[]
  performance_trends: {
    cpu_trend: 'up' | 'down' | 'stable'
    memory_trend: 'up' | 'down' | 'stable'
    response_time_trend: 'up' | 'down' | 'stable'
  }
  health_score: number
}

export class RealTimeMonitoringService {
  private static alerts: Alert[] = []
  private static subscribers: ((data: any) => void)[] = []

  static async getCurrentMetrics(): Promise<SystemMetrics> {
    try {
      // Simulate real system metrics
      const metrics: SystemMetrics = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        disk_usage: Math.random() * 100,
        network_io: Math.random() * 1000,
        active_connections: Math.floor(Math.random() * 500) + 50,
        database_connections: Math.floor(Math.random() * 50) + 5,
        response_time_avg: Math.random() * 500 + 50,
        error_rate: Math.random() * 5,
        throughput_rps: Math.random() * 1000 + 100
      }

      // Check for alerts
      await this.checkAlertThresholds(metrics)

      structuredLogger.info('System metrics collected', {
        component: 'RealTimeMonitoringService'
      })

      return metrics
    } catch (error) {
      structuredLogger.error('Failed to collect system metrics', {
        component: 'RealTimeMonitoringService'
      })
      throw error
    }
  }

  static async getDashboardData(): Promise<MonitoringDashboard> {
    try {
      const currentMetrics = await this.getCurrentMetrics()
      const historicalMetrics = await this.getHistoricalMetrics(24) // Last 24 hours
      
      const trends = this.calculateTrends(historicalMetrics)
      const healthScore = this.calculateHealthScore(currentMetrics)
      const activeAlerts = this.alerts.filter(a => a.status === 'active')

      return {
        current_metrics: currentMetrics,
        alerts: activeAlerts,
        performance_trends: trends,
        health_score: healthScore
      }
    } catch (error) {
      structuredLogger.error('Failed to get dashboard data', {
        component: 'RealTimeMonitoringService'
      })
      throw error
    }
  }

  static async getHistoricalMetrics(hours: number = 24): Promise<SystemMetrics[]> {
    try {
      // Mock historical data
      const metrics: SystemMetrics[] = []
      const now = Date.now()
      
      for (let i = hours; i > 0; i--) {
        metrics.push({
          id: crypto.randomUUID(),
          timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(),
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_io: Math.random() * 1000,
          active_connections: Math.floor(Math.random() * 500) + 50,
          database_connections: Math.floor(Math.random() * 50) + 5,
          response_time_avg: Math.random() * 500 + 50,
          error_rate: Math.random() * 5,
          throughput_rps: Math.random() * 1000 + 100
        })
      }

      return metrics
    } catch (error) {
      structuredLogger.error('Failed to get historical metrics', {
        component: 'RealTimeMonitoringService'
      })
      return []
    }
  }

  private static async checkAlertThresholds(metrics: SystemMetrics) {
    const thresholds = {
      cpu_usage: 80,
      memory_usage: 85,
      disk_usage: 90,
      response_time_avg: 2000,
      error_rate: 5
    }

    // Check CPU usage
    if (metrics.cpu_usage > thresholds.cpu_usage) {
      await this.createAlert({
        type: 'cpu',
        severity: metrics.cpu_usage > 95 ? 'critical' : 'warning',
        message: `High CPU usage detected: ${metrics.cpu_usage.toFixed(1)}%`,
        value: metrics.cpu_usage,
        threshold: thresholds.cpu_usage
      })
    }

    // Check memory usage
    if (metrics.memory_usage > thresholds.memory_usage) {
      await this.createAlert({
        type: 'memory',
        severity: metrics.memory_usage > 95 ? 'critical' : 'warning',
        message: `High memory usage detected: ${metrics.memory_usage.toFixed(1)}%`,
        value: metrics.memory_usage,
        threshold: thresholds.memory_usage
      })
    }

    // Check disk usage
    if (metrics.disk_usage > thresholds.disk_usage) {
      await this.createAlert({
        type: 'disk',
        severity: metrics.disk_usage > 98 ? 'critical' : 'warning',
        message: `High disk usage detected: ${metrics.disk_usage.toFixed(1)}%`,
        value: metrics.disk_usage,
        threshold: thresholds.disk_usage
      })
    }

    // Check response time
    if (metrics.response_time_avg > thresholds.response_time_avg) {
      await this.createAlert({
        type: 'response_time',
        severity: metrics.response_time_avg > 5000 ? 'critical' : 'warning',
        message: `High response time detected: ${metrics.response_time_avg.toFixed(0)}ms`,
        value: metrics.response_time_avg,
        threshold: thresholds.response_time_avg
      })
    }

    // Check error rate
    if (metrics.error_rate > thresholds.error_rate) {
      await this.createAlert({
        type: 'error_rate',
        severity: metrics.error_rate > 10 ? 'critical' : 'warning',
        message: `High error rate detected: ${metrics.error_rate.toFixed(1)}%`,
        value: metrics.error_rate,
        threshold: thresholds.error_rate
      })
    }
  }

  private static async createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'status'>) {
    const alert: Alert = {
      id: crypto.randomUUID(),
      ...alertData,
      created_at: new Date().toISOString(),
      status: 'active'
    }

    this.alerts.push(alert)

    // Notify subscribers
    this.notifySubscribers({
      type: 'alert_created',
      alert
    })

    structuredLogger.warn('Alert created', {
      component: 'RealTimeMonitoringService'
    })
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'acknowledged'
      
      structuredLogger.info('Alert acknowledged', {
        component: 'RealTimeMonitoringService'
      })
    }
  }

  static async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.resolved_at = new Date().toISOString()
      
      structuredLogger.info('Alert resolved', {
        component: 'RealTimeMonitoringService'
      })
    }
  }

  static async getAlerts(status?: 'active' | 'resolved' | 'acknowledged'): Promise<Alert[]> {
    if (status) {
      return this.alerts.filter(a => a.status === status)
    }
    return this.alerts
  }

  private static calculateTrends(historicalMetrics: SystemMetrics[]) {
    if (historicalMetrics.length < 2) {
      return {
        cpu_trend: 'stable' as const,
        memory_trend: 'stable' as const,
        response_time_trend: 'stable' as const
      }
    }

    const recent = historicalMetrics.slice(-6) // Last 6 hours
    const older = historicalMetrics.slice(0, 6) // First 6 hours

    const recentAvgCpu = recent.reduce((sum, m) => sum + m.cpu_usage, 0) / recent.length
    const olderAvgCpu = older.reduce((sum, m) => sum + m.cpu_usage, 0) / older.length

    const recentAvgMemory = recent.reduce((sum, m) => sum + m.memory_usage, 0) / recent.length
    const olderAvgMemory = older.reduce((sum, m) => sum + m.memory_usage, 0) / older.length

    const recentAvgResponseTime = recent.reduce((sum, m) => sum + m.response_time_avg, 0) / recent.length
    const olderAvgResponseTime = older.reduce((sum, m) => sum + m.response_time_avg, 0) / older.length

    return {
      cpu_trend: recentAvgCpu > olderAvgCpu * 1.1 ? 'up' as const : 
                 recentAvgCpu < olderAvgCpu * 0.9 ? 'down' as const : 'stable' as const,
      memory_trend: recentAvgMemory > olderAvgMemory * 1.1 ? 'up' as const : 
                    recentAvgMemory < olderAvgMemory * 0.9 ? 'down' as const : 'stable' as const,
      response_time_trend: recentAvgResponseTime > olderAvgResponseTime * 1.1 ? 'up' as const : 
                          recentAvgResponseTime < olderAvgResponseTime * 0.9 ? 'down' as const : 'stable' as const
    }
  }

  private static calculateHealthScore(metrics: SystemMetrics): number {
    let score = 100

    // Deduct points for high resource usage
    if (metrics.cpu_usage > 80) score -= (metrics.cpu_usage - 80) * 2
    if (metrics.memory_usage > 80) score -= (metrics.memory_usage - 80) * 2
    if (metrics.disk_usage > 80) score -= (metrics.disk_usage - 80) * 1.5
    if (metrics.response_time_avg > 1000) score -= (metrics.response_time_avg - 1000) / 100
    if (metrics.error_rate > 1) score -= metrics.error_rate * 10

    return Math.max(0, Math.min(100, score))
  }

  static subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback)
    
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private static notifySubscribers(data: any) {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        structuredLogger.error('Error notifying subscriber', {
          component: 'RealTimeMonitoringService'
        })
      }
    })
  }

  static async startRealTimeMonitoring(intervalMs: number = 30000): Promise<void> {
    const collectAndNotify = async () => {
      try {
        const metrics = await this.getCurrentMetrics()
        this.notifySubscribers({
          type: 'metrics_update',
          metrics
        })
      } catch (error) {
        structuredLogger.error('Error in real-time monitoring loop', {
          component: 'RealTimeMonitoringService'
        })
      }
    }

    // Start monitoring loop
    setInterval(collectAndNotify, intervalMs)
    
    structuredLogger.info('Real-time monitoring started', {
      component: 'RealTimeMonitoringService'
    })
  }
}