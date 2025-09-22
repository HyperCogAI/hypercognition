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
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {signal.user_id.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">
                Agent #{signal.agent_id.slice(0, 8)}
              </CardTitle>
              <CardDescription className="text-sm">
                {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {signal.is_premium && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            <Badge 
              variant="outline"
              className={getSignalTypeColor(signal.signal_type)}
            >
              {getSignalIcon(signal.signal_type)}
              <span className="ml-1 font-medium">{signal.signal_type.toUpperCase()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-lg font-bold">${signal.price.toFixed(4)}</p>
            <p className="text-xs text-muted-foreground">Entry Price</p>
          </div>
          
          {signal.target_price && (
            <div className="text-center p-3 bg-green-100/50 rounded-lg">
              <p className="text-lg font-bold text-green-700">${signal.target_price.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>
          )}
        </div>
        
        {/* Additional Info */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {signal.stop_loss_price && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <ShieldAlert className="h-3 w-3" />
                <span className="font-medium">${signal.stop_loss_price.toFixed(4)}</span>
              </div>
              <p className="text-muted-foreground">Stop Loss</p>
            </div>
          )}
          
          {signal.confidence_level && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <div 
                  className={`w-2 h-2 rounded-full ${getConfidenceColor(signal.confidence_level)}`}
                />
                <span className="font-medium">{signal.confidence_level}%</span>
              </div>
              <p className="text-muted-foreground">Confidence</p>
            </div>
          )}
          
          {signal.time_horizon && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{signal.time_horizon}</span>
              </div>
              <p className="text-muted-foreground">Timeframe</p>
            </div>
          )}
        </div>
        
        {/* Reasoning */}
        {signal.reasoning && (
          <div className="p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {signal.reasoning}
            </p>
          </div>
        )}
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{signal.views_count}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{signal.comments_count}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Button size="sm" variant="outline">
              Follow Signal
            </Button>
          </div>
        </div>
        
        {/* Expiry Warning */}
        {signal.expires_at && new Date(signal.expires_at) > new Date() && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100/50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Expires {formatDistanceToNow(new Date(signal.expires_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};