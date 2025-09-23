import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { logPerformance, logComponentError } from '@/lib/structuredLogger'

interface OptimizedVideoProps {
  src: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  poster?: string
  onLoadedData?: () => void
  onError?: () => void
}

export function OptimizedVideo({
  src,
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  controls = false,
  poster,
  onLoadedData,
  onError
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const loadStartTime = useRef<number>(Date.now())

  useEffect(() => {
    loadStartTime.current = Date.now()
  }, [src])

  const handleLoadedData = () => {
    const endTime = Date.now()
    const duration = endTime - loadStartTime.current
    setLoadTime(duration)
    setIsLoaded(true)
    
    logPerformance('video_load_time', duration, 'ms', {
      component: 'OptimizedVideo',
      metadata: { src: src.split('/').pop() }
    })
    
    onLoadedData?.()
  }

  const handleError = (error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setHasError(true)
    const videoError = error.currentTarget.error
    
    logComponentError('OptimizedVideo', new Error(`Video load failed: ${videoError?.message || 'Unknown error'}`), {
      metadata: { 
        src: src.split('/').pop(),
        errorCode: videoError?.code,
        errorMessage: videoError?.message
      }
    })
    
    onError?.()
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleCanPlayThrough = () => {
    // Video can play through without buffering
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(err => {
        logComponentError('OptimizedVideo', err, {
          metadata: { action: 'autoplay', src: src.split('/').pop() }
        })
      })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background via-card to-background z-10">
          <div className="animate-pulse text-center">
            <Play className="h-16 w-16 text-primary/50 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Loading video...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background via-card to-background z-10">
          <div className="text-center">
            <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Play className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-sm text-muted-foreground">Video unavailable</div>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        controls={controls}
        poster={poster}
        preload="metadata"
        onLoadedData={handleLoadedData}
        onError={handleError}
        onCanPlayThrough={handleCanPlayThrough}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom play/pause overlay (when controls are disabled) */}
      {!controls && isLoaded && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors z-20 group"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <Pause className="h-12 w-12 text-white drop-shadow-lg" />
            ) : (
              <Play className="h-12 w-12 text-white drop-shadow-lg" />
            )}
          </div>
        </button>
      )}

      {/* Performance indicator (development only) */}
      {loadTime && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Loaded in {loadTime}ms
        </div>
      )}
    </div>
  )
}