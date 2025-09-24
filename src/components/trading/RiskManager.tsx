import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Shield, AlertTriangle, TrendingDown, Target, Settings, Activity } from 'lucide-react'

interface RiskLimits {
  maxPositionSize: number
  maxDailyLoss: number
  maxDrawdown: number
  maxLeverage: number
  stopLossRequired: boolean
  takeProfitRequired: boolean
  maxOpenPositions: number
  riskPerTrade: number
}

interface RiskMetrics {
  currentDrawdown: number
  dailyPnL: number
  weeklyPnL: number
  monthlyPnL: number
  currentExposure: number
  activePositions: number
  riskScore: number
  volatilityScore: number
}

interface RiskAlert {
  id: string
  type: 'warning' | 'critical'
  message: string
  timestamp: Date
  action?: string
}

export const RiskManager: React.FC = () => {
  const [riskLimits, setRiskLimits] = useState<RiskLimits>({
    maxPositionSize: 10000,
    maxDailyLoss: 500,
    maxDrawdown: 20,
    maxLeverage: 5,
    stopLossRequired: true,
    takeProfitRequired: false,
    maxOpenPositions: 10,
    riskPerTrade: 2
  })

  const [metrics, setMetrics] = useState<RiskMetrics>({
    currentDrawdown: -5.2,
    dailyPnL: -150,
    weeklyPnL: 420,
    monthlyPnL: 1250,
    currentExposure: 45000,
    activePositions: 7,
    riskScore: 6.5,
    volatilityScore: 7.2
  })

  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [autoStopEnabled, setAutoStopEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Generate risk alerts based on current metrics
    const newAlerts: RiskAlert[] = []

    if (Math.abs(metrics.dailyPnL) > riskLimits.maxDailyLoss * 0.8) {
      newAlerts.push({
        id: '1',
        type: 'warning',
        message: 'Approaching daily loss limit',
        timestamp: new Date(),
        action: 'Consider reducing position sizes'
      })
    }

    if (Math.abs(metrics.currentDrawdown) > riskLimits.maxDrawdown * 0.7) {
      newAlerts.push({
        id: '2',
        type: 'critical',
        message: 'High drawdown detected',
        timestamp: new Date(),
        action: 'Review risk management strategy'
      })
    }

    if (metrics.activePositions > riskLimits.maxOpenPositions * 0.9) {
      newAlerts.push({
        id: '3',
        type: 'warning',
        message: 'Too many open positions',
        timestamp: new Date(),
        action: 'Close some positions to reduce risk'
      })
    }

    setAlerts(newAlerts)
  }, [metrics, riskLimits])

  const updateRiskLimit = (key: keyof RiskLimits, value: any) => {
    setRiskLimits(prev => ({ ...prev, [key]: value }))
    toast({
      title: "Risk Limit Updated",
      description: `${key} has been updated`,
    })
  }

  const emergencyStop = () => {
    toast({
      title: "Emergency Stop Activated",
      description: "All open positions will be closed",
      variant: "destructive"
    })
  }

  const getRiskLevelColor = (score: number) => {
    if (score <= 3) return 'text-success'
    if (score <= 6) return 'text-warning'
    return 'text-destructive'
  }

  const getRiskLevelBadge = (score: number) => {
    if (score <= 3) return <Badge className="bg-success text-success-foreground">Low Risk</Badge>
    if (score <= 6) return <Badge variant="secondary">Medium Risk</Badge>
    return <Badge variant="destructive">High Risk</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>
            <div className={`text-2xl font-bold ${getRiskLevelColor(metrics.riskScore)}`}>
              {metrics.riskScore}/10
            </div>
            {getRiskLevelBadge(metrics.riskScore)}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Drawdown</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {metrics.currentDrawdown}%
            </div>
            <Progress 
              value={Math.abs(metrics.currentDrawdown)} 
              max={riskLimits.maxDrawdown}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Daily P&L</span>
            </div>
            <div className={`text-2xl font-bold ${metrics.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${metrics.dailyPnL}
            </div>
            <div className="text-sm text-muted-foreground">
              Limit: ${riskLimits.maxDailyLoss}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Open Positions</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.activePositions}/{riskLimits.maxOpenPositions}
            </div>
            <Progress 
              value={(metrics.activePositions / riskLimits.maxOpenPositions) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{alert.message}</strong>
                    {alert.action && <div className="text-sm mt-1">{alert.action}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="limits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="limits">Risk Limits</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Limits</CardTitle>
                <CardDescription>Control position sizing and exposure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxPosition">Max Position Size ($)</Label>
                  <Input
                    id="maxPosition"
                    type="number"
                    value={riskLimits.maxPositionSize}
                    onChange={(e) => updateRiskLimit('maxPositionSize', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxPositions">Max Open Positions</Label>
                  <Input
                    id="maxPositions"
                    type="number"
                    value={riskLimits.maxOpenPositions}
                    onChange={(e) => updateRiskLimit('maxOpenPositions', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxLeverage">Max Leverage</Label>
                  <Input
                    id="maxLeverage"
                    type="number"
                    value={riskLimits.maxLeverage}
                    onChange={(e) => updateRiskLimit('maxLeverage', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="riskPerTrade">Risk Per Trade (%)</Label>
                  <Input
                    id="riskPerTrade"
                    type="number"
                    value={riskLimits.riskPerTrade}
                    onChange={(e) => updateRiskLimit('riskPerTrade', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loss Limits</CardTitle>
                <CardDescription>Protect against excessive losses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxDailyLoss">Max Daily Loss ($)</Label>
                  <Input
                    id="maxDailyLoss"
                    type="number"
                    value={riskLimits.maxDailyLoss}
                    onChange={(e) => updateRiskLimit('maxDailyLoss', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxDrawdown">Max Drawdown (%)</Label>
                  <Input
                    id="maxDrawdown"
                    type="number"
                    value={riskLimits.maxDrawdown}
                    onChange={(e) => updateRiskLimit('maxDrawdown', parseFloat(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Stop Loss</Label>
                    <p className="text-xs text-muted-foreground">
                      All positions must have stop loss
                    </p>
                  </div>
                  <Switch
                    checked={riskLimits.stopLossRequired}
                    onCheckedChange={(checked) => updateRiskLimit('stopLossRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Take Profit</Label>
                    <p className="text-xs text-muted-foreground">
                      All positions must have take profit
                    </p>
                  </div>
                  <Switch
                    checked={riskLimits.takeProfitRequired}
                    onCheckedChange={(checked) => updateRiskLimit('takeProfitRequired', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Risk Monitoring</CardTitle>
              <CardDescription>Real-time risk metrics and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Daily P&L:</span>
                      <span className={metrics.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}>
                        ${metrics.dailyPnL}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly P&L:</span>
                      <span className={metrics.weeklyPnL >= 0 ? 'text-success' : 'text-destructive'}>
                        ${metrics.weeklyPnL}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly P&L:</span>
                      <span className={metrics.monthlyPnL >= 0 ? 'text-success' : 'text-destructive'}>
                        ${metrics.monthlyPnL}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Exposure:</span>
                      <span>${metrics.currentExposure.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Risk Scores</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Overall Risk:</span>
                        <span>{metrics.riskScore}/10</span>
                      </div>
                      <Progress value={metrics.riskScore * 10} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Volatility:</span>
                        <span>{metrics.volatilityScore}/10</span>
                      </div>
                      <Progress value={metrics.volatilityScore * 10} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Drawdown:</span>
                        <span>{Math.abs(metrics.currentDrawdown)}%</span>
                      </div>
                      <Progress 
                        value={Math.abs(metrics.currentDrawdown)} 
                        max={riskLimits.maxDrawdown}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Controls</CardTitle>
              <CardDescription>Emergency stop and auto-protection features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Stop Trading</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically stop trading when risk limits are breached
                  </p>
                </div>
                <Switch
                  checked={autoStopEnabled}
                  onCheckedChange={setAutoStopEnabled}
                />
              </div>

              <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                <h4 className="font-medium text-destructive mb-2">Emergency Stop</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will immediately close all open positions and stop all trading activities.
                  Use only in emergency situations.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={emergencyStop}
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Stop All Trading
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}