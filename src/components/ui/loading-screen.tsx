import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import hyperLogo from '@/assets/Hyper_Cognition_logo3large-5.png'
import { Progress } from '@/components/ui/progress'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress from 0 to 100 over 2 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 40)

    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(onComplete, 500) // Allow exit animation to complete
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <img 
                src={hyperLogo} 
                alt="HyperCognition" 
                className="w-40 h-auto md:w-48"
              />
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl rounded-lg" />
            </motion.div>

            {/* Sleek loading bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-64 md:w-80"
            >
              <Progress 
                value={progress} 
                className="h-1 bg-muted/20"
              />
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-muted-foreground text-sm font-medium tracking-wide"
            >
              Initializing HyperCognition...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}