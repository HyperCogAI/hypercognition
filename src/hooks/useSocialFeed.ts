import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  media_urls?: string[];
  related_agent_id?: string;
  related_order_id?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields from joins
  user_display_name?: string;
  user_avatar?: string;
  agent_name?: string;
  agent_symbol?: string;
  is_liked?: boolean;
  is_following_author?: boolean;
}

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface SocialStats {
  totalPosts: number;
  totalFollowing: number;
  totalFollowers: number;
  totalLikes: number;
}

export const useSocialFeed = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [stats, setStats] = useState<SocialStats>({
    totalPosts: 0,
    totalFollowing: 0,
    totalFollowers: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  // Fetch posts for the feed
  const fetchFeed = useCallback(async (offset = 0, limit = 20) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      // Mock data for now - will use real data once we have authentication
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          user_id: 'user1',
          content: 'Just made a 15% gain on $AGENT! The AI trading signals are getting more accurate every day. 🚀 #TradingWin',
          post_type: 'trade_update',
          related_agent_id: 'agent-123',
          likes_count: 24,
          comments_count: 8,
          shares_count: 3,
          views_count: 156,
          is_pinned: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user_display_name: 'CryptoKing',
          user_avatar: '',
          agent_name: 'Agent Alpha',
          agent_symbol: 'AGENT',
          is_liked: false,
          is_following_author: true
        },
        {
          id: '2',
          user_id: 'user2',
          content: 'Market analysis: The current dip presents a great buying opportunity. Looking at the technicals, we might see a bounce in the next 24-48 hours. DCA strategy recommended. 📈',
          post_type: 'market_analysis',
          likes_count: 67,
          comments_count: 23,
          shares_count: 12,
          views_count: 489,
          is_pinned: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user_display_name: 'TradingGuru',
          user_avatar: '',
          is_liked: true,
          is_following_author: false
        },
        {
          id: '3',
          user_id: 'user3',
          content: 'New to the platform and loving the copy trading feature! Already following 3 top performers. Thanks for the warm welcome everyone! 👋',
          post_type: 'general',
          likes_count: 18,
          comments_count: 12,
          shares_count: 1,
          views_count: 234,
          is_pinned: false,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user_display_name: 'NewTrader',
          user_avatar: '',
          is_liked: false,
          is_following_author: false
        }
      ];

      if (offset === 0) {
        setPosts(mockPosts);
      } else {
        setPosts(prev => [...prev, ...mockPosts]);
      }

      // Mock stats
      setStats({
        totalPosts: 156,
        totalFollowing: 23,
        totalFollowers: 87,
        totalLikes: 432
      });

    } catch (error) {
      console.error('Error fetching feed:', error);
      toast({
        title: "Error",
        description: "Failed to load social feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  const createPost = useCallback(async (content: string, postType: string = 'general', relatedAgentId?: string) => {
    try {
      // Mock post creation
      const newPost: SocialPost = {
        id: Date.now().toString(),
        user_id: 'current_user',
        content,
        post_type: postType,
        related_agent_id: relatedAgentId,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 1,
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_display_name: 'You',
        user_avatar: '',
        is_liked: false,
        is_following_author: false
      };

      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community",
      });

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  }, [toast]);

  const likePost = useCallback(async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.is_liked;
          return {
            ...post,
            is_liked: isLiked,
            likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, []);

  const followUser = useCallback(async (userId: string) => {
    try {
      // Mock follow action
      toast({
        title: "Following User",
        description: "You are now following this trader",
      });

      // Update posts to reflect following status
      setPosts(prev => prev.map(post => 
        post.user_id === userId 
          ? { ...post, is_following_author: true }
          : post
      ));

      setStats(prev => ({
        ...prev,
        totalFollowing: prev.totalFollowing + 1
      }));
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      });
    }
  }, [toast]);

  const unfollowUser = useCallback(async (userId: string) => {
    try {
      // Mock unfollow action
      toast({
        title: "Unfollowed User",
        description: "You are no longer following this trader",
      });

      // Update posts to reflect following status
      setPosts(prev => prev.map(post => 
        post.user_id === userId 
          ? { ...post, is_following_author: false }
          : post
      ));

      setStats(prev => ({
        ...prev,
        totalFollowing: prev.totalFollowing - 1
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive"
      });
    }
  }, [toast]);

  const sharePost = useCallback(async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares_count: post.shares_count + 1 }
          : post
      ));
      
      toast({
        title: "Post Shared",
        description: "Post has been shared to your feed",
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }, [toast]);

  // Real-time updates
  useEffect(() => {
    fetchFeed();

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('social-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts'
        },
        (payload) => {
          console.log('New post received:', payload);
          // In a real implementation, we'd add the new post to the feed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFeed]);

  return {
    posts,
    following,
    followers,
    stats,
    loading,
    loadingMore,
    fetchFeed,
    createPost,
    likePost,
    followUser,
    unfollowUser,
    sharePost
  };
};