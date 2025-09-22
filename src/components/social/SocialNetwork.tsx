import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Trophy, 
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  trading_score?: number;
  join_date: string;
  is_verified: boolean;
  is_following: boolean;
}

interface FollowingListProps {
  users: UserProfile[];
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

const FollowingList: React.FC<FollowingListProps> = ({ users, onFollow, onUnfollow }) => {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.display_name} />
                  <AvatarFallback>
                    {user.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.display_name}</h3>
                    {user.is_verified && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    {user.trading_score && user.trading_score > 80 && (
                      <Trophy className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{user.followers_count} followers</span>
                    <span>{user.posts_count} posts</span>
                    {user.trading_score && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{user.trading_score}% score</span>
                      </div>
                    )}
                  </div>
                  
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant={user.is_following ? "outline" : "default"}
                size="sm"
                onClick={() => user.is_following ? onUnfollow(user.id) : onFollow(user.id)}
              >
                {user.is_following ? 'Unfollow' : 'Follow'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const SocialNetwork = () => {
  // Mock data
  const mockFollowing: UserProfile[] = [
    {
      id: '1',
      display_name: 'CryptoKing',
      bio: 'Professional trader with 5+ years experience. Specializing in DeFi and yield farming strategies.',
      followers_count: 1250,
      following_count: 15,
      posts_count: 89,
      trading_score: 92,
      join_date: '2023-01-15',
      is_verified: true,
      is_following: true
    },
    {
      id: '2',
      display_name: 'TradingGuru',
      bio: 'Market analyst and educator. Sharing daily insights and trading strategies.',
      followers_count: 2340,
      following_count: 45,
      posts_count: 156,
      trading_score: 87,
      join_date: '2022-11-20',
      is_verified: true,
      is_following: true
    }
  ];

  const mockFollowers: UserProfile[] = [
    {
      id: '3',
      display_name: 'NewTrader',
      bio: 'Learning to trade and copy successful strategies.',
      followers_count: 45,
      following_count: 23,
      posts_count: 12,
      trading_score: 65,
      join_date: '2024-01-10',
      is_verified: false,
      is_following: false
    },
    {
      id: '4',
      display_name: 'AIEnthusiast',
      bio: 'Fascinated by AI trading algorithms and automation.',
      followers_count: 234,
      following_count: 67,
      posts_count: 34,
      trading_score: 78,
      join_date: '2023-08-05',
      is_verified: false,
      is_following: false
    }
  ];

  const mockSuggested: UserProfile[] = [
    {
      id: '5',
      display_name: 'MarketMaker',
      bio: 'High-frequency trader and market maker with proven track record.',
      followers_count: 3456,
      following_count: 12,
      posts_count: 234,
      trading_score: 95,
      join_date: '2022-03-12',
      is_verified: true,
      is_following: false
    },
    {
      id: '6',
      display_name: 'DeFiExpert',
      bio: 'DeFi protocol researcher and yield optimization specialist.',
      followers_count: 1890,
      following_count: 89,
      posts_count: 178,
      trading_score: 89,
      join_date: '2022-07-18',
      is_verified: true,
      is_following: false
    }
  ];

  const handleFollow = (userId: string) => {
    console.log('Following user:', userId);
  };

  const handleUnfollow = (userId: string) => {
    console.log('Unfollowing user:', userId);
  };

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Following</p>
                <p className="text-2xl font-bold">{mockFollowing.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{mockFollowers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Score</p>
                <p className="text-2xl font-bold">85</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Network Tabs */}
      <Tabs defaultValue="following" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Following ({mockFollowing.length})
              </CardTitle>
              <CardDescription>
                Traders and analysts you're following for insights and copy trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FollowingList
                users={mockFollowing}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Followers ({mockFollowers.length})
              </CardTitle>
              <CardDescription>
                Traders who are following your insights and strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FollowingList
                users={mockFollowers}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Suggested Traders
              </CardTitle>
              <CardDescription>
                Discover top performing traders you might want to follow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FollowingList
                users={mockSuggested}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            </CardContent>
          </Card>

          {/* Featured Communities */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Communities</CardTitle>
              <CardDescription>
                Join specialized trading communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">DeFi Traders</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Community for DeFi protocol analysis and yield farming strategies
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">1.2k members</Badge>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">AI Trading Hub</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discussions about AI trading algorithms and automation
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">856 members</Badge>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};