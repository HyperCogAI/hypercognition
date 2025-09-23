// Performance optimization utilities

// Lazy loading utility for components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

// Bundle splitting for large components
export const lazyImports = {
  // Trading components
  TradingDashboard: () => import('@/components/trading/AdvancedTradingDashboard'),
  MultiExchangeDashboard: () => import('@/components/trading/MultiExchangeDashboard'),
  
  // Analytics components
  AnalyticsDashboard: () => import('@/components/analytics/AdvancedAnalyticsDashboard'),
  TechnicalAnalysis: () => import('@/components/analytics/TechnicalAnalysisDashboard'),
  
  // Social components
  SocialTradingDashboard: () => import('@/components/social/SocialTradingDashboard'),
  
  // Institutional components
  InstitutionalDashboard: () => import('@/components/institutional/InstitutionalDashboard'),
  ComplianceDashboard: () => import('@/components/compliance/ComplianceDashboard'),
  
  // Support components
  CustomerSupportDashboard: () => import('@/components/support/CustomerSupportDashboard'),
  
  
  // DeFi components
  DeFiDashboard: () => import('@/components/defi/DeFiDashboard'),
  StakingDashboard: () => import('@/components/staking/StakingDashboard')
};

// Data fetching optimization
export const createDataCache = <T>(ttl: number = 5 * 60 * 1000) => {
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return {
    get: (key: string): T | null => {
      const entry = cache.get(key);
      if (!entry) return null;
      
      if (Date.now() - entry.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      
      return entry.data;
    },
    set: (key: string, data: T) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    clear: () => cache.clear(),
    delete: (key: string) => cache.delete(key)
  };
};

// Debounce utility for frequent updates
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory management for real-time data
export const createRealTimeDataManager = <T>(maxItems: number = 1000) => {
  let data: T[] = [];
  
  return {
    add: (item: T) => {
      data.push(item);
      if (data.length > maxItems) {
        data = data.slice(-maxItems);
      }
    },
    get: () => data,
    clear: () => { data = []; },
    size: () => data.length
  };
};

// Image optimization utility
export const optimizeImage = (src: string, width?: number, height?: number, quality: number = 80) => {
  if (!src) return src;
  
  // If it's already a data URL or external URL, return as is
  if (src.startsWith('data:') || src.startsWith('http')) return src;
  
  // For local images, we can add query parameters for optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  return `${src}?${params.toString()}`;
};

// Preload critical resources
export const preloadResource = (href: string, as: string = 'fetch', crossorigin?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

import React from 'react';