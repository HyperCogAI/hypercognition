import { useState, useEffect, useRef } from 'react'

interface SwipeDirection {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

interface SwipeOptions {
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
}

interface TouchEventWithTarget extends TouchEvent {
  target: EventTarget & Element
}

export function useSwipe(
  onSwipe: (direction: keyof SwipeDirection) => void,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options

  const [isSwiping, setIsSwiping] = useState(false)
  const touchStart = useRef({ x: 0, y: 0 })
  const touchEnd = useRef({ x: 0, y: 0 })

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    if (e instanceof TouchEvent) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    } else if (trackMouse) {
      touchStart.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
    setIsSwiping(true)
  }

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
    if (!isSwiping) return

    if (e instanceof TouchEvent && e.changedTouches) {
      touchEnd.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }
    } else if (trackMouse && e instanceof MouseEvent) {
      touchEnd.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    const deltaX = touchStart.current.x - touchEnd.current.x
    const deltaY = touchStart.current.y - touchEnd.current.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipe('left')
        } else {
          onSwipe('right')
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipe('up')
        } else {
          onSwipe('down')
        }
      }
    }

    setIsSwiping(false)
  }

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    ...(trackMouse && {
      onMouseDown: handleTouchStart,
      onMouseMove: handleTouchMove,
      onMouseUp: handleTouchEnd,
    }),
  }

  return swipeHandlers
}