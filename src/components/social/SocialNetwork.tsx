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
import { useAuth } from '@/contexts/AuthContext';


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
  const { user } = useAuth()

  // Following relationships for current user
  const { data: followingRels = [] } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('user_relationships')
        .select('following_id, created_at, status')
        .eq('follower_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })

  // Followers for current user
  const { data: followersRels = [] } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('user_relationships')
        .select('follower_id, created_at, status')
        .eq('following_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })

  // Profiles for following
  const followingIds = (followingRels as any[]).map(r => r.following_id)
  const { data: followingProfiles = [] } = useQuery({
    queryKey: ['following-profiles', followingIds.sort().join(',')],
    queryFn: async () => {
      if (!followingIds.length) return []
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('user_id, display_name, avatar_url')
        .in('user_id', followingIds)
      if (error) throw error
      return data || []
    },
    enabled: followingIds.length > 0,
  })

  // Profiles for followers
  const followerIds = (followersRels as any[]).map(r => r.follower_id)
  const { data: followerProfiles = [] } = useQuery({
    queryKey: ['follower-profiles', followerIds.sort().join(',')],
    queryFn: async () => {
      if (!followerIds.length) return []
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('user_id, display_name, avatar_url')
        .in('user_id', followerIds)
      if (error) throw error
      return data || []
    },
    enabled: followerIds.length > 0,
  })

  // Public activities
  const { data: activities = [] } = useQuery({
    queryKey: ['social-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_activities')
        .select('*')
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data || []
    },
  })

  // Current user's trader profile (for performance metrics)
  const { data: myProfile } = useQuery({
    queryKey: ['my-trader-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('trader_profiles' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  // Map to UI model (no random mock values)
  const followingUsers = (followingProfiles as any[]).map(p => ({
    id: p.user_id,
    display_name: p.display_name || p.user_id.slice(0, 6),
    avatar_url: p.avatar_url || undefined,
    bio: undefined,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    trading_score: undefined,
    join_date: new Date().toISOString(),
    is_verified: false,
    is_following: true,
  })) as UserProfile[]

  const followersUsers = (followerProfiles as any[]).map(p => ({
    id: p.user_id,
    display_name: p.display_name || p.user_id.slice(0, 6),
    avatar_url: p.avatar_url || undefined,
    bio: undefined,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    trading_score: undefined,
    join_date: new Date().toISOString(),
    is_verified: false,
    is_following: false,
  })) as UserProfile[]

  const handleFollow = async (targetUserId: string) => {
    try {
      const { data: authRes } = await supabase.auth.getUser()
      const currentUserId = authRes.user?.id
      if (!currentUserId) return
      const { error } = await supabase
        .from('user_relationships' as any)
        .insert({ follower_id: currentUserId, following_id: targetUserId, status: 'active' })
      if (error) throw error
    } catch (e) {
      console.error('Error following user:', e)
    }
  }

  const handleUnfollow = async (targetUserId: string) => {
    try {
      const { data: authRes } = await supabase.auth.getUser()
      const currentUserId = authRes.user?.id
      if (!currentUserId) return
      const { error } = await supabase
        .from('user_relationships' as any)
        .update({ status: 'inactive' })
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      if (error) throw error
    } catch (e) {
      console.error('Error unfollowing user:', e)
    }
  }

  const loading = false

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
              <div className="text-2xl font-bold text-primary">{followingUsers.length}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{followersUsers.length}</div>
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