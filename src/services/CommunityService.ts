import { supabase } from '@/integrations/supabase/client'

export interface CommunityPost {
  id: string
  user_id: string
  category_id?: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  like_count: number
  last_activity_at: string
  created_at: string
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
  community_categories?: {
    name: string
  }
}

export interface PostReply {
  id: string
  post_id: string
  user_id: string
  content: string
  like_count: number
  is_solution: boolean
  created_at: string
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
}

export interface ChatMessage {
  id: string
  user_id: string
  content: string
  is_system_message: boolean
  created_at: string
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
}

export interface UserStats {
  id: string
  user_id: string
  posts_created: number
  replies_created: number
  likes_received: number
  reputation_score: number
  rank?: number
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
}

class CommunityService {
  // ==================== FORUM POSTS ====================
  
  async getPosts(limit = 20, categoryId?: string) {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles(display_name, avatar_url),
        community_categories(name)
      `)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .limit(limit)
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data as CommunityPost[]
  }
  
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles(display_name, avatar_url),
        community_categories(name)
      `)
      .eq('id', postId)
      .single()
    
    if (error) throw error
    
    // Increment view count
    await supabase
      .from('community_posts')
      .update({ view_count: data.view_count + 1 })
      .eq('id', postId)
    
    return data as CommunityPost
  }
  
  async createPost(post: {
    title: string
    content: string
    category_id?: string
  }) {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        ...post,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, post: data }
  }
  
  async updatePost(postId: string, updates: { title?: string; content?: string }) {
    const { error } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId)
    
    if (error) throw error
    return { success: true }
  }
  
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
    
    if (error) throw error
    return { success: true }
  }
  
  async likePost(postId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('community_post_likes')
      .insert({ post_id: postId, user_id: userId })
    
    if (error) throw error
    return { success: true }
  }
  
  async unlikePost(postId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { success: true }
  }
  
  // ==================== POST REPLIES ====================
  
  async getReplies(postId: string) {
    const { data, error } = await supabase
      .from('community_post_replies')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data as PostReply[]
  }
  
  async createReply(postId: string, content: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('community_post_replies')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, reply: data }
  }
  
  async likeReply(replyId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('community_reply_likes')
      .insert({ reply_id: replyId, user_id: userId })
    
    if (error) throw error
    return { success: true }
  }
  
  async unlikeReply(replyId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('community_reply_likes')
      .delete()
      .eq('reply_id', replyId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { success: true }
  }
  
  // ==================== LIVE CHAT ====================
  
  async getChatMessages(limit = 50) {
    const { data, error } = await supabase
      .from('community_chat_messages')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return (data as ChatMessage[]).reverse()
  }
  
  async sendChatMessage(content: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('community_chat_messages')
      .insert({
        user_id: userId,
        content
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, message: data }
  }
  
  subscribeToChat(callback: (message: ChatMessage) => void) {
    return supabase
      .channel('community_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chat_messages'
        },
        async (payload) => {
          // Fetch the full message with profile data
          const { data } = await supabase
            .from('community_chat_messages')
            .select(`
              *,
              profiles(display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (data) callback(data as ChatMessage)
        }
      )
      .subscribe()
  }
  
  // ==================== LEADERBOARD ====================
  
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('community_user_stats')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .order('reputation_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as UserStats[]
  }
  
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('community_user_stats')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as UserStats | null
  }
  
  // ==================== CATEGORIES ====================
  
  async getCategories() {
    const { data, error } = await supabase
      .from('community_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data
  }
  
  // ==================== STATS ====================
  
  async getCommunityStats() {
    const [postsResult, usersResult, chatResult] = await Promise.all([
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('community_user_stats').select('id', { count: 'exact', head: true }),
      supabase.from('community_chat_messages').select('id', { count: 'exact', head: true })
    ])
    
    return {
      totalPosts: postsResult.count || 0,
      activeMembers: usersResult.count || 0,
      totalMessages: chatResult.count || 0
    }
  }
}

export const communityService = new CommunityService()
