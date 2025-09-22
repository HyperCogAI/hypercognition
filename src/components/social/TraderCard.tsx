import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Trophy, 
  Shield,
  Star,
  Copy,
  BarChart3
} from 'lucide-react';
import { CopyTradingDialog } from './CopyTradingDialog';

interface TradingProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  total_pnl: number;
  pnl_percentage: number;
  win_rate: number;
  total_trades: number;
  total_followers: number;
  total_following: number;
  risk_score?: number;
  max_drawdown: number;
  sharpe_ratio?: number;
  is_verified: boolean;
  is_public: boolean;
}

interface TraderCardProps {
  trader: TradingProfile;
}

export const TraderCard: React.FC<TraderCardProps> = ({ trader }) => {
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={trader.avatar_url} alt={trader.display_name} />
                <AvatarFallback>
                  {trader.display_name?.slice(0, 2).toUpperCase() || 'TR'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{trader.display_name}</CardTitle>
                  {trader.is_verified && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {trader.total_followers} followers • {trader.total_trades} trades
                </CardDescription>
              </div>
            </div>
            
            <Badge 
              variant="outline"
              className={`${getRiskColor(trader.risk_score)} text-white border-none`}
            >
              {getRiskLabel(trader.risk_score)}
            </Badge>
          </div>
          
          {trader.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {trader.bio}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className={`flex items-center justify-center gap-1 ${trader.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trader.pnl_percentage >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-bold">
                  {trader.pnl_percentage >= 0 ? '+' : ''}{trader.pnl_percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Total P&L</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Trophy className="h-4 w-4" />
                <span className="font-bold">{trader.win_rate.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium">${Math.abs(trader.total_pnl).toLocaleString()}</p>
              <p className="text-muted-foreground">P&L Value</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{trader.max_drawdown.toFixed(1)}%</p>
              <p className="text-muted-foreground">Max Drawdown</p>
            </div>
            <div className="text-center">
              <p className="font-medium">
                {trader.sharpe_ratio ? trader.sharpe_ratio.toFixed(2) : 'N/A'}
              </p>
              <p className="text-muted-foreground">Sharpe Ratio</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCopyDialog(true)}
              className="flex-1"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Trade
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={trader.avatar_url} alt={trader.display_name} />
                      <AvatarFallback>
                        {trader.display_name?.slice(0, 2).toUpperCase() || 'TR'}
                      </AvatarFallback>
                    </Avatar>
                    {trader.display_name}
                    {trader.is_verified && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed trading performance and statistics
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Detailed Performance Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{trader.total_followers}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{trader.total_trades}</p>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className={`text-2xl font-bold ${trader.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trader.pnl_percentage >= 0 ? '+' : ''}{trader.pnl_percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Return</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{trader.win_rate.toFixed(0)}%</p>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                    </div>
                  </div>
                  
                  {trader.bio && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-muted-foreground">{trader.bio}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      setShowCopyDialog(true);
                    }}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Start Copy Trading
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      <CopyTradingDialog
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        trader={trader}
      />
    </>
  );
};