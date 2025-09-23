// Image optimization utilities
interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export class ImageOptimizer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Convert image to WebP format
  async convertToWebP(
    imageUrl: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    const {
      quality = 0.8,
      width,
      height
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!this.canvas || !this.ctx) {
          reject(new Error('Canvas not available'));
          return;
        }

        const targetWidth = width || img.width;
        const targetHeight = height || img.height;

        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        // Draw and resize image
        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to WebP
        const webpDataUrl = this.canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  // Optimize image file size
  async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      quality = 0.8,
      format = 'webp',
      width,
      height
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        if (!this.canvas || !this.ctx) {
          reject(new Error('Canvas not available'));
          return;
        }

        let targetWidth = width || img.width;
        let targetHeight = height || img.height;

        // Maintain aspect ratio if only one dimension provided
        if (width && !height) {
          targetHeight = (img.height * width) / img.width;
        } else if (height && !width) {
          targetWidth = (img.width * height) / img.height;
        }

        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        this.canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // Create responsive image srcset
  generateResponsiveSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.addImageParams(baseUrl, { width: size })} ${size}w`)
      .join(', ');
  }

  // Add image optimization parameters to URL
  addImageParams(url: string, params: ImageOptimizationOptions): string {
    const urlObj = new URL(url, window.location.origin);
    
    if (params.width) urlObj.searchParams.set('w', params.width.toString());
    if (params.height) urlObj.searchParams.set('h', params.height.toString());
    if (params.quality) urlObj.searchParams.set('q', (params.quality * 100).toString());
    if (params.format) urlObj.searchParams.set('f', params.format);
    if (params.fit) urlObj.searchParams.set('fit', params.fit);

    return urlObj.toString();
  }

  // Preload critical images
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }

  // Lazy load images with intersection observer
  setupLazyLoading(selector: string = '[data-lazy]'): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      document.querySelectorAll(selector).forEach((img) => {
        const element = img as HTMLImageElement;
        if (element.dataset.src) {
          element.src = element.dataset.src;
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Get image format support
  getFormatSupport(): { webp: boolean; avif: boolean } {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return {
      webp: canvas.toDataURL('image/webp').startsWith('data:image/webp'),
      avif: canvas.toDataURL('image/avif').startsWith('data:image/avif')
    };
  }

  // Auto-select best format
  getBestFormat(): 'avif' | 'webp' | 'jpeg' {
    const support = this.getFormatSupport();
    if (support.avif) return 'avif';
    if (support.webp) return 'webp';
    return 'jpeg';
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();

// React hook for image optimization
export const useImageOptimization = () => {
  const optimizeAndUpload = async (
    file: File,
    options?: ImageOptimizationOptions
  ): Promise<string> => {
    try {
      const optimizedBlob = await imageOptimizer.optimizeImage(file, {
        quality: 0.8,
        format: imageOptimizer.getBestFormat(),
        ...options
      });

      // Convert to base64 for upload or storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read optimized image'));
        reader.readAsDataURL(optimizedBlob);
      });
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    }
  };

  return {
    optimizeAndUpload,
    preloadImage: imageOptimizer.preloadImage.bind(imageOptimizer),
    setupLazyLoading: imageOptimizer.setupLazyLoading.bind(imageOptimizer),
    getBestFormat: imageOptimizer.getBestFormat.bind(imageOptimizer)
  };
};