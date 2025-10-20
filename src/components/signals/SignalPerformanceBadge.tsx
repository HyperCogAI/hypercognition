import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useSignalPerformance } from "@/hooks/useSignalPerformance";

interface SignalPerformanceBadgeProps {
  signalId: string;
}

export const SignalPerformanceBadge = ({ signalId }: SignalPerformanceBadgeProps) => {
  const { performance } = useSignalPerformance(signalId);

  if (!performance) {
    return null;
  }

  if (performance.outcome === 'pending') {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Tracking...
      </Badge>
    );
  }

  const return24h = performance.return_24h || 0;
  const peakReturn = performance.peak_return || 0;

  const getOutcomeVariant = () => {
    switch (performance.outcome) {
      case 'bullish':
        return 'default';
      case 'bearish':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getOutcomeColor = () => {
    switch (performance.outcome) {
      case 'bullish':
        return 'text-success';
      case 'bearish':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={getOutcomeVariant()} className="gap-1">
        {performance.outcome === 'bullish' ? (
          <TrendingUp className="h-3 w-3" />
        ) : performance.outcome === 'bearish' ? (
          <TrendingDown className="h-3 w-3" />
        ) : null}
        {performance.outcome.toUpperCase()}
      </Badge>

      <Badge variant="outline" className={getOutcomeColor()}>
        24h: {return24h >= 0 ? '+' : ''}{return24h.toFixed(2)}%
      </Badge>

      {peakReturn > 0 && (
        <Badge variant="outline" className="text-success">
          Peak: +{peakReturn.toFixed(2)}%
        </Badge>
      )}

      {performance.performance_score && (
        <Badge variant="outline">
          Score: {performance.performance_score}/100
        </Badge>
      )}
    </div>
  );
};
