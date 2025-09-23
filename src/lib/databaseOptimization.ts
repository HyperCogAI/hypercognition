import { supabase } from '@/integrations/supabase/client';

interface QueryOptimizationOptions {
  pageSize?: number;
  enableCache?: boolean;
  cacheTime?: number;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
}

interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  nextPage: number | null;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class DatabaseQueryOptimizer {
  private cache = new Map<string, CacheEntry>();
  private defaultCacheTime = 5 * 60 * 1000; // 5 minutes

  // Optimized paginated query
  async paginatedQuery<T>(
    table: string,
    page: number = 1,
    options: QueryOptimizationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      pageSize = 50,
      enableCache = true,
      cacheTime = this.defaultCacheTime,
      select = '*',
      orderBy,
      filters = {}
    } = options;

    const cacheKey = this.generateCacheKey(table, page, options);

    // Check cache first
    if (enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            query = query.like(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const result: PaginatedResult<T> = {
        data: data || [],
        count: count || 0,
        hasMore: (count || 0) > page * pageSize,
        nextPage: (count || 0) > page * pageSize ? page + 1 : null
      };

      // Cache the result
      if (enableCache) {
        this.setCache(cacheKey, result, cacheTime);
      }

      return result;
    } catch (error) {
      console.error('Database query optimization error:', error);
      throw error;
    }
  }

  // Optimized search with full-text search
  async searchQuery<T>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    options: QueryOptimizationOptions = {}
  ): Promise<T[]> {
    const {
      pageSize = 50,
      enableCache = true,
      cacheTime = this.defaultCacheTime,
      select = '*'
    } = options;

    const cacheKey = `search_${table}_${searchTerm}_${searchColumns.join('_')}`;

    if (enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      let query = supabase
        .from(table)
        .select(select)
        .limit(pageSize);

      // Use text search if available, fallback to LIKE queries
      if (searchColumns.length === 1) {
        query = query.textSearch(searchColumns[0], searchTerm);
      } else {
        // Use OR conditions for multiple columns
        const orConditions = searchColumns
          .map(col => `${col}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(orConditions);
      }

      const { data, error } = await query;

      if (error) throw error;

      const result = data || [];

      if (enableCache) {
        this.setCache(cacheKey, result, cacheTime);
      }

      return result;
    } catch (error) {
      console.error('Search query optimization error:', error);
      throw error;
    }
  }

  // Batch operations for better performance
  async batchInsert<T>(
    table: string,
    records: Partial<T>[],
    batchSize: number = 1000
  ): Promise<void> {
    const batches = this.chunk(records, batchSize);

    for (const batch of batches) {
      const { error } = await supabase
        .from(table)
        .insert(batch);

      if (error) {
        console.error('Batch insert error:', error);
        throw error;
      }
    }

    // Clear related cache entries
    this.clearCacheByPattern(table);
  }

  // Optimized count query
  async getCount(
    table: string,
    filters: Record<string, any> = {}
  ): Promise<number> {
    const cacheKey = `count_${table}_${JSON.stringify(filters)}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) throw error;

      const result = count || 0;
      this.setCache(cacheKey, result, this.defaultCacheTime);

      return result;
    } catch (error) {
      console.error('Count query error:', error);
      throw error;
    }
  }

  // Index usage recommendations
  analyzeQuery(table: string, filters: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    const filterKeys = Object.keys(filters);
    
    if (filterKeys.length > 2) {
      recommendations.push(`Consider creating a composite index on [${filterKeys.join(', ')}] for table ${table}`);
    }

    if (filterKeys.some(key => key.includes('created_at') || key.includes('updated_at'))) {
      recommendations.push(`Consider indexing timestamp columns for better date range queries`);
    }

    return recommendations;
  }

  // Cache management
  private generateCacheKey(table: string, page: number, options: QueryOptimizationOptions): string {
    return `${table}_${page}_${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): any {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }

  private clearCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Clear expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number; entries: number } {
    let totalEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    this.cache.forEach((entry) => {
      totalEntries++;
      if (entry.expiresAt <= now) {
        expiredEntries++;
      }
    });

    return {
      size: this.cache.size,
      hitRate: totalEntries > 0 ? (totalEntries - expiredEntries) / totalEntries : 0,
      entries: totalEntries
    };
  }
}

// Export singleton instance
export const dbOptimizer = new DatabaseQueryOptimizer();

// React hook for optimized database queries
export const useOptimizedQuery = () => {
  return {
    paginatedQuery: dbOptimizer.paginatedQuery.bind(dbOptimizer),
    searchQuery: dbOptimizer.searchQuery.bind(dbOptimizer),
    batchInsert: dbOptimizer.batchInsert.bind(dbOptimizer),
    getCount: dbOptimizer.getCount.bind(dbOptimizer),
    analyzeQuery: dbOptimizer.analyzeQuery.bind(dbOptimizer),
    cleanupCache: dbOptimizer.cleanupCache.bind(dbOptimizer),
    getCacheStats: dbOptimizer.getCacheStats.bind(dbOptimizer)
  };
};