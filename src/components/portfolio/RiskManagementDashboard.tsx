import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Calculator, Zap } from 'lucide-react';
import { RealRiskService } from '../../services/RealRiskService';
import { Skeleton } from '@/components/ui/skeleton';

export const RiskManagementDashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [riskMetrics, setRiskMetrics] = React.useState<any>(null);
  const [positionRisks, setPositionRisks] = React.useState<any[]>([]);
  const [riskLimits, setRiskLimits] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const [metricsData, positionsData, limitsData] = await Promise.all([
        RealRiskService.calculateRiskMetrics('current_user'),
        RealRiskService.calculatePositionRisks('current_user'),
        RealRiskService.getRiskLimits('current_user')
      ]);

      setRiskMetrics(metricsData);
      setPositionRisks(positionsData);
      setRiskLimits(limitsData);
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePositionSize = (targetRisk: number, stopLoss: number, portfolioValue: number) => {
    return RealRiskService.calculatePositionSize(targetRisk, stopLoss, portfolioValue);
  };

  const optimizePortfolio = () => {
    return RealRiskService.optimizePortfolio('current_user');
  };

  const [positionSizeInputs, setPositionSizeInputs] = useState({
    targetRisk: '2',
    stopLoss: '5',
    portfolioValue: '10000'
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  const getRiskBadgeVariant = (score: number) => {
    if (score < 30) return { variant: 'default' as const, label: 'Low Risk', color: 'text-green-400' };
    if (score < 60) return { variant: 'secondary' as const, label: 'Medium Risk', color: 'text-yellow-400' };
    return { variant: 'destructive' as const, label: 'High Risk', color: 'text-red-400' };
  };

  const getLimitStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'breach': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
  };

  const calculatedPositionSize = calculatePositionSize(
    parseFloat(positionSizeInputs.targetRisk),
    parseFloat(positionSizeInputs.stopLoss),
    parseFloat(positionSizeInputs.portfolioValue)
  );

  const optimizationSuggestions = optimizePortfolio();
  const riskBadge = riskMetrics ? getRiskBadgeVariant(riskMetrics.riskScore) : null;

  return (
    <div className="space-y-8">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {riskMetrics?.riskScore.toFixed(1) || '0.0'}
            </div>
            {riskBadge && (
              <Badge variant={riskBadge.variant} className="text-xs">
                {riskBadge.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Value at Risk (5%)</CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(riskMetrics?.valueAtRisk || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((riskMetrics?.valueAtRisk || 0) / (riskMetrics?.portfolioValue || 1) * 100, 1)} of portfolio
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {riskMetrics?.sharpeRatio.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatPercentage((riskMetrics?.diversificationRatio || 0) * 100, 1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio diversification
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Limits
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Position Risk
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Position Sizing
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Risk Limit Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {riskLimits.map((limit) => (
                <div key={limit.id} className="space-y-3 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold capitalize">
                      {limit.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getLimitStatusColor(limit.status)}`}>
                        {limit.type.includes('concentration') 
                          ? limit.current.toFixed(3) 
                          : formatPercentage(limit.current, 1)
                        } / {limit.type.includes('concentration') 
                          ? limit.limit.toFixed(3)
                          : formatPercentage(limit.limit, 1)
                        }
                      </span>
                      {limit.status === 'breach' && (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={(limit.current / limit.limit) * 100} 
                    className="h-3"
                  />
                  <div className="text-xs text-muted-foreground">
                    Status: <span className={`font-medium ${getLimitStatusColor(limit.status)}`}>
                      {limit.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Position Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Asset</th>
                        <th className="text-right p-4 font-medium">Exposure</th>
                        <th className="text-right p-4 font-medium">% Portfolio</th>
                        <th className="text-right p-4 font-medium">Volatility</th>
                        <th className="text-right p-4 font-medium">Beta</th>
                        <th className="text-right p-4 font-medium">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionRisks.map((position, index) => (
                        <tr key={position.agentId} className={`border-b transition-colors hover:bg-muted/30 ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                          <td className="p-4 font-semibold">{position.symbol}</td>
                          <td className="text-right p-4 font-medium">{formatCurrency(position.exposure)}</td>
                          <td className="text-right p-4">{formatPercentage(position.percentOfPortfolio, 1)}</td>
                          <td className="text-right p-4">{formatPercentage(position.volatility * 100, 1)}</td>
                          <td className="text-right p-4 font-mono">{position.beta.toFixed(2)}</td>
                          <td className="text-right p-4">
                            <Badge variant={position.volatility > 0.1 ? 'destructive' : position.volatility > 0.05 ? 'secondary' : 'default'} className="font-medium">
                              {position.volatility > 0.1 ? 'High' : position.volatility > 0.05 ? 'Medium' : 'Low'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="h-6 w-6" />
                Position Size Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="targetRisk" className="text-sm font-medium">Target Risk (%)</Label>
                  <Input
                    id="targetRisk"
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={positionSizeInputs.targetRisk}
                    onChange={(e) => setPositionSizeInputs(prev => ({
                      ...prev,
                      targetRisk: e.target.value
                    }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="stopLoss" className="text-sm font-medium">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={positionSizeInputs.stopLoss}
                    onChange={(e) => setPositionSizeInputs(prev => ({
                      ...prev,
                      stopLoss: e.target.value
                    }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="portfolioValue" className="text-sm font-medium">Portfolio Value ($)</Label>
                  <Input
                    id="portfolioValue"
                    type="number"
                    min="100"
                    step="100"
                    value={positionSizeInputs.portfolioValue}
                    onChange={(e) => setPositionSizeInputs(prev => ({
                      ...prev,
                      portfolioValue: e.target.value
                    }))}
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Recommended Position Size</h4>
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatCurrency(calculatedPositionSize)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage((calculatedPositionSize / parseFloat(positionSizeInputs.portfolioValue)) * 100, 1)} of portfolio
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Portfolio Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions.length > 0 ? (
                <div className="space-y-6">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{suggestion.symbol}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.reasoning}</p>
                        </div>
                        <Badge variant={suggestion.action === 'reduce' ? 'destructive' : 'default'} className="font-medium">
                          {suggestion.action === 'reduce' ? 'Reduce' : 'Increase'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-semibold">{formatPercentage(suggestion.currentWeight, 1)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-semibold text-primary">{formatPercentage(suggestion.targetWeight, 1)}</span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full h-12 text-base">
                    Apply Optimization Suggestions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-3">Portfolio Well Optimized</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your portfolio allocation appears to be well balanced. No major adjustments needed at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};