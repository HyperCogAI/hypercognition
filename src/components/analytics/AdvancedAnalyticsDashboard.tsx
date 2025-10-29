import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  Wallet,
  Target,
  Award,
  Download
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const { 
    portfolioAnalytics, 
    tradingAnalytics, 
    performanceSummary,
    isLoading,
    isLoadingSummary,
    exportData,
    isExporting
  } = useAdvancedAnalytics(period);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleExport = () => {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();
    exportData(startDate, endDate, 'portfolio');
  };

  const portfolio = performanceSummary?.portfolio;
  const trading = performanceSummary?.trading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          </div>
          <p className="text-muted-foreground">Comprehensive portfolio and trading performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-10"
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Portfolio Value</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {portfolio ? formatCurrency(portfolio.total_value) : '-'}
            </p>
            {portfolio && (
              <p className={`text-sm font-medium ${portfolio.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(portfolio.total_pnl_percentage)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {portfolio ? `${(portfolio.win_rate * 100).toFixed(1)}%` : '-'}
            </p>
            {portfolio && (
              <p className="text-sm text-muted-foreground">
                {portfolio.winning_trades}/{portfolio.total_trades} trades
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Trading Volume</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {trading ? formatCurrency(trading.total_volume) : '-'}
            </p>
            {trading && (
              <p className="text-sm text-muted-foreground">
                {trading.trade_count} trades
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium">Sharpe Ratio</span>
            </div>
            <p className="text-3xl font-bold mb-2">
              {portfolio?.sharpe_ratio ? portfolio.sharpe_ratio.toFixed(2) : '-'}
            </p>
            <p className="text-sm text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-[#16181f]">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Portfolio Metrics
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trading Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Overview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {portfolio ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total P&L</span>
                          <span className={`font-bold ${portfolio.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(portfolio.total_pnl)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(Math.abs(portfolio.total_pnl_percentage), 100)} 
                          className={portfolio.total_pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Win Rate</span>
                          <span className="font-bold text-primary">
                            {(portfolio.win_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={portfolio.win_rate * 100} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Profit</p>
                          <p className="font-bold text-green-500">{formatCurrency(portfolio.avg_profit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Loss</p>
                          <p className="font-bold text-red-500">{formatCurrency(Math.abs(portfolio.avg_loss))}</p>
                        </div>
                      </div>

                      {portfolio.max_drawdown && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
                          <p className="font-bold text-red-500">
                            {formatPercentage(portfolio.max_drawdown)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No portfolio data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trade Statistics */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Trade Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio ? (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="font-medium">Total Trades</span>
                        </div>
                        <span className="text-2xl font-bold">{portfolio.total_trades}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Winning Trades</span>
                        </div>
                        <span className="text-2xl font-bold text-green-500">{portfolio.winning_trades}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Losing Trades</span>
                        </div>
                        <span className="text-2xl font-bold text-red-500">{portfolio.losing_trades}</span>
                      </div>

                      {portfolio.best_trade && (
                        <div className="pt-4 border-t">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Best Trade</span>
                            <span className="font-bold text-green-500">
                              {formatCurrency(portfolio.best_trade)}
                            </span>
                          </div>
                          {portfolio.worst_trade && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Worst Trade</span>
                              <span className="font-bold text-red-500">
                                {formatCurrency(portfolio.worst_trade)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No trade data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trading Volume Analysis */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trading ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Volume</span>
                          <span className="font-bold">{formatCurrency(trading.total_volume)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-green-500/10">
                          <p className="text-sm text-muted-foreground mb-2">Total Profit</p>
                          <p className="text-xl font-bold text-green-500">
                            {formatCurrency(trading.total_profit)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10">
                          <p className="text-sm text-muted-foreground mb-2">Total Loss</p>
                          <p className="text-xl font-bold text-red-500">
                            {formatCurrency(Math.abs(trading.total_loss))}
                          </p>
                        </div>
                      </div>

                      {trading.largest_win && (
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Largest Win</span>
                            <span className="font-bold text-green-500">
                              {formatCurrency(trading.largest_win)}
                            </span>
                          </div>
                          {trading.largest_loss && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Largest Loss</span>
                              <span className="font-bold text-red-500">
                                {formatCurrency(Math.abs(trading.largest_loss))}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No trading data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Streak Analysis */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Performance Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trading ? (
                    <>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-semibold">Winning Streak</span>
                        </div>
                        <p className="text-3xl font-bold">{trading.consecutive_wins}</p>
                        <p className="text-sm text-muted-foreground mt-1">Consecutive wins</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-muted">
                            <TrendingDown className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-semibold">Losing Streak</span>
                        </div>
                        <p className="text-3xl font-bold">{trading.consecutive_losses}</p>
                        <p className="text-sm text-muted-foreground mt-1">Consecutive losses</p>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Profitable Trades</span>
                          <span className="font-bold text-green-500">{trading.profitable_trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Unprofitable Trades</span>
                          <span className="font-bold text-red-500">{trading.unprofitable_trades}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No streak data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;