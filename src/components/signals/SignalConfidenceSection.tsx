import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignalTickerAnalysis, KOLMention } from "@/hooks/useSignalTickerAnalysis";
import { ChevronDown, ChevronUp, RefreshCw, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SignalConfidenceSectionProps {
  signalId: string;
  ticker: string;
  originalConfidence: number;
  className?: string;
}

export function SignalConfidenceSection({
  signalId,
  ticker,
  originalConfidence,
  className,
}: SignalConfidenceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { analysis, isLoading, triggerAnalysis, isAnalyzing, isStale } = 
    useSignalTickerAnalysis(signalId, ticker);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legendary': return 'text-amber-400';
      case 'elite': return 'text-purple-400';
      case 'prominent': return 'text-blue-400';
      case 'rising': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'legendary': return 'default';
      case 'elite': return 'secondary';
      default: return 'outline';
    }
  };

  const formatYaps = (yaps: number): string => {
    if (yaps >= 1000000) return `${(yaps / 1000000).toFixed(1)}M`;
    if (yaps >= 1000) return `${(yaps / 1000).toFixed(1)}K`;
    return yaps.toString();
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={cn("border-border/50 bg-gradient-to-br from-card/80 to-primary/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">KOL Confidence Analysis</span>
            </div>
            <Button
              size="sm"
              onClick={() => triggerAnalysis({})}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyze Now
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Discover which KOLs are talking about {ticker} to boost signal confidence
          </p>
        </CardContent>
      </Card>
    );
  }

  const enhancedScore = analysis.final_confidence_score;
  const multiplier = analysis.confidence_multiplier;
  const boost = ((multiplier - 1) * 100).toFixed(0);

  return (
    <Card className={cn(
      "border-border/50 bg-gradient-to-br from-card/80 to-primary/5 overflow-hidden transition-all",
      className
    )}>
      <CardContent className="p-0">
        {/* Header Bar */}
        <div
          className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">Enhanced Confidence Analysis</h4>
                  {isStale && (
                    <Badge variant="outline" className="text-xs">
                      Stale
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.total_kols_count} KOLs mentioning • {formatDistanceToNow(new Date(analysis.analysis_timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">
                    {originalConfidence}%
                  </span>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {enhancedScore.toFixed(0)}%
                  </Badge>
                </div>
                <span className="text-xs text-green-400">+{boost}% boost ({multiplier.toFixed(1)}x)</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerAnalysis({ forceRefresh: true });
                }}
                disabled={isAnalyzing}
              >
                <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              </Button>

              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-border/50 bg-card/50 p-4 space-y-6">
            {/* Influence Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h5 className="text-sm font-semibold">KOL Tier Distribution</h5>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-medium">Legendary</span>
                    <span className="text-muted-foreground">{analysis.top_tier_kols}</span>
                  </div>
                  <Progress value={(analysis.top_tier_kols / analysis.total_kols_count) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-medium">Prominent</span>
                    <span className="text-muted-foreground">{analysis.mid_tier_kols}</span>
                  </div>
                  <Progress value={(analysis.mid_tier_kols / analysis.total_kols_count) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-medium">Rising</span>
                    <span className="text-muted-foreground">{analysis.emerging_kols}</span>
                  </div>
                  <Progress value={(analysis.emerging_kols / analysis.total_kols_count) * 100} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Total Influence</p>
                  <p className="text-lg font-bold text-primary">{formatYaps(analysis.total_influence_score)} Yaps</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Avg per KOL</p>
                  <p className="text-lg font-bold text-primary">{formatYaps(analysis.average_influence_score)} Yaps</p>
                </div>
              </div>
            </div>

            {/* Top KOLs List */}
            {analysis.kols_mentioning.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold">Top KOLs Mentioning {ticker}</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analysis.kols_mentioning.slice(0, 10).map((kol: KOLMention, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <span className="text-xs font-bold">{kol.username[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <a
                            href={`https://twitter.com/${kol.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            @{kol.username}
                          </a>
                          <p className="text-xs text-muted-foreground">{kol.tweet_count} tweets</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getTierBadgeVariant(kol.tier)} className="text-xs capitalize">
                          {kol.tier}
                        </Badge>
                        <span className={cn("text-sm font-bold", getTierColor(kol.tier))}>
                          {formatYaps(kol.yaps_all)} Yaps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Calculation Breakdown */}
            <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/30">
              <h5 className="text-xs font-semibold text-muted-foreground">Calculation Breakdown</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Original AI Confidence:</span>
                  <span className="font-mono">{originalConfidence}%</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Legendary KOL Bonus ({analysis.top_tier_kols} × 0.3):</span>
                  <span className="font-mono">+{(analysis.top_tier_kols * 0.3).toFixed(2)}x</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Prominent KOL Bonus ({analysis.mid_tier_kols} × 0.15):</span>
                  <span className="font-mono">+{(analysis.mid_tier_kols * 0.15).toFixed(2)}x</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Rising KOL Bonus ({analysis.emerging_kols} × 0.05):</span>
                  <span className="font-mono">+{(analysis.emerging_kols * 0.05).toFixed(2)}x</span>
                </div>
                <div className="border-t border-border/30 pt-1 mt-1 flex justify-between font-semibold">
                  <span>Total Multiplier:</span>
                  <span className="font-mono text-primary">{multiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between font-bold text-primary">
                  <span>Enhanced Confidence:</span>
                  <span className="font-mono">{enhancedScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
