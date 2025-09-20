import { supabase } from '@/integrations/supabase/client'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

// Enhanced data fetching with caching
export class DataService {
  // Agents
  static async getAgents() {
    const cacheKey = CACHE_KEYS.AGENTS
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('market_cap', { ascending: false })

    if (error) throw error

    cache.set(cacheKey, data, CACHE_TTL.AGENTS)
    return data
  }

  static async getAgentDetail(id: string) {
    const cacheKey = CACHE_KEYS.AGENT_DETAIL(id)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    cache.set(cacheKey, data, CACHE_TTL.AGENT_DETAIL)
    return data
  }

  static async getPriceHistory(agentId: string, period: string = '24h') {
    const cacheKey = `${CACHE_KEYS.PRICE_HISTORY(agentId)}_${period}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) throw error

    cache.set(cacheKey, data, CACHE_TTL.PRICE_HISTORY)
    return data
  }

  // User Portfolio
  static async getUserPortfolio(userId: string) {
    const cacheKey = CACHE_KEYS.USER_PORTFOLIO(userId)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const [holdingsRes, transactionsRes] = await Promise.all([
      supabase
        .from('user_holdings')
        .select(`*, agent:agents(*)`)
        .eq('user_id', userId),
      supabase
        .from('transactions')
        .select(`*, agent:agents(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    if (holdingsRes.error) throw holdingsRes.error
    if (transactionsRes.error) throw transactionsRes.error

    const result = {
      holdings: holdingsRes.data || [],
      transactions: transactionsRes.data || []
    }

    cache.set(cacheKey, result, CACHE_TTL.USER_DATA)
    return result
  }

  // Social Features
  static async getAgentSocialData(agentId: string) {
    const cacheKey = `social_${agentId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const [ratingsRes, commentsRes] = await Promise.all([
      supabase
        .from('agent_ratings')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('agent_comments')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
    ])

    if (ratingsRes.error) throw ratingsRes.error
    if (commentsRes.error) throw commentsRes.error

    const result = {
      ratings: ratingsRes.data || [],
      comments: commentsRes.data || []
    }

    cache.set(cacheKey, result, CACHE_TTL.SOCIAL_DATA)
    return result
  }

  // Orders
  static async getUserOrders(userId: string) {
    const cacheKey = CACHE_KEYS.ORDERS(userId)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const { data, error } = await supabase
      .from('orders')
      .select(`*, agent:agents(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    cache.set(cacheKey, data, CACHE_TTL.USER_DATA)
    return data
  }

  // Cache invalidation methods
  static invalidateUserData(userId: string) {
    cache.invalidate(`.*${userId}.*`)
  }

  static invalidateAgentData(agentId: string) {
    cache.invalidate(`.*${agentId}.*`)
  }

  static invalidateAllCache() {
    cache.invalidate()
  }
}