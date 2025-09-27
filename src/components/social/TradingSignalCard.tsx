import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  MessageCircle, 
  Eye,
  Clock,
  Target,
  ShieldAlert,
  Crown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TradingSignal {
  id: string;
  user_id: string;
  agent_id: string;
  signal_type: string;
  price: number;
  target_price?: number;
  stop_loss_price?: number;
  confidence_level?: number;
  reasoning?: string;
  time_horizon?: string;
  likes_count: number;
  views_count: number;
  comments_count: number;
  is_premium: boolean;
  created_at: string;
  expires_at?: string;
}

interface TradingSignalCardProps {
  signal: TradingSignal;
}

export const TradingSignalCard: React.FC<TradingSignalCardProps> = ({ signal }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(signal.likes_count);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const getSignalTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy':
      case 'long':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sell':
      case 'short':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy':
      case 'long':
        return <TrendingUp className="h-4 w-4" />;
      case 'sell':
      case 'short':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (level?: number) => {
    if (!level) return 'bg-gray-500';
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (level?: number) => {
    if (!level) return 'Unknown';
    if (level >= 80) return 'High';
    if (level >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/10">
              <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20 text-xs font-semibold">
                {signal.user_id.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-base font-semibold">
                Agent #{signal.agent_id.slice(0, 8)}
              </CardTitle>
              <CardDescription className="text-xs">
                {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {signal.is_premium && (
              <Crown className="h-4 w-4 text-amber-500" />
            )}
            <Badge 
              variant="outline"
              className={`${getSignalTypeColor(signal.signal_type)} text-xs font-medium border-0`}
            >
              {getSignalIcon(signal.signal_type)}
              <span className="ml-1">{signal.signal_type.toUpperCase()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Price Information */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/30">
            <p className="text-lg font-bold text-foreground">${signal.price.toFixed(4)}</p>
            <p className="text-xs text-muted-foreground font-medium">Entry Price</p>
          </div>
          
          {signal.target_price && (
            <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20">
              <p className="text-lg font-bold text-green-600">${signal.target_price.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground font-medium">Target</p>
            </div>
          )}
        </div>
        
        {/* Additional Info Grid */}
        {(signal.stop_loss_price || signal.confidence_level || signal.time_horizon) && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/10 rounded-lg border border-border/30">
            {signal.stop_loss_price && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <ShieldAlert className="h-3 w-3" />
                  <span className="text-xs font-semibold">${signal.stop_loss_price.toFixed(4)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Stop Loss</p>
              </div>
            )}
            
            {signal.confidence_level && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${getConfidenceColor(signal.confidence_level)}`}
                  />
                  <span className="text-xs font-semibold">{signal.confidence_level}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
            )}
            
            {signal.time_horizon && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs font-semibold">{signal.time_horizon}</span>
                </div>
                <p className="text-xs text-muted-foreground">Timeframe</p>
              </div>
            )}
          </div>
        )}
        
        {/* Reasoning */}
        {signal.reasoning && (
          <div className="p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.reasoning}
            </p>
          </div>
        )}
        
        {/* Engagement & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{signal.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{signal.comments_count}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-8 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span className="ml-1">{likesCount}</span>
            </Button>
            
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs font-medium">
              Follow
            </Button>
          </div>
        </div>
        
        {/* Expiry Warning */}
        {signal.expires_at && new Date(signal.expires_at) > new Date() && (
          <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Clock className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              Expires {formatDistanceToNow(new Date(signal.expires_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};