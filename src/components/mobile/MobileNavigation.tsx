import React from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Menu, Home, TrendingUp, Star, User, BarChart3, Brain, Store, Plus, Wallet, 
  Target, Coins, Sparkles, Lock, Layers, Bell, Users, GraduationCap, 
  ArrowLeftRight, Activity, Share2, ListOrdered, Shield, LineChart, 
  Building2, Scale, Package, Globe, Settings, HelpCircle, Crown, FileText
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHaptics } from '@/hooks/useHaptics'
import { cn } from '@/lib/utils'

// Core navigation items for bottom bar
const bottomNavItems = [
  { icon: Home, label: 'Home', path: '/', id: 'home' },
  { icon: Store, label: 'Market', path: '/marketplace', id: 'marketplace' },
  { icon: Plus, label: 'Create', path: '/create-agent', id: 'create-agent' },
  { icon: TrendingUp, label: 'Trading', path: '/enhanced-trading', id: 'trading' },
]

// All navigation items organized by category
const navigationSections = [
  {
    title: "Core",
    items: [
      { icon: Home, label: 'Home', path: '/', id: 'home' },
      { icon: Store, label: 'Marketplace', path: '/marketplace', id: 'marketplace' },
      { icon: Brain, label: 'AI Assistant', path: '/ai-assistant', id: 'ai-assistant' },
      { icon: Plus, label: 'Create Agent', path: '/create-agent', id: 'create-agent' },
    ]
  },
  {
    title: "Trading",
    items: [
      { icon: Wallet, label: 'Portfolio', path: '/portfolio', id: 'portfolio' },
      { icon: Target, label: 'Trading Signals', path: '/trading-signals', id: 'trading-signals' },
      { icon: TrendingUp, label: 'Enhanced Trading', path: '/enhanced-trading', id: 'enhanced-trading' },
      { icon: Activity, label: 'Live Trading', path: '/real-time-market', id: 'live-trading' },
      { icon: Share2, label: 'Social Trading', path: '/social-trading', id: 'social-trading' },
      { icon: ListOrdered, label: 'Order Management', path: '/order-management', id: 'order-management' },
      { icon: ArrowLeftRight, label: 'Multi-Exchange', path: '/multi-exchange', id: 'multi-exchange' },
    ]
  },
  {
    title: "DeFi & Crypto",
    items: [
      { icon: Coins, label: 'DeFi', path: '/defi', id: 'defi' },
      { icon: Sparkles, label: 'Solana', path: '/solana', id: 'solana' },
      { icon: Lock, label: 'Solana Staking', path: '/solana-staking', id: 'solana-staking' },
      { icon: Target, label: 'Solana Signals', path: '/solana-signals', id: 'solana-signals' },
      { icon: Layers, label: 'Staking', path: '/staking', id: 'staking' },
      { icon: Star, label: 'Referrals', path: '/referrals', id: 'referrals' },
    ]
  },
  {
    title: "Analytics",
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics', id: 'analytics' },
      { icon: BarChart3, label: 'Advanced Analytics', path: '/advanced-analytics', id: 'advanced-analytics' },
      { icon: LineChart, label: 'Technical Analysis', path: '/technical-analysis', id: 'technical-analysis' },
      { icon: Shield, label: 'Risk Management', path: '/risk-management', id: 'risk-management' },
      { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
    ]
  },
  {
    title: "Community",
    items: [
      { icon: Star, label: 'Favorites', path: '/favorites', id: 'favorites' },
      { icon: Users, label: 'Community', path: '/community', id: 'community' },
      { icon: GraduationCap, label: 'Trading Academy', path: '/trading-academy', id: 'trading-academy' },
    ]
  },
  {
    title: "Professional",
    items: [
      { icon: Building2, label: 'Institutional', path: '/institutional', id: 'institutional' },
      { icon: Scale, label: 'Compliance', path: '/compliance', id: 'compliance' },
      { icon: Package, label: 'White Label', path: '/white-label', id: 'white-label' },
      { icon: Globe, label: 'Multi Language', path: '/multi-language', id: 'multi-language' },
    ]
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: 'Customer Support', path: '/customer-support', id: 'customer-support' },
      { icon: Crown, label: 'Premium', path: '/premium', id: 'premium' },
      { icon: HelpCircle, label: 'Contact', path: '/contact', id: 'contact' },
      { icon: Settings, label: 'Settings', path: '/settings', id: 'settings' },
    ]
  }
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
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 h-14 flex-1 p-1",
                  "text-xs font-medium transition-all duration-200",
                  active ? "text-primary bg-primary/10 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} />
                <span className="text-[10px] leading-none font-medium">{item.label}</span>
              </Button>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-14 flex-1 p-1",
                  "text-xs font-medium transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                )}
              >
                <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                <span className="text-[10px] leading-none font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[100vh] rounded-none bg-background/98 backdrop-blur-md border-none">
              <SheetHeader className="pb-4 border-b border-border/20">
                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Navigation Menu
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-full pr-4">
                <div className="space-y-8 py-8 px-2">
                  {navigationSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {section.items.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.path)
                          
                          return (
                            <Button
                              key={item.id}
                              variant={active ? "default" : "outline"}
                              onClick={() => handleNavigation(item.path)}
                              className={cn(
                                "h-16 flex flex-col gap-2 transition-all duration-200 text-sm",
                                "hover:scale-[1.02] hover:shadow-md border-2",
                                active && "bg-accent/20 text-foreground shadow-lg shadow-accent/10 scale-[1.02] border-accent/30"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-xs font-semibold text-center leading-tight">{item.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                      
                      {section.title !== "Support" && (
                        <Separator className="opacity-40 my-6" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-16" />
    </>
  )
}