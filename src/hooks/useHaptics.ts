import { useState, useEffect } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

export const useHaptics = () => {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    setIsAvailable(Capacitor.isNativePlatform())
  }, [])

  const lightImpact = async () => {
    if (!isAvailable) return
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  const mediumImpact = async () => {
    if (!isAvailable) return
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  const heavyImpact = async () => {
    if (!isAvailable) return
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  const selectionChanged = async () => {
    if (!isAvailable) return
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  return {
    isAvailable,
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged
  }
}