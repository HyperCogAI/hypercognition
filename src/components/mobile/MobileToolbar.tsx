import { WalletButton } from '@/components/wallet/WalletButton'
import { SolanaWalletButton } from '@/components/wallet/SolanaWalletButton'
import logoUrl from '@/assets/HyperCognition2.png'

// Preload the logo to prevent fuzzy loading
const preloadLogo = new Image()
preloadLogo.src = logoUrl

export const MobileToolbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 border-b border-border/30 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center justify-between pl-4 pr-4">
        {/* Logo on the left */}
        <div className="flex items-center relative">
          <img 
            src={logoUrl} 
            alt="HyperCognition logo" 
            className="h-8 w-auto object-contain will-change-auto"
            style={{ 
              imageRendering: 'crisp-edges',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
              WebkitFontSmoothing: 'antialiased'
            }}
            loading="eager"
            decoding="sync"
            draggable={false}
          />
        </div>

        {/* Wallet buttons on the right */}
        <div className="flex items-center -space-x-2">
          <div className="scale-90">
            <WalletButton />
          </div>
          <div className="scale-90">
            <SolanaWalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}