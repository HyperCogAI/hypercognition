import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { KOLPerformance } from "@/hooks/useKOLPerformance";

interface KOLPerformanceCardProps {
  kol: KOLPerformance;
}

export const KOLPerformanceCard = ({ kol }: KOLPerformanceCardProps) => {
  const successRate = kol.success_rate || 0;
  const avgReturn = kol.avg_return_24h || 0;
  
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'bg-success/10 text-success border-success/20';
    if (rate >= 50) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <a
            href={`https://twitter.com/${kol.twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-primary hover:underline"
          >
            @{kol.twitter_username}
          </a>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            {kol.total_signals} signals
          </Badge>
        </div>

        {/* Success Rate */}
        <div className={`p-3 rounded-lg border ${getSuccessRateColor(successRate)}`}>
          <div className="text-xs font-medium mb-1">Success Rate</div>
          <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Avg 24h Return</div>
            <div className={`font-semibold flex items-center gap-1 ${avgReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
              {avgReturn >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {avgReturn.toFixed(2)}%
            </div>
          </div>

          <div className="p-2 rounded bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Best Signal</div>
            <div className="font-semibold text-success">
              +{(kol.best_signal_return || 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Kaito Score */}
        {kol.yaps_30d && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Kaito Influence</span>
            <Badge variant="secondary" className="text-xs">
              {(kol.yaps_30d / 1000).toFixed(1)}K Yaps
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
