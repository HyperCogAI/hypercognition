import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  UserPlus,
  UserMinus,
  TrendingUp,
  BarChart3,
  Send,
  Image,
  Hash
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { RealMarketSentimentService } from '@/services/RealMarketSentimentService';

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
  user_display_name?: string;
  user_avatar?: string;
  agent_name?: string;
  agent_symbol?: string;
  is_liked?: boolean;
  is_following_author?: boolean;
}

interface PostCardProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onShare: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onFollow, onUnfollow, onShare }) => {
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'trade_update':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'market_analysis':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return <Hash className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'trade_update':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Trade Update</Badge>;
      case 'market_analysis':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Market Analysis</Badge>;
      default:
        return <Badge variant="outline">General</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user_avatar} alt={post.user_display_name} />
              <AvatarFallback>
                {post.user_display_name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.user_display_name}</h3>
                {getPostTypeIcon(post.post_type)}
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getPostTypeBadge(post.post_type)}
                {post.related_agent_id && (
                  <Badge variant="secondary" className="text-xs">
                    {post.agent_symbol || `Agent #${post.related_agent_id.slice(0, 8)}`}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.user_id !== 'current_user' && (
              <Button
                variant={post.is_following_author ? "outline" : "default"}
                size="sm"
                onClick={() => post.is_following_author ? onUnfollow(post.user_id) : onFollow(post.user_id)}
              >
                {post.is_following_author ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>
        
        {/* Related Agent Info */}
        {post.related_agent_id && post.agent_name && (
          <div className="p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">{post.agent_name}</span>
              <Badge variant="outline">{post.agent_symbol}</Badge>
            </div>
          </div>
        )}
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{post.shares_count}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 ${post.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.is_liked ? 'Liked' : 'Like'}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(post.id)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const SocialFeed = () => {
  const {
    posts,
    stats,
    loading,
    createPost,
    likePost,
    followUser,
    unfollowUser,
    sharePost
  } = useSocialFeed();

  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('general');

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    await createPost(newPostContent, postType);
    setNewPostContent('');
  };

  return (
    <div className="space-y-6">
      {/* Social Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalPosts}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalFollowing}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalFollowers}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalLikes}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Share Your Insights
          </CardTitle>
          <CardDescription>
            Share trading insights, market analysis, or connect with the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's happening in the markets? Share your thoughts..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Image className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="text-sm border-none bg-transparent focus:outline-none"
              >
                <option value="general">General</option>
                <option value="trade_update">Trade Update</option>
                <option value="market_analysis">Market Analysis</option>
              </select>
            </div>
            
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Community Feed</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={likePost}
                onFollow={followUser}
                onUnfollow={unfollowUser}
                onShare={sharePost}
              />
            ))}
            
            {posts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to share something with the community!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};