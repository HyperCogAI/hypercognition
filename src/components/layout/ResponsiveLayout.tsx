import React from 'react'
import { useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileNavigation } from '@/components/mobile/MobileNavigation'
import { Navigation } from '@/components/layout/Navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bell, Search } from 'lucide-react'
import { NetworkSelectorButton } from '@/components/wallet/NetworkSelectorButton'
import { UnifiedWalletButton } from '@/components/wallet/UnifiedWalletButton'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showMobileNav?: boolean
  showBreadcrumb?: boolean
  showPerformanceMonitor?: boolean
}

export function ResponsiveLayout({ 
  children, 
  showSidebar = true, 
  showMobileNav = true,
  showBreadcrumb = true,
  showPerformanceMonitor = process.env.NODE_ENV === 'development'
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()
  const location = useLocation()

  const getBreadcrumbFromPath = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return [{ label: 'Home', href: '/', isLast: true }]

    const breadcrumbs: Array<{ label: string; href: string; isLast?: boolean }> = [{ label: 'Home', href: '/' }]
    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === pathSegments.length - 1
      })
    })

    return breadcrumbs
  }

  // Mobile-first layout without sidebar
  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <img 
                src="/src/assets/new-logo.png" 
                alt="HyperCognition" 
                className="h-8 w-auto"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-hidden">
          <div className="container max-w-screen-2xl p-4 pb-20">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        {showMobileNav && <MobileNavigation />}
        
        {/* Performance Monitor for Development */}
        {showPerformanceMonitor && (
          <div className="fixed bottom-20 right-4 z-40">
            <PerformanceMonitor showDetails={false} className="w-auto" />
          </div>
        )}
      </div>
    )
  }

  // Tablet and Desktop layout with sidebar
  if (showSidebar) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            {/* Desktop Header */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              
              {showBreadcrumb && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {getBreadcrumbFromPath().map((crumb, index) => (
                      <React.Fragment key={crumb.href}>
                        <BreadcrumbItem className="hidden md:block">
                          {crumb.isLast ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.href}>
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < getBreadcrumbFromPath().length - 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}

              <div className="ml-auto flex items-center gap-2">
                {showPerformanceMonitor && (
                  <PerformanceMonitor showDetails={false} />
                )}
                <NetworkSelectorButton />
                <UnifiedWalletButton />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>
            </header>

            {/* Desktop Content */}
            <main className="flex-1 overflow-hidden">
              <div className="container max-w-screen-2xl p-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  // Full-width layout (landing pages, auth, etc.)
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showPerformanceMonitor && (
        <div className="fixed bottom-4 right-4 z-40">
          <PerformanceMonitor showDetails={false} />
        </div>
      )}
    </div>
  )
}