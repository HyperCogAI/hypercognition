import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'
import { Menu, Search, Bell, User, TrendingUp, Wallet, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileOptimizedAppProps {
  children: React.ReactNode
}

export const MobileOptimizedApp = ({ children }: MobileOptimizedAppProps) => {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('trading')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileNavigation onNavigate={() => setIsMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="font-semibold text-sm">HyperCognition</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="flex items-center justify-around py-1.5">
          {[
            { id: 'trading', icon: TrendingUp, label: 'Trading' },
            { id: 'portfolio', icon: Wallet, label: 'Portfolio' },
            { id: 'agents', icon: User, label: 'Agents' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              aria-label={tab.label}
              className={cn(
                "flex flex-col gap-1 h-auto transition-all duration-200",
                activeTab === tab.id ? "py-1 px-2 text-primary bg-primary/15 rounded-full" : "py-2 px-3"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "opacity-100" : "opacity-90")} />
              <span className="text-[11px] leading-none">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}

const MobileNavigation = ({ onNavigate }: { onNavigate: () => void }) => {
  const menuItems = [
    { title: 'Dashboard', href: '/', icon: TrendingUp },
    { title: 'Trading', href: '/trading', icon: TrendingUp },
    { title: 'Portfolio', href: '/portfolio', icon: Wallet },
    { title: 'Agents', href: '/marketplace', icon: User },
    { title: 'Analytics', href: '/analytics', icon: TrendingUp },
    { title: 'Social Trading', href: '/social-trading', icon: User },
    { title: 'Settings', href: '/settings', icon: Settings }
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="py-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      
      <div className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sm"
            onClick={onNavigate}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span className="leading-none">{item.title}</span>
          </Button>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Portfolio</span>
              <span className="font-medium">$12,450</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today's P&L</span>
              <span className="font-medium text-green-600">+$235</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Agents</span>
              <span className="font-medium">4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}