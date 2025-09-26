import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack, MobileOptimizedCard } from '@/components/ui/responsive-components'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useShowcaseInteractions } from '@/hooks/useShowcaseInteractions'
import { Smartphone, Tablet, Monitor, Wifi, WifiOff, Battery, Signal } from 'lucide-react'

export function MobileOptimizationShowcase() {
  const deviceInfo = useDeviceDetection()
  const { trackInteraction } = useShowcaseInteractions()

  const handleMobileInteraction = (feature: string) => {
    trackInteraction('mobile-optimization', feature, { deviceInfo })
  }

  return (
    <ResponsiveContainer variant="wide" padding="lg">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-responsive-xl font-bold text-white">Mobile-First Responsive Design</h1>
          <p className="text-responsive text-muted-foreground">
            Experience seamless interaction across all devices
          </p>
        </div>

        {/* Device Information */}
        <MobileOptimizedCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {deviceInfo.isMobile && <Smartphone className="w-5 h-5" />}
              {deviceInfo.isTablet && <Tablet className="w-5 h-5" />}
              {deviceInfo.isDesktop && <Monitor className="w-5 h-5" />}
              Current Device: {deviceInfo.screenSize.toUpperCase()}
            </h3>
            
            <ResponsiveGrid cols={{ mobile: 2, tablet: 3, desktop: 4 }} gap="sm">
              <div className="text-center space-y-1">
                <div className="text-sm font-medium">Platform</div>
                <div className="text-xs text-muted-foreground capitalize">{deviceInfo.platform}</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-medium">Orientation</div>
                <div className="text-xs text-muted-foreground capitalize">{deviceInfo.orientation}</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-medium">Touch</div>
                <div className="text-xs text-muted-foreground">
                  {deviceInfo.touchEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-medium">Native</div>
                <div className="text-xs text-muted-foreground">
                  {deviceInfo.isNative ? 'Yes' : 'No'}
                </div>
              </div>
            </ResponsiveGrid>
          </div>
        </MobileOptimizedCard>

        {/* Responsive Components Demo */}
        <div className="space-y-4">
          <h2 className="text-responsive-lg font-semibold">Responsive Components</h2>
          
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
            <MobileOptimizedCard clickable onClick={() => handleMobileInteraction('touch-optimized')}>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Touch Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  All interactive elements meet the 44px minimum touch target size
                </p>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard clickable onClick={() => handleMobileInteraction('performance-first')}>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Battery className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="font-medium">Performance First</h3>
                <p className="text-sm text-muted-foreground">
                  Reduced animations and optimized rendering for mobile devices
                </p>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard clickable onClick={() => handleMobileInteraction('offline-ready')}>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-medium">Offline Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Progressive enhancement for poor network conditions
                </p>
              </div>
            </MobileOptimizedCard>
          </ResponsiveGrid>
        </div>

        {/* Responsive Stack Demo */}
        <div className="space-y-4">
          <h2 className="text-responsive-lg font-semibold">Adaptive Layouts</h2>
          
          <MobileOptimizedCard>
            <ResponsiveStack 
              direction={{ mobile: 'column', tablet: 'row', desktop: 'row' }}
              align="center" 
              gap="md"
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-medium">Responsive Stack</h3>
                <p className="text-sm text-muted-foreground">
                  This layout automatically adapts: vertical on mobile, horizontal on larger screens.
                </p>
              </div>
              <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                <Button size="sm" className="touch-target" onClick={() => handleMobileInteraction('responsive-button-primary')}>Primary</Button>
                <Button size="sm" variant="outline" className="touch-target" onClick={() => handleMobileInteraction('responsive-button-secondary')}>Secondary</Button>
              </div>
            </ResponsiveStack>
          </MobileOptimizedCard>
        </div>

        {/* Typography Showcase */}
        <div className="space-y-4">
          <h2 className="text-responsive-lg font-semibold">Responsive Typography</h2>
          
          <MobileOptimizedCard>
            <div className="space-y-4">
              <div>
                <h3 className="text-responsive-xl font-bold">Extra Large Heading</h3>
                <p className="text-xs text-muted-foreground">
                  Uses clamp() for fluid scaling: 1.5rem → 5vw → 2.25rem
                </p>
              </div>
              <div>
                <h4 className="text-responsive-lg font-semibold">Large Heading</h4>
                <p className="text-xs text-muted-foreground">
                  Uses clamp() for fluid scaling: 1.125rem → 4vw → 1.5rem
                </p>
              </div>
              <div>
                <p className="text-responsive">Regular responsive text that scales fluidly with viewport width while maintaining readability.</p>
                <p className="text-xs text-muted-foreground">
                  Uses clamp() for fluid scaling: 0.875rem → 2.5vw → 1rem
                </p>
              </div>
            </div>
          </MobileOptimizedCard>
        </div>

        {/* Safe Area Demo */}
        {deviceInfo.isNative && (
          <div className="space-y-4">
            <h2 className="text-responsive-lg font-semibold">Native App Features</h2>
            
            <MobileOptimizedCard>
              <div className="space-y-2">
                <h3 className="font-medium">Safe Area Support</h3>
                <p className="text-sm text-muted-foreground">
                  Content automatically respects device safe areas (notches, home indicators, etc.)
                </p>
                <div className="bg-muted/50 rounded p-2 text-xs font-mono">
                  .safe-area-pb, .safe-area-pt, .safe-area-px
                </div>
              </div>
            </MobileOptimizedCard>
          </div>
        )}
      </div>
    </ResponsiveContainer>
  )
}