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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
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
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskMetrics?.riskScore.toFixed(1) || '0.0'}
            </div>
            {riskBadge && (
              <Badge variant={riskBadge.variant} className="mt-2">
                {riskBadge.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value at Risk (5%)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(riskMetrics?.valueAtRisk || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((riskMetrics?.valueAtRisk || 0) / (riskMetrics?.portfolioValue || 1) * 100, 1)} of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskMetrics?.sharpeRatio.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage((riskMetrics?.diversificationRatio || 0) * 100, 1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio diversification
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="limits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="limits">Risk Limits</TabsTrigger>
          <TabsTrigger value="positions">Position Risk</TabsTrigger>
          <TabsTrigger value="calculator">Position Sizing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Limit Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskLimits.map((limit) => (
                <div key={limit.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {limit.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getLimitStatusColor(limit.status)}`}>
                        {limit.type.includes('concentration') 
                          ? limit.current.toFixed(3) 
                          : formatPercentage(limit.current, 1)
                        } / {limit.type.includes('concentration') 
                          ? limit.limit.toFixed(3)
                          : formatPercentage(limit.limit, 1)
                        }
                      </span>
                      {limit.status === 'breach' && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={(limit.current / limit.limit) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Asset</th>
                      <th className="text-right p-2">Exposure</th>
                      <th className="text-right p-2">% Portfolio</th>
                      <th className="text-right p-2">Volatility</th>
                      <th className="text-right p-2">Beta</th>
                      <th className="text-right p-2">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positionRisks.map((position) => (
                      <tr key={position.agentId} className="border-b">
                        <td className="p-2 font-medium">{position.symbol}</td>
                        <td className="text-right p-2">{formatCurrency(position.exposure)}</td>
                        <td className="text-right p-2">{formatPercentage(position.percentOfPortfolio, 1)}</td>
                        <td className="text-right p-2">{formatPercentage(position.volatility * 100, 1)}</td>
                        <td className="text-right p-2">{position.beta.toFixed(2)}</td>
                        <td className="text-right p-2">
                          <Badge variant={position.volatility > 0.1 ? 'destructive' : position.volatility > 0.05 ? 'secondary' : 'default'}>
                            {position.volatility > 0.1 ? 'High' : position.volatility > 0.05 ? 'Medium' : 'Low'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Position Size Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRisk">Target Risk (%)</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss (%)</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioValue">Portfolio Value ($)</Label>
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
                  />
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Recommended Position Size</h4>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedPositionSize)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPercentage((calculatedPositionSize / parseFloat(positionSizeInputs.portfolioValue)) * 100, 1)} of portfolio
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{suggestion.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                        </div>
                        <Badge variant={suggestion.action === 'reduce' ? 'destructive' : 'default'}>
                          {suggestion.action === 'reduce' ? 'Reduce' : 'Increase'}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Current: </span>
                        {formatPercentage(suggestion.currentWeight, 1)}
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-muted-foreground">Target: </span>
                        {formatPercentage(suggestion.targetWeight, 1)}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4">
                    Apply Optimization Suggestions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Portfolio Well Optimized</h3>
                  <p className="text-muted-foreground">
                    Your portfolio allocation appears to be well balanced. No major adjustments needed.
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