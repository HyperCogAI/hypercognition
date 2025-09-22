import { useState } from "react"
import { Home, TrendingUp, Wallet, Plus, Settings, BarChart3, Users, Star, Menu, Zap, Bot, FileText, ExternalLink, Store, Bell, Activity, Target, Share2, ListOrdered, Shield, LineChart, Building2, Scale, ArrowLeftRight, HelpCircle, DollarSign, Coins } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import hyperCognitionLogo from "@/assets/hyper-cognition-logo.png"
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
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Create Agent", url: "/create-agent", icon: Plus },
]

// Trading and investment items
const tradingItems = [
  { title: "Multi-Exchange", url: "/multi-exchange", icon: ArrowLeftRight },
  { title: "Enhanced Trading", url: "/enhanced-trading", icon: TrendingUp },
  { title: "Advanced Trading", url: "/advanced-trading", icon: Target },
  { title: "Live Trading", url: "/real-time-market", icon: Activity },
  { title: "Social Trading", url: "/social-trading", icon: Share2 },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
  { title: "Order Management", url: "/order-management", icon: ListOrdered },
]

// DeFi and crypto features
const defiItems = [
  { title: "DeFi", url: "/defi", icon: Coins },
  { title: "NFT Marketplace", url: "/nft-marketplace", icon: Users },
  { title: "Staking", url: "/staking", icon: Shield },
  { title: "Referrals", url: "/referrals", icon: Star },
]

// Analytics and management
const analyticsItems = [
  { title: "Advanced Analytics", url: "/advanced-analytics", icon: BarChart3 },
  { title: "Risk Management", url: "/risk-management", icon: Shield },
  { title: "Technical Analysis", url: "/technical-analysis", icon: LineChart },
  { title: "Notifications", url: "/advanced-notifications", icon: Bell },
]

// Community and social features  
const communityItems = [
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Compare", url: "/compare", icon: BarChart3 },
  { title: "Communities", url: "/communities", icon: Users },
]

// Professional and enterprise features
const professionalItems = [
  { title: "Institutional", url: "/institutional", icon: Building2 },
  { title: "Compliance", url: "/compliance", icon: Scale },
  { title: "Customer Support", url: "/customer-support", icon: HelpCircle },
]

const resourceItems = [
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
    isActive ? "text-primary border-r-2 border-primary shadow-lg shadow-primary/20" : "transition-all duration-300 text-muted-foreground"

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/30"
    >
      <SidebarContent className="bg-card border-r border-border/30 shadow-2xl">
        {/* Logo */}
        <div className="p-4 border-b border-border/30 bg-background">
          <div className="flex items-center justify-start pl-2">
            <img 
              src={hyperCognitionLogo} 
              alt="HyperCognition Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* User Menu Section */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <UserMenu />
            <NotificationCenter />
          </div>
        </div>

        {/* Core Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Core"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Trading Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Trading"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* DeFi & Crypto Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "DeFi & Crypto"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {defiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Analytics"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Community"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-foreground">{item.title}</span>
                          {item.title === "Favorites" && (
                            <Badge variant="secondary" className="text-xs bg-accent/20 border-accent/30 text-accent-foreground">
                              3
                            </Badge>
                          )}
                        </div>
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
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Professional"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {professionalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Resources"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group text-muted-foreground"
                      >
                        <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-foreground">{item.title}</span>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </div>
                        )}
                      </a>
                    ) : (
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                      >
                        <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        {!isCollapsed && <span className="font-medium text-foreground">{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Assistant CTA */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <CyberButton variant="neon" className="w-full group" asChild>
              <NavLink to="/ai-assistant">
                <Bot className="h-4 w-4 text-white" />
                <span className="text-white">AI Assistant</span>
              </NavLink>
            </CyberButton>
          </div>
        )}

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-border/30 bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive ? 'bg-[hsl(var(--sidebar-active))]' : ''}` }
                    >
                      <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      {!isCollapsed && <span className="font-medium text-foreground">Settings</span>}
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