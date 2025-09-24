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

      // Fetch real social posts with user information
      const { data: postsData, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform data and add derived fields
      const transformedPosts: SocialPost[] = (postsData || []).map(post => ({
        ...post,
        agent_name: undefined, // Will be fetched separately if needed
        agent_symbol: undefined,
        is_liked: false, // Will be updated with real data
        is_following_author: false, // Will be updated with real data
        user_display_name: `User ${post.user_id.slice(0, 8)}`, // Placeholder for now
        user_avatar: ''
      }));

      if (offset === 0) {
        setPosts(transformedPosts);
      } else {
        setPosts(prev => [...prev, ...transformedPosts]);
      }

      // Fetch real stats
      const { count: totalPosts } = await supabase
        .from('social_posts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPosts: totalPosts || 0,
        totalFollowing: 0, // Will be calculated from follows table
        totalFollowers: 0, // Will be calculated from follows table
        totalLikes: 0 // Will be calculated from likes
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create posts",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content,
          post_type: postType,
          related_agent_id: relatedAgentId
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: SocialPost = {
        ...data,
        user_display_name: user.email?.split('@')[0] || 'Anonymous',
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, is_liked: false, likes_count: post.likes_count - 1 }
            : post
        ));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, is_liked: true, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, []);

  const followUser = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('social_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

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