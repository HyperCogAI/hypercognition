import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

interface UseAgentsPaginationOptions {
  page?: number
  pageSize?: number
  searchQuery?: string
  sortBy?: 'market_cap' | 'price' | 'volume_24h' | 'change_24h'
  sortOrder?: 'asc' | 'desc'
}

interface PaginationResult {
  agents: any[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export function useAgentsPagination({
  page = 1,
  pageSize = 20,
  searchQuery = '',
  sortBy = 'market_cap',
  sortOrder = 'desc'
}: UseAgentsPaginationOptions = {}) {
  
  const cacheKey = CACHE_KEYS.AGENT_LIST(page, pageSize, searchQuery, sortBy)
  
  const { data, isLoading, error } = useQuery<PaginationResult>({
    queryKey: ['agents-paginated', page, pageSize, searchQuery, sortBy, sortOrder],
    queryFn: async () => {
      // Check cache first
      const cached = cache.get<PaginationResult>(cacheKey)
      if (cached) {
        return cached
      }

      // Build query
      let query = supabase
        .from('agents')
        .select('*', { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order(sortBy, { ascending: sortOrder === 'asc' })

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,symbol.ilike.%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      const result: PaginationResult = {
        agents: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        pageSize
      }

      // Cache the result
      cache.set(cacheKey, result, { ttl: CACHE_TTL.AGENT_LIST })

      return result
    },
    staleTime: 60000, // Consider data fresh for 60 seconds
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })

  return {
    agents: data?.agents || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    pageSize: data?.pageSize || pageSize,
    isLoading,
    error
  }
}
