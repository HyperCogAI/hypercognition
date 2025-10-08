// Service worker registration and management
interface ServiceWorkerConfig {
  swUrl?: string;
  enablePeriodicSync?: boolean;
  enableBackgroundSync?: boolean;
  enablePushNotifications?: boolean;
  updateCheckInterval?: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      swUrl: '/sw.js',
      enablePeriodicSync: true,
      enableBackgroundSync: true,
      enablePushNotifications: true,
      updateCheckInterval: 60000, // 1 minute
      ...config
    };
  }

  // Register service worker
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swUrl!,
        { scope: '/' }
      );

      console.log('Service Worker registered successfully');

      // Set up event listeners
      this.setupEventListeners();

      // Enable additional features
      if (this.config.enablePeriodicSync) {
        await this.enablePeriodicSync();
      }

      if (this.config.enablePushNotifications) {
        await this.enablePushNotifications();
      }

      // Check for updates periodically
      this.startUpdateCheck();

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.onUpdateAvailable();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.onNetworkStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.onNetworkStatusChange(false);
    });
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.payload);
        break;
      case 'SYNC_COMPLETED':
        console.log('Background sync completed:', data.payload);
        break;
      case 'OFFLINE_FALLBACK':
        this.showOfflineNotification();
        break;
    }
  }

  // Enable periodic background sync
  private async enablePeriodicSync(): Promise<void> {
    if (!this.registration || !('periodicSync' in this.registration)) {
      console.warn('Periodic Background Sync not supported');
      return;
    }

    try {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' as any });
      
      if (status.state === 'granted') {
        // Register periodic sync for portfolio updates
        await (this.registration as any).periodicSync.register('portfolio-update', {
          minInterval: 15 * 60 * 1000 // 15 minutes
        });

        // Register periodic sync for market data
        await (this.registration as any).periodicSync.register('market-data-update', {
          minInterval: 5 * 60 * 1000 // 5 minutes
        });

        console.log('Periodic Background Sync registered');
      }
    } catch (error) {
      console.error('Periodic Background Sync registration failed:', error);
    }
  }

  // Enable push notifications
  private async enablePushNotifications(): Promise<void> {
    if (!this.registration || !('PushManager' in window)) {
      console.warn('Push Notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const vapidKey = this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        );
        const subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey.buffer as ArrayBuffer
        });

        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
        console.log('Push Notifications enabled');
      }
    } catch (error) {
      console.error('Push Notification setup failed:', error);
    }
  }

  // Start checking for updates
  private startUpdateCheck(): void {
    setInterval(() => {
      if (this.registration) {
        this.registration.update();
      }
    }, this.config.updateCheckInterval);
  }

  // Handle update available
  private onUpdateAvailable(): void {
    // Show update notification to user
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #1f2937;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        <span>A new version is available!</span>
        <button id="update-app" style="
          margin-left: 16px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Update Now</button>
        <button id="dismiss-update" style="
          margin-left: 8px;
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Handle update button click
    document.getElementById('update-app')?.addEventListener('click', () => {
      this.activateUpdate();
      document.body.removeChild(updateBanner);
    });

    // Handle dismiss button click
    document.getElementById('dismiss-update')?.addEventListener('click', () => {
      document.body.removeChild(updateBanner);
    });
  }

  // Activate service worker update
  private activateUpdate(): void {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Handle network status changes
  private onNetworkStatusChange(isOnline: boolean): void {
    if (isOnline) {
      // Trigger background sync when coming back online
      this.triggerBackgroundSync();
      this.hideOfflineNotification();
    } else {
      this.showOfflineNotification();
    }
  }

  // Trigger background sync
  async triggerBackgroundSync(): Promise<void> {
    if (!this.registration || !('sync' in this.registration)) {
      console.warn('Background Sync not supported');
      return;
    }

    try {
      await (this.registration as any).sync.register('portfolio-sync');
      await (this.registration as any).sync.register('trading-sync');
      console.log('Background sync triggered');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Show offline notification
  private showOfflineNotification(): void {
    const existing = document.getElementById('offline-notification');
    if (existing) return;

    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
      ">
        📡 You're offline. Changes will sync when connection is restored.
      </div>
    `;

    document.body.appendChild(notification);
  }

  // Hide offline notification
  private hideOfflineNotification(): void {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      document.body.removeChild(notification);
    }
  }

  // Send push subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Utility function for VAPID key conversion
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Cache management
  async clearCache(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ name: string; size: number }[]> {
    const cacheNames = await caches.keys();
    const stats = [];

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      let size = 0;
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
        }
      }

      stats.push({ name, size });
    }

    return stats;
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker management
export const useServiceWorker = () => {
  const register = () => serviceWorkerManager.register();
  const unregister = () => serviceWorkerManager.unregister();
  const clearCache = () => serviceWorkerManager.clearCache();
  const getCacheStats = () => serviceWorkerManager.getCacheStats();
  const triggerSync = () => serviceWorkerManager.triggerBackgroundSync();

  return {
    register,
    unregister,
    clearCache,
    getCacheStats,
    triggerSync,
    isSupported: 'serviceWorker' in navigator
  };
};