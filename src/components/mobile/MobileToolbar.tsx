import { Button } from '@/components/ui/button'
import { Search, Bell, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import logoUrl from '@/assets/hypercognition-new-logo.png'

export const MobileToolbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border/50 pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img 
            src={logoUrl} 
            alt="HyperCognition logo" 
            className="h-8 w-auto mix-blend-normal"
          />
        </div>

        {/* Actions on the right */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/20">
            <Search className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/20">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[10px] bg-destructive text-destructive-foreground border-0 flex items-center justify-center">3</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/20">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}