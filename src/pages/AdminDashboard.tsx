import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Shield,
  Activity,
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import { Navigate } from 'react-router-dom'
import { RealAdminService } from '../services/RealAdminService'

const AdminDashboard = () => {
  const { isAdmin, isLoading, adminRole } = useAdmin()
  const [metrics, setMetrics] = React.useState([
    {
      title: "Total Users",
      value: "...",
      change: "...",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Traders", 
      value: "...",
      change: "...",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Total Volume",
      value: "...",
      change: "...",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Platform Revenue",
      value: "...",
      change: "...",
      icon: BarChart3,
      trend: "up"
    }
  ])
  const [alerts, setAlerts] = React.useState<any[]>([])

  React.useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const loadAdminData = async () => {
    try {
      const [adminMetrics, adminAlerts] = await Promise.all([
        RealAdminService.getAdminMetrics(),
        RealAdminService.getSystemAlerts()
      ])

      setMetrics([
        {
          title: "Total Users",
          value: adminMetrics.total_users.toString(),
          change: `+${adminMetrics.users_growth}%`,
          icon: Users,
          trend: "up"
        },
        {
          title: "Active Traders",
          value: adminMetrics.active_traders.toString(),
          change: `+${adminMetrics.trading_growth}%`,
          icon: TrendingUp,
          trend: "up"
        },
        {
          title: "Total Volume",
          value: `$${(adminMetrics.total_volume / 1000000).toFixed(1)}M`,
          change: `+${adminMetrics.volume_growth}%`,
          icon: DollarSign,
          trend: "up"
        },
        {
          title: "Platform Revenue",
          value: `$${(adminMetrics.platform_revenue / 1000).toFixed(0)}K`,
          change: `+${adminMetrics.revenue_growth}%`,
          icon: BarChart3,
          trend: "up"
        }
      ])

      setAlerts(adminAlerts.map(alert => ({
        type: alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info',
        message: alert.description,
        time: new Date(alert.created_at).toLocaleString()
      })))
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Admin{" "}
            <span className="text-white">
              Dashboard
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, manage your HyperCognition platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {adminRole?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                  {' '}from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="h-20 flex flex-col gap-2">
          <Users className="h-6 w-6" />
          <span>Manage Users</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <MessageSquare className="h-6 w-6" />
          <span>Content Moderation</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <TrendingUp className="h-6 w-6" />
          <span>Agent Management</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col gap-2">
          <Activity className="h-6 w-6" />
          <span>System Health</span>
        </Button>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'error' ? 'bg-red-500' : 
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">New agent "AI-PROPHET" listed</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">127 new user registrations</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">$50K trading volume milestone reached</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard