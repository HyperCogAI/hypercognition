import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import hyperLogo from '@/assets/hyper-logo-loading.png'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(onComplete, 500) // Allow exit animation to complete
    }, 2000)

    return () => clearTimeout(timer)
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
                className="w-64 h-auto md:w-80"
              />
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl rounded-lg" />
            </motion.div>

            {/* Loading animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex space-x-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
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