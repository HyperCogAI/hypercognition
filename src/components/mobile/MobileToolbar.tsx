import { Button } from '@/components/ui/button'
import { Search, Bell, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const MobileToolbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-sm border-b border-white/10">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo on the left */}
        <div className="flex items-center gap-2">
          <img 
            src="/src/assets/new-logo.png" 
            alt="HyperCognition" 
            className="h-8 w-auto"
          />
          <span className="font-semibold text-sm text-white">HyperCognition</span>
        </div>

        {/* Actions on the right */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative text-white hover:bg-white/20">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary text-primary-foreground">3</Badge>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}