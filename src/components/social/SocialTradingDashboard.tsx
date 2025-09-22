import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Copy, 
  Heart, 
  MessageCircle, 
  Share2,
  Star,
  Shield,
  Target,
  Clock,
  Activity,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useSocialTrading } from '@/hooks/useSocialTrading';
import { Skeleton } from '@/components/ui/skeleton';

export const SocialTradingDashboard: React.FC = () => {
  const {
    topTraders,
    socialFeed,
    copyTradingSettings,
    loading,
    followTrader,
    unfollowTrader,
    enableCopyTrading,
    disableCopyTrading,
    likePost
  } = useSocialTrading();

  const [selectedTab, setSelectedTab] = useState('discover');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const renderTraderCard = (trader: any) => (
    <Card key={trader.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={trader.avatar_url} />
          <AvatarFallback>{trader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{trader.username}</h3>
            {trader.verified && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
            <Badge variant={trader.tier === 'platinum' ? 'default' : 'secondary'} className="text-xs">
              {trader.tier}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {trader.bio}
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Return</span>
                <span className={`font-medium ${trader.total_return > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trader.total_return > 0 ? '+' : ''}{trader.total_return}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium">{trader.win_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Followers</span>
                <span className="font-medium">{trader.followers_count.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly</span>
                <span className={`font-medium ${trader.monthly_return > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trader.monthly_return > 0 ? '+' : ''}{trader.monthly_return}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Score</span>
                <span className="font-medium">{trader.risk_score}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trades</span>
                <span className="font-medium">{trader.total_trades}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={trader.is_following ? "secondary" : "default"}
              onClick={() => trader.is_following ? unfollowTrader(trader.id) : followTrader(trader.id)}
              className="flex-1 text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              {trader.is_following ? 'Following' : 'Follow'}
            </Button>
            
            {trader.copy_trading_enabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => enableCopyTrading(trader.id, {})}
                className="flex-1 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderSocialPost = (post: any) => (
    <Card key={post.id} className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.avatar_url} />
          <AvatarFallback>{post.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm">{post.username}</h4>
            <Badge variant="outline" className="text-xs">
              {post.type.replace('_', ' ')}
            </Badge>
            {post.verified_trade && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm mb-3">{post.content}</p>
          
          {post.trade_data && (
            <Card className="p-3 mb-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium">{post.trade_data.symbol}</span>
                    <Badge 
                      variant={post.trade_data.action === 'buy' ? 'default' : 'destructive'}
                      className="ml-2 text-xs"
                    >
                      {post.trade_data.action.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-medium">${post.trade_data.price}</span>
                  </div>
                  {post.trade_data.target && (
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium">${post.trade_data.target}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span className="font-medium">{post.trade_data.confidence}%</span>
                </div>
              </div>
            </Card>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likePost(post.id)}
              className={`h-8 px-2 ${post.is_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
              {post.likes_count}
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comments_count}
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share2 className="w-4 h-4 mr-1" />
              {post.shares_count}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Trading</h1>
          <p className="text-muted-foreground">
            Follow top traders and copy their strategies
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Traders</h2>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topTraders.map(renderTraderCard)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feed" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Social Feed</h2>
            
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {socialFeed.map(renderSocialPost)}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Following</h2>
            
            {topTraders.filter(trader => trader.is_following).length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No traders followed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start following traders to see their updates here
                </p>
                <Button onClick={() => setSelectedTab('discover')}>
                  Discover Traders
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topTraders.filter(trader => trader.is_following).map(renderTraderCard)}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="copy-trading" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Copy Trading Settings</h2>
            
            {copyTradingSettings.length === 0 ? (
              <Card className="p-8 text-center">
                <Copy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No copy trading active</h3>
                <p className="text-muted-foreground mb-4">
                  Enable copy trading to automatically follow trader signals
                </p>
                <Button onClick={() => setSelectedTab('discover')}>
                  Find Traders to Copy
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {copyTradingSettings.map((setting) => {
                  const trader = topTraders.find(t => t.id === setting.trader_id);
                  if (!trader) return null;
                  
                  return (
                    <Card key={setting.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={trader.avatar_url} />
                            <AvatarFallback>{trader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{trader.username}</h4>
                            <p className="text-sm text-muted-foreground">
                              {setting.allocation_percentage}% allocation
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={setting.is_active}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                disableCopyTrading(setting.trader_id);
                              }
                            }}
                          />
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};