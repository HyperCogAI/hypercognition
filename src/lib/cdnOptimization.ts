// CDN configuration and static asset optimization
interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheHeaders: Record<string, string>;
  compressionEnabled: boolean;
}

interface AssetOptimizationOptions {
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  blur?: number;
  sharpen?: boolean;
}

class CDNManager {
  private config: CDNConfig;
  private preloadedAssets = new Set<string>();

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Generate optimized CDN URL
  getOptimizedUrl(
    assetPath: string,
    options: AssetOptimizationOptions = {}
  ): string {
    const {
      format = 'auto',
      quality = 80,
      width,
      height,
      blur,
      sharpen = false
    } = options;

    const url = new URL(assetPath, this.config.baseUrl);
    
    // Add optimization parameters
    if (format !== 'auto') url.searchParams.set('f', format);
    if (quality !== 80) url.searchParams.set('q', quality.toString());
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (blur) url.searchParams.set('blur', blur.toString());
    if (sharpen) url.searchParams.set('sharpen', '1');

    // Add cache-busting parameter for development
    if (process.env.NODE_ENV === 'development') {
      url.searchParams.set('v', Date.now().toString());
    }

    return url.toString();
  }

  // Generate responsive image srcset
  getResponsiveSrcSet(
    assetPath: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1536],
    options: AssetOptimizationOptions = {}
  ): string {
    return breakpoints
      .map(width => {
        const url = this.getOptimizedUrl(assetPath, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  // Preload critical assets
  preloadAsset(
    assetPath: string,
    type: 'image' | 'font' | 'style' | 'script' = 'image',
    priority: 'high' | 'low' = 'high'
  ): void {
    if (this.preloadedAssets.has(assetPath)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = this.getOptimizedUrl(assetPath);
    link.fetchPriority = priority;

    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'script':
        link.as = 'script';
        break;
    }

    document.head.appendChild(link);
    this.preloadedAssets.add(assetPath);
  }

  // Setup resource hints
  setupResourceHints(): void {
    // DNS prefetch for CDN domain
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = this.config.baseUrl;
    document.head.appendChild(dnsPrefetch);

    // Preconnect to CDN
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = this.config.baseUrl;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
  }

  // Analyze asset performance
  analyzeAssetPerformance(): Promise<PerformanceEntry[]> {
    return new Promise((resolve) => {
      if ('performance' in window) {
        const assets = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const cdnAssets = assets.filter(asset => 
          asset.name.includes(this.config.baseUrl)
        );
        resolve(cdnAssets);
      } else {
        resolve([]);
      }
    });
  }

  // Get optimal CDN region
  getOptimalRegion(): Promise<string> {
    return new Promise(async (resolve) => {
      const fastest = { region: this.config.regions[0], time: Infinity };

      for (const region of this.config.regions) {
        try {
          const start = performance.now();
          await fetch(`${this.config.baseUrl}/health`, { method: 'HEAD' });
          const time = performance.now() - start;
          
          if (time < fastest.time) {
            fastest.region = region;
            fastest.time = time;
          }
        } catch (error) {
          console.warn(`CDN region ${region} unreachable`);
        }
      }

      resolve(fastest.region);
    });
  }

  // Cache management
  setCacheHeaders(element: HTMLElement, cacheTime: number = 86400): void {
    // Set cache-related data attributes for service worker
    element.setAttribute('data-cache-time', cacheTime.toString());
    element.setAttribute('data-cache-strategy', 'cache-first');
  }

  // Critical asset loading strategy
  loadCriticalAssets(): void {
    const criticalAssets = [
      '/images/hero-bg.jpg',
      '/images/logo.png',
      '/fonts/inter-var.woff2'
    ];

    criticalAssets.forEach(asset => {
      const type = asset.includes('/fonts/') ? 'font' : 'image';
      this.preloadAsset(asset, type, 'high');
    });
  }

  // Implement progressive JPEG loading
  setupProgressiveLoading(selector: string = 'img[data-progressive]'): void {
    const images = document.querySelectorAll(selector);
    
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      const originalSrc = element.dataset.src;
      
      if (originalSrc) {
        // Load low-quality placeholder first
        const placeholderUrl = this.getOptimizedUrl(originalSrc, {
          width: 50,
          quality: 20,
          blur: 2
        });

        element.src = placeholderUrl;
        element.style.filter = 'blur(2px)';
        element.style.transition = 'filter 0.3s ease';

        // Load full-quality image
        const fullImg = new Image();
        fullImg.onload = () => {
          element.src = fullImg.src;
          element.style.filter = 'none';
        };
        fullImg.src = this.getOptimizedUrl(originalSrc);
      }
    });
  }
}

// CDN configuration
const cdnConfig: CDNConfig = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.hypercognition.app' 
    : window.location.origin,
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheHeaders: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Cache-Strategy': 'cache-first'
  },
  compressionEnabled: true
};

// Export CDN manager instance
export const cdnManager = new CDNManager(cdnConfig);

// React hook for CDN optimization
export const useCDNOptimization = () => {
  const getOptimizedImageUrl = (
    src: string,
    options?: AssetOptimizationOptions
  ) => {
    return cdnManager.getOptimizedUrl(src, options);
  };

  const getResponsiveImageProps = (
    src: string,
    sizes: string = '100vw',
    options?: AssetOptimizationOptions
  ) => {
    return {
      src: cdnManager.getOptimizedUrl(src, options),
      srcSet: cdnManager.getResponsiveSrcSet(src, undefined, options),
      sizes
    };
  };

  const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
    cdnManager.preloadAsset(src, 'image', priority);
  };

  return {
    getOptimizedImageUrl,
    getResponsiveImageProps,
    preloadImage,
    setupResourceHints: cdnManager.setupResourceHints.bind(cdnManager),
    analyzePerformance: cdnManager.analyzeAssetPerformance.bind(cdnManager)
  };
};