import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

describe('Cache Manager', () => {
  beforeEach(() => {
    cache.invalidate()
  })

  it('stores and retrieves data correctly', () => {
    const testData = { id: 1, name: 'test' }
    cache.set('test-key', testData, 1000)
    
    const retrieved = cache.get('test-key')
    expect(retrieved).toEqual(testData)
  })

  it('respects TTL expiration', async () => {
    const testData = { id: 1, name: 'test' }
    cache.set('test-key', testData, 10) // 10ms TTL
    
    // Should be available immediately
    expect(cache.get('test-key')).toEqual(testData)
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // Should be null after expiration
    expect(cache.get('test-key')).toBeNull()
  })

  it('invalidates specific patterns', () => {
    cache.set('user_1_data', { id: 1 }, 1000)
    cache.set('user_2_data', { id: 2 }, 1000)
    cache.set('agent_1_data', { id: 1 }, 1000)
    
    cache.invalidate('user_.*')
    
    expect(cache.get('user_1_data')).toBeNull()
    expect(cache.get('user_2_data')).toBeNull()
    expect(cache.get('agent_1_data')).toBeTruthy()
  })

  it('provides correct cache size', () => {
    expect(cache.size()).toBe(0)
    
    cache.set('key1', 'value1', 1000)
    cache.set('key2', 'value2', 1000)
    
    expect(cache.size()).toBe(2)
  })

  it('generates correct cache keys', () => {
    expect(CACHE_KEYS.AGENT_DETAIL('123')).toBe('agent_detail_123')
    expect(CACHE_KEYS.USER_PORTFOLIO('user1')).toBe('portfolio_user1')
    expect(CACHE_KEYS.PRICE_HISTORY('agent1')).toBe('price_history_agent1')
  })
})