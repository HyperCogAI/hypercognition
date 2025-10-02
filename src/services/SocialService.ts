import { supabase } from '@/integrations/supabase/client'

export interface SocialPost {
  id: string
  user_id: string
  content: string
  post_type: string
  visibility?: string
  media_urls?: string[]
  related_agent_id?: string
  related_trade_id?: string
  related_order_id?: string
  likes_count: number
  comments_count: number
  shares_count: number
  views_count?: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
  mentioned_users?: string[]
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  likes_count: number
  created_at: string
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export class SocialService {
  /**
   * Get social feed posts
   */
  async getFeedPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('social_posts' as any)
      .select('*')
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching feed posts:', error)
      return []
    }

    return (data || []) as any[]
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: string): Promise<SocialPost[]> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user posts:', error)
      return []
    }

    return (data || []) as any[]
  }

  /**
   * Create a post
   */
  async createPost(post: {
    content: string
    post_type?: string
    visibility?: string
    media_urls?: string[]
    related_agent_id?: string
    related_trade_id?: string
  }): Promise<{ success: boolean; post?: SocialPost; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          ...post
        } as any)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, post: data as any }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        } as any)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update likes count (using a simple update for now)
      const { data: post } = await supabase
        .from('social_posts')
        .select('likes_count')
        .eq('id', postId)
        .single()
      
      if (post) {
        await supabase
          .from('social_posts')
          .update({ likes_count: (post.likes_count || 0) + 1 } as any)
          .eq('id', postId)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get post comments
   */
  async getPostComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    return data as PostComment[]
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string, content: string, parentId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_comment_id: parentId
        } as any)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        } as any)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user followers
   */
  async getFollowers(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('following_id', userId)

    if (error) {
      console.error('Error fetching followers:', error)
      return []
    }

    return data as UserFollow[]
  }

  /**
   * Get user following
   */
  async getFollowing(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', userId)

    if (error) {
      console.error('Error fetching following:', error)
      return []
    }

    return data as UserFollow[]
  }
}

export const socialService = new SocialService()
