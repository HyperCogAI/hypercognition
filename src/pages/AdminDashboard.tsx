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
import { supabase } from '@/integrations/supabase/client'

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
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <p className="text-muted-foreground mt-2">
              You need admin privileges to access this dashboard.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={async () => {
                try {
                  const { error } = await supabase.rpc('make_user_admin')
                  if (error) throw error
                  // Refresh the admin status
                  window.location.reload()
                } catch (error) {
                  console.error('Error making user admin:', error)
                }
              }}
              className="w-full"
            >
              Grant Admin Access (Demo)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This is a demo feature. In production, admin access would be granted by existing administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
          Welcome back, manage your HyperCognition platform with powerful administrative tools
        </p>
        <div className="flex justify-center">
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
            {adminRole?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">{metric.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className={`font-medium ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change}
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button 
          onClick={() => window.open('/admin/users', '_blank')}
          className="h-20 flex flex-col gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
        >
          <Users className="h-6 w-6" />
          <span>Manage Users</span>
        </Button>
        <Button 
          onClick={() => window.open('/admin/content', '_blank')}
          variant="outline" 
          className="h-20 flex flex-col gap-2 border-primary/20 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200"
        >
          <MessageSquare className="h-6 w-6" />
          <span>Content Moderation</span>
        </Button>
        <Button 
          onClick={() => window.open('/marketplace', '_blank')}
          variant="outline" 
          className="h-20 flex flex-col gap-2 border-primary/20 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200"
        >
          <TrendingUp className="h-6 w-6" />
          <span>Agent Management</span>
        </Button>
        <Button 
          onClick={() => window.open('/admin/system', '_blank')}
          variant="outline" 
          className="h-20 flex flex-col gap-2 border-primary/20 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200"
        >
          <Activity className="h-6 w-6" />
          <span>System Health</span>
        </Button>
      </div>

      {/* Additional Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              View Security Logs
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Manage API Keys
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Security Alerts
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics & Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Platform Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Trading Reports
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              User Engagement
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Database Management
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Backup & Recovery
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Environment Variables
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'error' ? 'bg-red-400' : 
                    alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 inline-block mb-3">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-muted-foreground">All systems operational</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">New agent "AI-PROPHET" listed</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">127 new user registrations</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">$50K trading volume milestone reached</p>
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