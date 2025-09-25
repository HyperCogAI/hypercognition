import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { App as CapacitorApp } from '@capacitor/app'

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web')

  useEffect(() => {
    const checkPlatform = () => {
      const isNativeApp = Capacitor.isNativePlatform()
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      setIsNative(isNativeApp)
      setIsMobile(isMobileDevice || isNativeApp)
      setPlatform(Capacitor.getPlatform() as 'web' | 'ios' | 'android')
    }

    checkPlatform()

    // Set up native app configurations
    if (Capacitor.isNativePlatform()) {
      initializeNativeFeatures()
    }
  }, [])

  const initializeNativeFeatures = async () => {
    try {
      // Configure status bar
      await StatusBar.setOverlaysWebView({ overlay: true })
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#0f0f0f' })

      // Handle keyboard
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open')
      })

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open')
      })

      // Handle app state changes
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App came to foreground
          console.log('App resumed')
        } else {
          // App went to background
          console.log('App paused')
        }
      })

    } catch (error) {
      console.error('Failed to initialize native features:', error)
    }
  }

  return {
    isMobile,
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  }
}