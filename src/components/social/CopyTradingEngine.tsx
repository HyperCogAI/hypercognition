import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCopyTradingEngine } from '@/hooks/useCopyTradingEngine';
import { formatDistanceToNow } from 'date-fns';

export const CopyTradingEngine = () => {
  const {
    isMonitoring,
    recentExecutions,
    stats,
    loading,
    startMonitoring,
    stopMonitoring,
    refreshData
  } = useCopyTradingEngine();

  return (
    <div className="space-y-6">
      {/* Engine Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Copy Trading Engine
              </CardTitle>
              <CardDescription>
                Real-time monitoring and execution of copy trades
              </CardDescription>
            </div>
            <Badge 
              variant={isMonitoring ? "default" : "secondary"}
              className={isMonitoring ? "bg-green-100 text-green-800 border-green-200" : ""}
            >
              {isMonitoring ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={loading}
              variant={isMonitoring ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Engine
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Engine
                </>
              )}
            </Button>
            
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Copy Trades</p>
                <p className="text-2xl font-bold">{stats.totalCopyTrades}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalCopyTrades > 0 
                    ? Math.round((stats.successfulTrades / stats.totalCopyTrades) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{stats.averageLatency}s</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Copy Trade Executions</CardTitle>
          <CardDescription>
            Latest copy trades executed by the engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentExecutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No copy trades executed yet</p>
              <p className="text-sm">Copy trades will appear here when the engine is active</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExecutions.map((execution, index) => (
                <div key={execution.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {execution.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : execution.status === 'failed' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      
                      <div>
                        <p className="font-medium">
                          Copy Trade #{execution.copy_order_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {execution.amount.toFixed(4)} tokens at ${execution.price.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={execution.status === 'success' ? 'default' : 'secondary'}>
                        {execution.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(execution.executed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {index < recentExecutions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engine Status Info */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Real-time Monitoring</p>
              <p className="text-sm text-muted-foreground">
                Engine monitors all order executions in real-time using Supabase's real-time subscriptions
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Automatic Execution</p>
              <p className="text-sm text-muted-foreground">
                When a followed trader's order fills, copy trades are automatically executed based on follower settings
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Risk Management</p>
              <p className="text-sm text-muted-foreground">
                Built-in safeguards including position sizing, stop losses, and maximum trade limits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};