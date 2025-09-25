import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WalletButton } from '@/components/wallet/WalletButton'
import { SolanaWalletButton } from '@/components/wallet/SolanaWalletButton'
import logoUrl from '@/assets/HyperCognition2.png'

// Preload the logo to prevent fuzzy loading
const preloadLogo = new Image()
preloadLogo.src = logoUrl

export const MobileToolbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 border-b border-border/50 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img 
            src={logoUrl} 
            alt="HyperCognition logo" 
            className="h-8 w-auto"
            style={{ imageRendering: 'crisp-edges' }}
            loading="eager"
          />
        </div>

        {/* Centered bell notification */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/20">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[10px] bg-destructive text-destructive-foreground border-0 flex items-center justify-center">3</Badge>
          </div>
        </div>

        {/* Wallet buttons on the right */}
        <div className="flex items-center gap-2">
          <div className="scale-75">
            <WalletButton />
          </div>
          <div className="scale-75">
            <SolanaWalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}