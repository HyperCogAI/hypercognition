import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  showControls?: boolean
}

export function InteractiveVideo({ 
  src, 
  poster, 
  className, 
  autoPlay = true, 
  loop = true, 
  muted = true,
  showControls = true 
}: InteractiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [isHovered, setIsHovered] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    return () => video.removeEventListener('timeupdate', updateProgress)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * video.duration
    video.currentTime = newTime
  }

  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-xl bg-black shadow-2xl",
        "transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Play/Pause Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-black/20 backdrop-blur-sm",
          "opacity-0 transition-all duration-300 cursor-pointer",
          (isHovered || !isPlaying) && "opacity-100"
        )}
        onClick={togglePlay}
      >
        <div className="p-4 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors">
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showControls && (
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 bg-white/20",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Control Bar */}
      {showControls && (
        <div 
          className={cn(
            "absolute bottom-4 left-4 right-4 flex items-center justify-between",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 text-white" />
            ) : (
              <Maximize className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Hover Effects */}
      <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-primary/50 transition-all duration-300 rounded-xl" />
    </div>
  )
}