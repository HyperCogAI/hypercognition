import React from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Home, TrendingUp, Star, User, BarChart3, Brain, Store } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHaptics } from '@/hooks/useHaptics'
import { cn } from '@/lib/utils'

const navigationItems = [
  { icon: Home, label: 'Home', path: '/', id: 'home' },
  { icon: Store, label: 'Market', path: '/marketplace', id: 'marketplace' },
  { icon: Brain, label: 'AI Bot', path: '/ai-assistant', id: 'ai-assistant' },
  { icon: TrendingUp, label: 'Trading', path: '/enhanced-trading', id: 'trading' },
  { icon: Star, label: 'Favorites', path: '/favorites', id: 'favorites' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', id: 'analytics' },
  { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
]

export const MobileNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { lightImpact } = useHaptics()
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  if (!isMobile) return null

  const handleNavigation = (path: string) => {
    lightImpact()
    navigate(path)
    setIsSheetOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border/50"
      )}>
        <div className="flex items-center justify-around h-16 px-4">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 h-12 w-12 p-1",
                  "text-xs font-medium",
                  active && "text-primary bg-primary/10"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Button>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-12 w-12 p-1 text-xs font-medium"
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] leading-none">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh] rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <Button
                      key={item.id}
                      variant={active ? "default" : "outline"}
                      onClick={() => handleNavigation(item.path)}
                      className="h-16 flex flex-col gap-2"
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-16" />
    </>
  )
}