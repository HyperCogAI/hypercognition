import { useEffect, useRef, useState } from 'react'

interface SwipeGesturesProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
  disabled?: boolean
}

export const MobileSwipeGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  disabled = false
}: SwipeGesturesProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const threshold = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    const touch = e.touches[0]
    setStartPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return
    const touch = e.touches[0]
    setCurrentPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    if (disabled) return
    
    const deltaX = currentPos.x - startPos.x
    const deltaY = currentPos.y - startPos.y
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }
  }

  return (
    <div
      ref={elementRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: disabled ? 'auto' : 'pan-y' }}
    >
      {children}
    </div>
  )
}

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '' 
}: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)
  const threshold = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setStartPos({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.x
    setOffset(deltaX * 0.5) // Dampen the movement
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
    
    setIsDragging(false)
    setOffset(0)
  }

  return (
    <div
      ref={elementRef}
      className={`transition-transform duration-150 ${className}`}
      style={{
        transform: `translateX(${offset}px)`,
        opacity: isDragging ? 0.8 : 1
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}