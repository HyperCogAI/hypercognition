import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics'
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Zap, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface OptimizationStrategy {
  id: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  expectedReturn: number
  maxVolatility: number
}

const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'conservative',
    name: 'Conservative Growth',
    description: 'Low risk, steady returns with minimal volatility',
    riskLevel: 'low',
    expectedReturn: 8,
    maxVolatility: 15
  },
  {
    id: 'balanced',
    name: 'Balanced Portfolio',
    description: 'Moderate risk with balanced growth potential',
    riskLevel: 'medium',
    expectedReturn: 15,
    maxVolatility: 25
  },
  {
    id: 'aggressive',
    name: 'Aggressive Growth',
    description: 'High risk, high reward with maximum growth potential',
    riskLevel: 'high',
    expectedReturn: 25,
    maxVolatility: 40
  },
  {
    id: 'custom',
    name: 'Custom Strategy',
    description: 'Define your own risk and return parameters',
    riskLevel: 'medium',
    expectedReturn: 20,
    maxVolatility: 30
  }
]

export function PortfolioOptimizer() {
  const { holdings, portfolioMetrics, assetAllocation } = usePortfolioAnalytics()
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced')
  const [customRiskTolerance, setCustomRiskTolerance] = useState([50])
  const [customReturnTarget, setCustomReturnTarget] = useState([15])
  const [optimizationLoading, setOptimizationLoading] = useState(false)
  const [optimizedAllocation, setOptimizedAllocation] = useState<any[]>([])

  const strategy = OPTIMIZATION_STRATEGIES.find(s => s.id === selectedStrategy)

  const runOptimization = async () => {
    setOptimizationLoading(true)
    
    // Simulate optimization calculation
    setTimeout(() => {
      // Mock optimized allocation based on strategy
      const mockOptimization = assetAllocation.map((asset, index) => {
        let targetAllocation = 0
        
        switch (selectedStrategy) {
          case 'conservative':
            // More even distribution for stability
            targetAllocation = 100 / assetAllocation.length
            break
          case 'balanced':
            // Slight preference for larger market cap
            targetAllocation = Math.max(5, Math.min(30, 15 + Math.random() * 10))
            break
          case 'aggressive':
            // More concentrated in top performers
            targetAllocation = index < 3 ? 20 + Math.random() * 15 : 5 + Math.random() * 10
            break
          case 'custom':
            targetAllocation = 100 / assetAllocation.length
            break
          default:
            targetAllocation = asset.allocation_percentage
        }

        const currentValue = asset.current_value
        const totalValue = assetAllocation.reduce((sum, a) => sum + a.current_value, 0)
        const targetValue = (totalValue * targetAllocation) / 100
        const difference = targetValue - currentValue
        
        return {
          ...asset,
          optimized_allocation: targetAllocation,
          target_value: targetValue,
          adjustment_needed: difference,
          adjustment_action: Math.abs(difference) > totalValue * 0.02 
            ? (difference > 0 ? 'buy' : 'sell') 
            : 'hold',
          confidence_score: 75 + Math.random() * 20,
          expected_return: strategy?.expectedReturn || 15,
          risk_contribution: Math.random() * 100
        }
      })

      setOptimizedAllocation(mockOptimization)
      setOptimizationLoading(false)
    }, 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Optimizer</h2>
          <p className="text-muted-foreground">
            Optimize your portfolio allocation for better risk-adjusted returns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Optimization Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTIMIZATION_STRATEGIES.map(strategy => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {strategy && (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{strategy.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Risk Level:</span>
                    <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                      {strategy.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Return:</span>
                    <span className="text-sm font-medium">{strategy.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Max Volatility:</span>
                    <span className="text-sm font-medium">{strategy.maxVolatility}%</span>
                  </div>
                </div>

                {selectedStrategy === 'custom' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Risk Tolerance: {customRiskTolerance[0]}%</Label>
                      <Slider
                        value={customRiskTolerance}
                        onValueChange={setCustomRiskTolerance}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Return Target: {customReturnTarget[0]}%</Label>
                      <Slider
                        value={customReturnTarget}
                        onValueChange={setCustomReturnTarget}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={runOptimization} 
              disabled={optimizationLoading}
              className="w-full"
            >
              {optimizationLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {optimizedAllocation.length > 0 && (
            <>
              {/* Optimization Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        +{strategy?.expectedReturn || 15}%
                      </p>
                      <p className="text-sm text-muted-foreground">Expected Return</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {strategy?.maxVolatility || 25}%
                      </p>
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {optimizedAllocation.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Assets</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Required Actions:</h4>
                    {optimizedAllocation
                      .filter(asset => asset.adjustment_action !== 'hold')
                      .map((asset, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              asset.adjustment_action === 'buy' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium">{asset.agent_symbol}</p>
                              <p className="text-sm text-muted-foreground">
                                {asset.allocation_percentage.toFixed(1)}% → {asset.optimized_allocation.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={asset.adjustment_action === 'buy' ? 'default' : 'destructive'}>
                              {asset.adjustment_action.toUpperCase()} {formatCurrency(Math.abs(asset.adjustment_needed))}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {asset.confidence_score.toFixed(0)}% confidence
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizedAllocation.map((asset, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{asset.agent_symbol}</span>
                          <div className="text-right">
                            <span className="text-sm">
                              {asset.allocation_percentage.toFixed(1)}% → {asset.optimized_allocation.toFixed(1)}%
                            </span>
                            {asset.adjustment_action !== 'hold' && (
                              <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Current</span>
                            <span>{asset.allocation_percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={asset.allocation_percentage} className="h-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Optimized</span>
                            <span>{asset.optimized_allocation.toFixed(1)}%</span>
                          </div>
                          <Progress value={asset.optimized_allocation} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Button className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Apply Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {optimizedAllocation.length === 0 && !optimizationLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Ready to Optimize</h3>
                <p className="text-muted-foreground">
                  Select a strategy and run optimization to see personalized recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}