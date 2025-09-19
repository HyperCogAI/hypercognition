import { useState } from "react"
import { Home, TrendingUp, Wallet, Plus, Settings, BarChart3, Users, Star, Menu, Zap } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
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

const mainItems = [
  { title: "Marketplace", url: "/", icon: Home },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
  { title: "Create Agent", url: "/create-agent", icon: Plus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

const tradingItems = [
  { title: "Trending", url: "/#trending", icon: TrendingUp },
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Communities", url: "/communities", icon: Users },
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
    isActive ? "bg-gradient-to-r from-primary/25 to-secondary/25 text-primary border-r-2 border-primary shadow-lg shadow-primary/20" : "hover:bg-background hover:text-foreground transition-all duration-300 text-muted-foreground"

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/30"
    >
      <SidebarContent className="bg-card border-r border-border/30 shadow-2xl">
        {/* Logo */}
        <div className="p-4 border-b border-border/30 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center glow-primary shadow-lg shadow-primary/30">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  HyperCognition
                </h1>
                <p className="text-xs text-muted-foreground">AI Agent DEX</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Section */}
        {!isCollapsed && (
          <div className="p-4 border-b border-border/30">
            <CyberButton variant="cyber" size="sm" className="w-full justify-start">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </CyberButton>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {isCollapsed ? "•••" : "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group`}
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
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group`}
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-foreground">{item.title}</span>
                          {item.title === "Favorites" && (
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30">
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

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-border/30 bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) => `${getNavCls({ isActive })} flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group`}
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