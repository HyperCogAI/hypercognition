import { supabase } from '@/integrations/supabase/client'

export interface Community {
  id: string
  name: string
  description?: string
  avatar_url?: string
  banner_url?: string
  created_by: string
  member_count: number
  post_count: number
  is_private: boolean
  rules?: any[]
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: 'owner' | 'moderator' | 'member'
  joined_at: string
}

export interface CommunityPost {
  id: string
  community_id: string
  user_id: string
  title: string
  content: string
  post_type: 'discussion' | 'announcement' | 'question'
  media_urls?: string[]
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export class CommunityService {
  /**
   * Get all public communities
   */
  async getCommunities(): Promise<Community[]> {
    const { data, error } = await supabase
      .from('communities' as any)
      .select('*')
      .eq('is_private', false)
      .order('member_count', { ascending: false })

    if (error) {
      console.error('Error fetching communities:', error)
      return []
    }

    return (data || []) as any[]
  }

  /**
   * Get user's communities
   */
  async getUserCommunities(userId: string): Promise<Community[]> {
    const { data, error } = await supabase
      .from('community_members' as any)
      .select('community_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user communities:', error)
      return []
    }

    if (!data || data.length === 0) return []

    const communityIds = data.map((item: any) => item.community_id)
    const { data: communities } = await supabase
      .from('communities' as any)
      .select('*')
      .in('id', communityIds)

    return (communities || []) as any[]
  }

  /**
   * Create a community
   */
  async createCommunity(community: {
    name: string
    description?: string
    is_private?: boolean
    tags?: string[]
  }): Promise<{ success: boolean; community?: Community; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('communities' as any)
        .insert({
          ...community,
          created_by: user.id,
          member_count: 1
        } as any)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Add creator as owner
      await supabase.from('community_members' as any).insert({
        community_id: (data as any).id,
        user_id: user.id,
        role: 'owner'
      } as any)

      return { success: true, community: data as any }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Join a community
   */
  async joinCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('community_members' as any)
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        } as any)

      if (error) {
        return { success: false, error: error.message }
      }

      // Increment member count
      const { data: community } = await supabase
        .from('communities' as any)
        .select('member_count')
        .eq('id', communityId)
        .single()
      
      if (community && (community as any).member_count !== undefined) {
        await supabase
          .from('communities' as any)
          .update({ member_count: ((community as any).member_count || 0) + 1 } as any)
          .eq('id', communityId)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Leave a community
   */
  async leaveCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('community_members' as any)
        .delete()
        .eq('community_id', communityId)
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
   * Get community posts
   */
  async getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts' as any)
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching community posts:', error)
      return []
    }

    return (data || []) as any[]
  }

  /**
   * Create community post
   */
  async createCommunityPost(post: {
    community_id: string
    title: string
    content: string
    post_type?: string
    media_urls?: string[]
  }): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('community_posts' as any)
        .insert({
          ...post,
          user_id: user.id
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
   * Get community members
   */
  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    const { data, error } = await supabase
      .from('community_members' as any)
      .select('*')
      .eq('community_id', communityId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching community members:', error)
      return []
    }

    return (data || []) as any[]
  }
}

export const communityService = new CommunityService()
