import { useState } from "react"
import { Home, TrendingUp, Wallet, Plus, Settings, BarChart3, Users, Star, Menu, Zap, Bot, FileText, ExternalLink, Store, Bell, Activity, Target, Share2, ListOrdered, Shield, LineChart, Building2, Scale, ArrowLeftRight, HelpCircle, DollarSign, Coins, Sparkles, BookOpen, Globe, Package, Tags, Crown, Briefcase, GraduationCap, Lock, CreditCard, Layers, UserCog } from "lucide-react"
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


// Core navigation items
const coreItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "AI Assistant", url: "/ai-assistant", icon: Zap },
  { title: "Create Agent", url: "/create-agent", icon: Plus },
  { title: "ACP", url: "/acp", icon: Bot },
  { title: "Admin", url: "/admin", icon: UserCog },
]

// Trading and investment items
const tradingItems = [
  { title: "Market Overview", url: "/market-overview", icon: TrendingUp },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
  { title: "Trading Signals", url: "/trading-signals", icon: Target },
]

// DeFi and crypto features
const defiItems = [
  { title: "DeFi", url: "/defi", icon: Coins },
  { title: "Solana", url: "/solana", icon: Coins },
  { title: "Solana Staking", url: "/solana-staking", icon: Lock },
  { title: "Staking", url: "/staking", icon: Layers },
  { title: "Referrals", url: "/referrals", icon: Star },
]

// Analytics and management
const analyticsItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
]

// Community and social features  
const communityItems = [
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Compare", url: "/compare", icon: BarChart3 },
  { title: "Community", url: "/community", icon: Users },
  { title: "Social Trading", url: "/social-trading", icon: Share2 },
]

// Professional and enterprise features
const professionalItems = [
  { title: "Multi-Exchange", url: "/multi-exchange", icon: ArrowLeftRight },
  { title: "Enhanced Trading", url: "/enhanced-trading", icon: TrendingUp },
  { title: "Advanced Trading", url: "/advanced-trading", icon: Target },
  { title: "Order Management", url: "/order-management", icon: ListOrdered },
  { title: "Risk Management", url: "/risk-management", icon: Shield },
  { title: "Technical Analysis", url: "/technical-analysis", icon: LineChart },
  { title: "Advanced AI", url: "/advanced-ai", icon: Bot },
  { title: "Enhanced Features", url: "/enhanced-features", icon: Sparkles },
  { title: "Multi Language", url: "/multi-language", icon: Globe },
]

const resourceItems = [
  { title: "Tutorials", url: "/tutorials", icon: BookOpen },
  { title: "Customer Support", url: "/customer-support", icon: HelpCircle },
  { title: "Premium", url: "/premium", icon: Crown },
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
      className="border-r border-border/30"
    >
      <SidebarContent className="bg-card border-r border-border/30 shadow-2xl">
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Core</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Trading</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">DeFi & Crypto</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Analytics</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Community</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{item.title}</span>
                              {item.title === "Favorites" && (
                                <Badge variant="secondary" className="text-xs bg-accent/20 border-accent/30 text-accent-foreground">
                                  3
                                </Badge>
                              )}
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Professional</span>
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
                          <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 flex items-center justify-start mb-2">
            {isCollapsed ? (
              <span className="text-xs text-muted-foreground">•••</span>
            ) : (
              <div className="bg-gray-900/80 border border-gray-500/40 rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-white tracking-widest uppercase">Resources</span>
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
                        <item.icon className="h-4 w-4 opacity-60 group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{item.title}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 group-hover/menu:opacity-100 transition-all duration-300 group-hover/menu:scale-110" />
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
                            <item.icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:scale-110 transition-all duration-300`} />
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
                          <Settings className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-60'} group-hover/menu:opacity-100 group-hover/menu:rotate-90 transition-all duration-300`} />
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