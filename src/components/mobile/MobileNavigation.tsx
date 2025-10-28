import React from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Menu, Home, TrendingUp, Star, User, BarChart3, Brain, Store, Plus, Wallet, 
  Target, Coins, Sparkles, Lock, Layers, Bell, Users, GraduationCap, 
  ArrowLeftRight, Activity, Share2, ListOrdered, Shield, LineChart, 
  Building2, Scale, Package, Globe, Settings, HelpCircle, Crown, FileText,
  Bot, UserCog, Zap, Briefcase, BookOpen, TrendingDown, MessageCircle
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHaptics } from '@/hooks/useHaptics'
import { cn } from '@/lib/utils'
import hyperLogo from '@/assets/hyper-cognition-logo-large.png'

// Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="scale(1.1)">
      <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
    </g>
  </svg>
)

// X Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Solana Logo Component
const SolanaLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 397.7 311.7"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="scale(0.9)">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
    </g>
  </svg>
)

// Core navigation items for bottom bar
const bottomNavItems = [
  { icon: Home, label: 'Home', path: '/', id: 'home' },
  { icon: Store, label: 'Market', path: '/marketplace', id: 'marketplace' },
  { icon: Plus, label: 'Create', path: '/create-agent', id: 'create-agent' },
  { icon: TrendingUp, label: 'Trading', path: '/market-overview', id: 'trading' },
]

// All navigation items organized by category (matching desktop sidebar exactly)
const navigationSections = [
  {
    title: "Core",
    items: [
      { icon: Home, label: 'Home', path: '/', id: 'home' },
      { icon: Store, label: 'Marketplace', path: '/marketplace', id: 'marketplace' },
      { icon: Zap, label: 'AI Assistant', path: '/ai-assistant', id: 'ai-assistant' },
      { icon: Plus, label: 'Create Agent', path: '/create-agent', id: 'create-agent' },
      { icon: Bot, label: 'ACP', path: '/acp', id: 'acp' },
      { icon: UserCog, label: 'Admin', path: '/admin', id: 'admin' },
      { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
      { icon: Wallet, label: 'Portfolio', path: '/portfolio', id: 'portfolio' },
    ]
  },
  {
    title: "Trading",
    items: [
      { icon: TrendingUp, label: 'Market Overview', path: '/market-overview', id: 'market-overview' },
      { icon: Target, label: 'Trading Signals', path: '/trading-signals', id: 'trading-signals' },
      { icon: Scale, label: 'Prediction Markets', path: '/prediction-markets', id: 'prediction-markets' },
      { icon: XLogo, label: 'X Signals', path: '/alpha-signals', id: 'alpha-signals' },
      { icon: TelegramIcon, label: 'Telegram Signals', path: '/telegram-signals', id: 'telegram-signals' },
    ]
  },
  {
    title: "DeFi",
    items: [
      { icon: Coins, label: 'DeFi', path: '/defi', id: 'defi' },
      { icon: SolanaLogo, label: 'Solana', path: '/solana', id: 'solana' },
      { icon: Lock, label: 'Solana Staking', path: '/solana-staking', id: 'solana-staking' },
      { icon: Layers, label: 'Staking', path: '/staking', id: 'staking' },
    ]
  },
  {
    title: "Analytics",
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics', id: 'analytics' },
      { icon: TrendingDown, label: 'KOL Analytics', path: '/kol-analytics', id: 'kol-analytics' },
      { icon: BarChart3, label: 'Compare', path: '/compare', id: 'compare' },
    ]
  },
  {
    title: "Community",
    items: [
      { icon: Star, label: 'Favorites', path: '/favorites', id: 'favorites' },
      { icon: Users, label: 'Community', path: '/community', id: 'community' },
      { icon: Share2, label: 'Social Trading', path: '/social-trading', id: 'social-trading' },
    ]
  },
  {
    title: "Professional",
    items: [
      { icon: ArrowLeftRight, label: 'Multi-Exchange', path: '/multi-exchange', id: 'multi-exchange' },
      { icon: Target, label: 'Advanced Trading', path: '/advanced-trading', id: 'advanced-trading' },
      { icon: ListOrdered, label: 'Order Management', path: '/order-management', id: 'order-management' },
      { icon: Shield, label: 'Risk Management', path: '/risk-management', id: 'risk-management' },
      { icon: LineChart, label: 'Technical Analysis', path: '/technical-analysis', id: 'technical-analysis' },
      { icon: Bot, label: 'Advanced AI', path: '/advanced-ai', id: 'advanced-ai' },
      { icon: Sparkles, label: 'Enhanced Features', path: '/enhanced-features', id: 'enhanced-features' },
    ]
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, label: 'Tutorials', path: '/tutorials', id: 'tutorials' },
      { icon: Globe, label: 'Multi Language', path: '/multi-language', id: 'multi-language' },
      { icon: HelpCircle, label: 'Customer Support', path: '/customer-support', id: 'customer-support' },
      { icon: Crown, label: 'Premium', path: '/premium', id: 'premium' },
      { icon: Star, label: 'Referrals', path: '/referrals', id: 'referrals' },
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
        <div className="flex items-center justify-around h-14 px-2">
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
                  "flex flex-col items-center gap-1 h-12 flex-1 px-2 py-1.5",
                  "text-xs font-medium transition-all duration-200",
                  active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
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
                  "flex flex-col items-center gap-1 h-12 flex-1 px-2 py-1.5",
                  "text-xs font-medium transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                <span className="text-[10px] leading-none font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[100vh] rounded-none bg-background/98 backdrop-blur-md border-none">
              <SheetHeader className="pb-6 border-b border-border/20">
                <SheetTitle className="flex items-center justify-center">
                  <img src={hyperLogo} alt="HyperCognition" className="h-10 w-auto" />
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-full pr-2">
                <div className="space-y-10 py-6 px-4">
                  {navigationSections.map((section) => (
                    <div key={section.title} className="space-y-6">
                      <div className="flex items-center justify-center px-4 mb-4">
                        <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-4 py-1.5 shadow-sm">
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            {section.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 px-2">
                        {section.items.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.path)
                          
                          return (
                            <Button
                              key={item.id}
                              variant={"ghost"}
                              onClick={() => handleNavigation(item.path)}
                              className={cn(
                                "h-16 flex flex-col gap-2 p-4 transition-all duration-200 text-sm",
                                "hover:scale-[1.02] hover:shadow-lg border-2 hover:bg-gray-800/60 hover:text-foreground",
                                "rounded-xl bg-gray-900/50 backdrop-blur-sm border-gray-800",
                                "focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
                                active && "text-white shadow-xl scale-[1.02] bg-gray-800/80 border-gray-600"
                              )}
                            >
                              <Icon className="h-5 w-5 mb-1" />
                              <span className="text-xs font-semibold text-center leading-tight px-1">{item.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                      
                      {section.title !== "Resources" && (
                        <Separator className="opacity-30 my-8" />
                      )}
                    </div>
                  ))}
                  
                  {/* Bottom padding for safe area */}
                  <div className="h-8" />
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