import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce, throttle, createDataCache, createRealTimeDataManager } from '@/lib/performance';

// Performance optimization hook
export const usePerformanceOptimization = () => {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [memoryUsage, setMemoryUsage] = useState(0);

  // Detect connection quality
  useEffect(() => {
    const updateConnectionQuality = () => {
      if (!navigator.onLine) {
        setConnectionQuality('offline');
        return;
      }

      // Check if navigator.connection exists (it's not available in all browsers)
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionQuality('fast');
        } else {
          setConnectionQuality('slow');
        }
      }
    };

    updateConnectionQuality();
    window.addEventListener('online', updateConnectionQuality);
    window.addEventListener('offline', updateConnectionQuality);

    return () => {
      window.removeEventListener('online', updateConnectionQuality);
      window.removeEventListener('offline', updateConnectionQuality);
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / memory.totalJSHeapSize;
        setMemoryUsage(used);
        
        // Enable low power mode if memory usage is high
        if (used > 0.8) {
          setIsLowPowerMode(true);
        } else if (used < 0.6) {
          setIsLowPowerMode(false);
        }
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, []);

  // Adaptive refresh rates based on performance
  const getRefreshRate = useCallback(() => {
    if (connectionQuality === 'offline') return 0;
    if (isLowPowerMode || connectionQuality === 'slow') return 10000; // 10s
    return 1000; // 1s
  }, [isLowPowerMode, connectionQuality]);

  // Adaptive batch sizes for data loading
  const getBatchSize = useCallback(() => {
    if (isLowPowerMode || connectionQuality === 'slow') return 10;
    return 50;
  }, [isLowPowerMode, connectionQuality]);

  return {
    isLowPowerMode,
    connectionQuality,
    memoryUsage,
    getRefreshRate,
    getBatchSize,
    shouldReduceAnimations: isLowPowerMode,
    shouldReducePolling: connectionQuality === 'slow' || isLowPowerMode,
    shouldPrefetch: connectionQuality === 'fast' && !isLowPowerMode
  };
};

// Optimized data fetching hook
export const useOptimizedDataFetching = <T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    cacheKey?: string;
    cacheTTL?: number;
    enablePolling?: boolean;
    pollingInterval?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { getRefreshRate, shouldReducePolling } = usePerformanceOptimization();
  
  // Create cache if cache key provided
  const cache = useMemo(() => 
    options.cacheKey ? createDataCache<T>(options.cacheTTL) : null,
    [options.cacheKey, options.cacheTTL]
  );

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cache && options.cacheKey) {
      const cachedData = cache.get(options.cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      
      // Cache the result
      if (cache && options.cacheKey) {
        cache.set(options.cacheKey, result);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cache, options.cacheKey]);

  // Debounced fetch to prevent excessive calls
  const debouncedFetch = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  );

  // Initial fetch
  useEffect(() => {
    debouncedFetch();
  }, dependencies);

  // Polling with adaptive refresh rate
  useEffect(() => {
    if (!options.enablePolling || shouldReducePolling) return;

    const interval = setInterval(
      debouncedFetch,
      options.pollingInterval || getRefreshRate()
    );

    return () => clearInterval(interval);
  }, [debouncedFetch, options.enablePolling, options.pollingInterval, getRefreshRate, shouldReducePolling]);

  return { data, loading, error, refetch: fetchData };
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = throttle((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, 16); // ~60fps

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight
  };
};

// Real-time data management with memory optimization
export const useOptimizedRealTimeData = <T>(maxItems: number = 1000) => {
  const dataManager = useMemo(() => createRealTimeDataManager<T>(maxItems), [maxItems]);
  const [data, setData] = useState<T[]>([]);
  const { shouldReducePolling } = usePerformanceOptimization();

  const addData = useCallback((item: T) => {
    dataManager.add(item);
    
    // Update state less frequently if in low power mode
    if (shouldReducePolling) {
      // Throttled update every 5 seconds
      throttledUpdate();
    } else {
      setData([...dataManager.get()]);
    }
  }, [dataManager, shouldReducePolling]);

  const throttledUpdate = useMemo(
    () => throttle(() => setData([...dataManager.get()]), 5000),
    [dataManager]
  );

  const clearData = useCallback(() => {
    dataManager.clear();
    setData([]);
  }, [dataManager]);

  return {
    data,
    addData,
    clearData,
    size: dataManager.size()
  };
};