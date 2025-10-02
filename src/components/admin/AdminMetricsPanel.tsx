import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminSystem } from "@/hooks/useAdminSystem"
import { Users, Activity, DollarSign, TrendingUp, ShoppingCart, UserPlus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminMetricsPanel() {
  const { metrics, isLoading } = useAdminSystem()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const metricsData = [
    {
      title: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Users",
      value: metrics.activeUsers.toLocaleString(),
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-purple-500"
    },
    {
      title: "Total Volume",
      value: `$${(metrics.totalVolume / 1000000).toFixed(2)}M`,
      icon: TrendingUp,
      color: "text-orange-500"
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-500"
    },
    {
      title: "New Users Today",
      value: metrics.newUsersToday.toLocaleString(),
      icon: UserPlus,
      color: "text-cyan-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`h-4 w-4 ${metric.color}`} />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}