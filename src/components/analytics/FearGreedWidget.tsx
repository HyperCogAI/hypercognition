import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface FearGreedWidgetProps {
  fearGreedIndex: number;
  overallSentiment: number;
  bullishPercentage: number;
  bearishPercentage: number;
  neutralPercentage: number;
  socialSentiment?: string;
  className?: string;
}

export const FearGreedWidget: React.FC<FearGreedWidgetProps> = ({
  fearGreedIndex,
  overallSentiment,
  bullishPercentage,
  bearishPercentage,
  neutralPercentage,
  socialSentiment,
  className = ''
}) => {
  const getIndexLabel = (index: number) => {
    if (index >= 80) return 'Extreme Greed';
    if (index >= 60) return 'Greed';
    if (index >= 40) return 'Neutral';
    if (index >= 20) return 'Fear';
    return 'Extreme Fear';
  };

  const getIndexColor = (index: number) => {
    if (index >= 80) return 'text-green-600';
    if (index >= 60) return 'text-green-500';
    if (index >= 40) return 'text-yellow-500';
    if (index >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradientColor = (index: number) => {
    if (index >= 80) return 'from-green-500 to-green-600';
    if (index >= 60) return 'from-green-400 to-green-500';
    if (index >= 40) return 'from-yellow-400 to-yellow-500';
    if (index >= 20) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  return (
    <Card className={`border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Fear & Greed Index
        </CardTitle>
        <CardDescription>Real-time market sentiment analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Index Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getIndexColor(fearGreedIndex)}`}>
              {fearGreedIndex}
            </div>
            <div className="text-xl font-semibold mb-1">{getIndexLabel(fearGreedIndex)}</div>
            
            {/* Progress Bar */}
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full bg-gradient-to-r ${getGradientColor(fearGreedIndex)} transition-all duration-500`}
                style={{ width: `${fearGreedIndex}%` }}
              />
            </div>

            {socialSentiment && (
              <Badge variant="outline" className="capitalize">
                {socialSentiment}
              </Badge>
            )}
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Bullish</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {bullishPercentage.toFixed(0)}%
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Neutral</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">
                {neutralPercentage.toFixed(0)}%
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Bearish</span>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {bearishPercentage.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Overall Sentiment Score</span>
              <span className="font-bold">{(overallSentiment * 100).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
