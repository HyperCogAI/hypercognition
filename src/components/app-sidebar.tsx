import { useState } from "react"
import { Home, TrendingUp, Wallet, Plus, Settings, BarChart3, Users, Star, Menu, Zap, Bot, FileText, ExternalLink, Store, Bell, Activity, Target, Share2, ListOrdered, Shield, LineChart, Building2, Scale, ArrowLeftRight, HelpCircle, DollarSign, Coins, Sparkles, BookOpen, Globe, Package, Tags, Crown, Briefcase, GraduationCap, Lock, CreditCard, Layers, UserCog, TrendingDown } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import newLogo from "@/assets/HyperCognition6b.png"
import { LogoCutout } from "@/components/LogoCutout"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { CyberButton } from "@/components/ui/cyber-button"
import { UserMenu } from "@/components/UserMenu"
import { NotificationCenter } from "@/components/ui/notification-center"

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

// Core navigation items
const coreItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "AI Assistant", url: "/ai-assistant", icon: Zap },
  { title: "Create Agent", url: "/create-agent", icon: Plus },
  { title: "ACP", url: "/acp", icon: Bot },
  { title: "Admin", url: "/admin", icon: UserCog },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
]

// Trading and investment items
const tradingItems = [
  { title: "Market Overview", url: "/market-overview", icon: TrendingUp },
  { title: "Trading Signals", url: "/trading-signals", icon: Target },
  { title: "Prediction Markets", url: "/prediction-markets", icon: Scale },
  { title: "X Signals", url: "/alpha-signals", icon: XLogo },
  { title: "Telegram Signals", url: "/telegram-signals", icon: TelegramIcon },
]

// DeFi and crypto features
const defiItems = [
  { title: "DeFi", url: "/defi", icon: Coins },
  { title: "Solana", url: "/solana", icon: SolanaLogo },
  { title: "Staking", url: "/staking", icon: Layers },
]

// Analytics and management
const analyticsItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "KOL Analytics", url: "/kol-analytics", icon: TrendingDown },
  { title: "Compare", url: "/compare", icon: ArrowLeftRight },
]

// Community and social features  
const communityItems = [
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Community", url: "/community", icon: Users },
  { title: "Social Trading", url: "/social-trading", icon: Share2 },
]

// Professional and enterprise features
const professionalItems = [
  { title: "Enhanced Trading", url: "/enhanced-trading", icon: TrendingUp },
  { title: "Advanced Trading", url: "/advanced-trading", icon: Target },
  { title: "Order Management", url: "/order-management", icon: ListOrdered },
  { title: "Risk Management", url: "/risk-management", icon: Shield },
  { title: "Technical Analysis", url: "/technical-analysis", icon: LineChart },
  { title: "Advanced AI", url: "/advanced-ai", icon: Bot },
  { title: "Enhanced Features", url: "/enhanced-features", icon: Sparkles },
]

const resourceItems = [
  { title: "Tutorials", url: "/tutorials", icon: BookOpen },
  { title: "Multi Language", url: "/multi-language", icon: Globe },
  { title: "Customer Support", url: "/customer-support", icon: HelpCircle },
  { title: "Premium", url: "/premium", icon: Crown },
  { title: "Referrals", url: "/referrals", icon: Star },
  { title: "Contact", url: "/contact", icon: HelpCircle },
  { title: "Docs", url: "https://whitepaper.hypercognition.io/hypercognition/", icon: FileText, external: true },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-white font-semibold" : "transition-all duration-300 text-muted-foreground/40 hover:bg-transparent hover:text-foreground"

  return (
    <Sidebar
      collapsible="icon"
      className="border-border/30"
    >
      <SidebarContent className="bg-background">
        {/* Logo */}
        <div className={`border-b border-border/30 bg-background ${isCollapsed ? 'p-2 flex justify-center' : 'p-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-4'}`}>
            <LogoCutout 
              src={newLogo}
              alt="HyperCognition Logo"
              className={isCollapsed ? 'h-8' : 'h-12'}
            />
          </div>
        </div>


        {/* Core Navigation */}
        <SidebarGroup className="mb-6 mt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-3`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Core</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                       className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={3} />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Trading Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Trading</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={item.icon === TelegramIcon ? undefined : 3} />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* DeFi & Crypto Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">DEFI</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {defiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={item.icon === SolanaLogo ? undefined : 3} />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Analytics</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={3} />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Community</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={3} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{item.title}</span>
                              {/* TODO: Add dynamic favorites count when backend is implemented */}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Professional Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Professional</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {professionalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300`} strokeWidth={3} />
                          {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources Section */}
        <SidebarGroup className="mb-6 border-t border-border/30 pt-6">
          <SidebarGroupLabel className={`${isCollapsed ? 'px-4' : 'px-3'} flex items-center justify-start mb-2`}>
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-card/90 border border-primary/10 rounded-full px-2.5 py-0.5 shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">Resources</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    {item.external ? (
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${getNavCls({ isActive: false })} visited:text-muted-foreground hover:visited:text-foreground flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent`}
                      >
                        <item.icon className="h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300" strokeWidth={3} />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{item.title}</span>
                            <ExternalLink className="h-3 w-3 opacity-100 transition-all duration-300 group-hover/menu:scale-110" strokeWidth={3} />
                          </div>
                        )}
                      </a>
                    ) : (
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu data-[active=true]:bg-transparent active:bg-transparent` }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className="h-4 w-4 opacity-100 group-hover/menu:scale-110 transition-all duration-300" strokeWidth={3} />
                            {!isCollapsed && <span className="font-medium">{item.title}</span>}
                          </>
                        )}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* Settings at bottom */}
        <div className="mt-auto border-t border-border/30 bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/settings')}>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/menu` }
                    >
                      {({ isActive }) => (
                        <>
                          <Settings className="h-4 w-4 opacity-100 group-hover/menu:rotate-90 transition-all duration-300" strokeWidth={3} />
                          {!isCollapsed && <span className="font-medium">Settings</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}