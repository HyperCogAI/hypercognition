// Service Worker for offline functionality and caching
const CACHE_NAME = 'hypercognition-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add critical CSS and JS files
  // These will be dynamically populated during build
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/agents',
  '/api/portfolio',
  '/api/market-data',
  '/api/notifications'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Service Worker event handlers
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('Pre-caching API endpoints...');
        return Promise.allSettled(
          API_ENDPOINTS.map(endpoint => 
            fetch(endpoint).then(response => {
              if (response.ok) {
                return cache.put(endpoint, response);
              }
            }).catch(() => {
              // Ignore failed pre-cache attempts
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installation complete');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activation complete');
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

// Main fetch handler with different strategies
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    // API requests - Network First with fallback
    if (isAPIRequest(url)) {
      return await networkFirstWithFallback(request, API_CACHE);
    }

    // Dynamic content - Stale While Revalidate
    if (isDynamicContent(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }

    // Default - Network First
    return await networkFirst(request, DYNAMIC_CACHE);

  } catch (error) {
    console.error('Fetch handler error:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/offline.html') || 
             new Response('Offline', { status: 503 });
    }
    
    // Return cached version or error response
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Service Unavailable', { status: 503 });
  }
}

// Cache strategies implementation
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request, { 
      timeout: 3000 // 3 second timeout for API requests
    });
    
    if (response.ok) {
      // Cache successful API responses
      await cache.put(request, response.clone());
      return response;
    }
    
    // If response is not ok, try cache
    const cached = await cache.match(request);
    return cached || response;
    
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);
    if (cached) {
      // Add stale indicator header
      const staleResponse = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...cached.headers,
          'X-Cache-Status': 'stale'
        }
      });
      return staleResponse;
    }
    
    // Return mock data for critical API endpoints
    if (request.url.includes('/api/portfolio')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        data: [],
        cached: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignore fetch errors in background
  });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // If no cache, wait for network
  return await fetchPromise;
}

// Helper functions to categorize requests
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.includes('/assets/') ||
         url.pathname.includes('/static/');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.pathname.startsWith('/functions/') ||
         url.hostname.includes('supabase');
}

function isDynamicContent(url) {
  return url.pathname.startsWith('/agent/') ||
         url.pathname.startsWith('/portfolio/') ||
         url.pathname.startsWith('/trading/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'portfolio-sync') {
    event.waitUntil(syncPortfolioData());
  } else if (event.tag === 'trading-sync') {
    event.waitUntil(syncTradingData());
  }
});

// Sync functions
async function syncPortfolioData() {
  try {
    // Get pending portfolio updates from IndexedDB
    const pendingUpdates = await getPendingPortfolioUpdates();
    
    for (const update of pendingUpdates) {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      
      if (response.ok) {
        await removePendingUpdate(update.id);
      }
    }
  } catch (error) {
    console.error('Portfolio sync failed:', error);
  }
}

async function syncTradingData() {
  try {
    // Get pending trading actions from IndexedDB
    const pendingTrades = await getPendingTrades();
    
    for (const trade of pendingTrades) {
      const response = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade)
      });
      
      if (response.ok) {
        await removePendingTrade(trade.id);
      }
    }
  } catch (error) {
    console.error('Trading sync failed:', error);
  }
}

// IndexedDB helpers (placeholder - would need full implementation)
async function getPendingPortfolioUpdates() {
  // Implementation would use IndexedDB to get pending updates
  return [];
}

async function removePendingUpdate(id) {
  // Implementation would remove update from IndexedDB
}

async function getPendingTrades() {
  // Implementation would use IndexedDB to get pending trades
  return [];
}

async function removePendingTrade(id) {
  // Implementation would remove trade from IndexedDB
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'portfolio-update') {
    event.waitUntil(updatePortfolioCache());
  } else if (event.tag === 'market-data-update') {
    event.waitUntil(updateMarketDataCache());
  }
});

async function updatePortfolioCache() {
  try {
    const response = await fetch('/api/portfolio');
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put('/api/portfolio', response);
    }
  } catch (error) {
    console.error('Portfolio cache update failed:', error);
  }
}

async function updateMarketDataCache() {
  try {
    const response = await fetch('/api/market-data');
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put('/api/market-data', response);
    }
  } catch (error) {
    console.error('Market data cache update failed:', error);
  }
}