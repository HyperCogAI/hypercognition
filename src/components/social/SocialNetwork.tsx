import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.display_name}</h3>
                    {user.is_verified && (
                      <Badge className="bg-blue-500">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{user.followers_count} followers</span>
                    <span>{user.following_count} following</span>
                    <span>{user.posts_count} posts</span>
                    {user.trading_score && (
                      <span className="text-green-500">Score: {user.trading_score}</span>
                    )}
                  </div>
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

export function SocialNetwork() {
  // Real data from Supabase
  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery({
    queryKey: ['user-relationships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_relationships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['social-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_activities')
        .select('*')
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transform relationships data to match UI interface
  const mockFollowing: UserProfile[] = relationships
    .filter(rel => rel.status === 'active')
    .slice(0, 10)
    .map((rel, index) => ({
      id: rel.following_id,
      display_name: `Trader ${rel.following_id.slice(-4)}`,
      avatar_url: undefined,
      bio: `Active trader specializing in DeFi protocols`,
      followers_count: Math.floor(Math.random() * 5000) + 100,
      following_count: Math.floor(Math.random() * 1000) + 50,
      posts_count: Math.floor(Math.random() * 500) + 10,
      trading_score: Math.floor(Math.random() * 100) + 50,
      join_date: rel.created_at,
      is_verified: Math.random() > 0.7,
      is_following: true
    }));

  const mockFollowers: UserProfile[] = relationships
    .filter(rel => rel.status === 'active')
    .slice(0, 10)
    .map((rel, index) => ({
      id: rel.follower_id,
      display_name: `Follower ${rel.follower_id.slice(-4)}`,
      avatar_url: undefined,
      bio: `Crypto enthusiast and trader`,
      followers_count: Math.floor(Math.random() * 2000) + 50,
      following_count: Math.floor(Math.random() * 500) + 20,
      posts_count: Math.floor(Math.random() * 200) + 5,
      trading_score: Math.floor(Math.random() * 100) + 30,
      join_date: rel.created_at,
      is_verified: Math.random() > 0.8,
      is_following: false
    }));

  const mockSuggestions: UserProfile[] = Array.from({ length: 8 }, (_, i) => ({
    id: `suggestion_${i}`,
    display_name: `Suggested User ${i + 1}`,
    avatar_url: undefined,
    bio: `Professional trader with ${Math.floor(Math.random() * 5) + 1}+ years experience`,
    followers_count: Math.floor(Math.random() * 10000) + 500,
    following_count: Math.floor(Math.random() * 2000) + 100,
    posts_count: Math.floor(Math.random() * 1000) + 50,
    trading_score: Math.floor(Math.random() * 100) + 60,
    join_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: Math.random() > 0.6,
    is_following: false
  }));

  const handleFollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          follower_id: 'current_user', // Should use actual current user ID
          following_id: userId,
          status: 'active'
        });

      if (error) throw error;
      
      console.log(`Following user ${userId}`);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_relationships')
        .update({ status: 'inactive' })
        .eq('follower_id', 'current_user') // Should use actual current user ID
        .eq('following_id', userId);

      if (error) throw error;
      
      console.log(`Unfollowed user ${userId}`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (relationshipsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Social Network
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect with traders, share insights, and build your network in the crypto community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Network Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-2xl font-bold text-primary">{mockFollowing.length}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{mockFollowers.length}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{activities.length}</div>
              <div className="text-sm text-muted-foreground">Recent Activities</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-2xl font-bold text-yellow-500">#42</div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">85</div>
              <div className="text-sm text-muted-foreground">Trading Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">12</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-2xl font-bold text-green-500">+24.5%</div>
              <div className="text-sm text-muted-foreground">30D Return</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">78%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">156</div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="following" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="following">Following ({mockFollowing.length})</TabsTrigger>
          <TabsTrigger value="followers">Followers ({mockFollowers.length})</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>People You Follow</CardTitle>
              <CardDescription>
                Stay updated with their latest trades and insights
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

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
              <CardDescription>
                Traders who follow your activities and insights
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

        <TabsContent value="discover">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Connections</CardTitle>
              <CardDescription>
                Discover new traders and expand your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FollowingList
                users={mockSuggestions}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}