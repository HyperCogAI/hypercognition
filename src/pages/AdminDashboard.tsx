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

const AdminDashboard = () => {
  const { isAdmin, isLoading, adminRole } = useAdmin()

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

  const metrics = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Traders",
      value: "1,253",
      change: "+8%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Total Volume",
      value: "$2.4M",
      change: "+23%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Platform Revenue",
      value: "$48K",
      change: "+15%",
      icon: BarChart3,
      trend: "up"
    }
  ]

  const alerts = [
    {
      type: "warning",
      message: "High trading volume detected on AI-TRADE agent",
      time: "2 minutes ago"
    },
    {
      type: "info",
      message: "New agent listing pending approval: QUANTUM-BOT",
      time: "15 minutes ago"
    },
    {
      type: "error",
      message: "System maintenance required for exchange API",
      time: "1 hour ago"
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
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
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-500" />
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