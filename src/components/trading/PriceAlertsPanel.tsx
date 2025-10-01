import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useCryptoPriceAlerts } from "@/hooks/useCryptoPriceAlerts"
import { Bell, BellOff, Trash2, Check, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export const PriceAlertsPanel = () => {
  const { alerts, isLoading, deleteAlert, toggleAlert } = useCryptoPriceAlerts()

  const formatAlertType = (type: string) => {
    switch (type) {
      case "price_above":
        return "Price Above"
      case "price_below":
        return "Price Below"
      case "percent_change":
        return "% Change"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Price Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Price Alerts
          </CardTitle>
          <CardDescription>Get notified when prices hit your targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No price alerts set</p>
            <p className="text-sm mt-1">Create alerts from your watchlist</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeAlerts = alerts.filter(a => a.is_active && !a.is_triggered)
  const triggeredAlerts = alerts.filter(a => a.is_triggered)
  const inactiveAlerts = alerts.filter(a => !a.is_active && !a.is_triggered)

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Price Alerts
          <Badge>{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          {activeAlerts.length} active, {triggeredAlerts.length} triggered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Active Alerts</div>
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{alert.crypto_name}</div>
                      <Badge variant="outline" className="text-xs">
                        {formatAlertType(alert.alert_type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Target: {alert.alert_type === "percent_change" ? `${alert.target_value}%` : `$${alert.target_value}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {format(new Date(alert.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Triggered Alerts</div>
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <div className="font-semibold">{alert.crypto_name}</div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Triggered
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatAlertType(alert.alert_type)}: {alert.alert_type === "percent_change" ? `${alert.target_value}%` : `$${alert.target_value}`}
                    </div>
                    {alert.triggered_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Triggered {format(new Date(alert.triggered_at), "MMM d, yyyy h:mm a")}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Inactive Alerts */}
          {inactiveAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Inactive Alerts</div>
              {inactiveAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/20 opacity-60"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BellOff className="h-4 w-4" />
                      <div className="font-semibold">{alert.crypto_name}</div>
                      <Badge variant="outline" className="text-xs">
                        {formatAlertType(alert.alert_type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Target: {alert.alert_type === "percent_change" ? `${alert.target_value}%` : `$${alert.target_value}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}