import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { CyberButton } from "@/components/ui/cyber-button"
import { UserMenu } from "@/components/UserMenu"
import { WalletSection } from "@/components/wallet/WalletSection"
import { UnifiedWalletButton } from "@/components/wallet/UnifiedWalletButton"
import { NetworkSelectorButton } from "@/components/wallet/NetworkSelectorButton"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Menu, X, Bot, Zap, LogIn } from "lucide-react"
import newLogo from "@/assets/new-logo.png"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading } = useAuth()

  const navItems = [
    { name: "Trade", href: "#trade" },
    { name: "AI Bots", href: "#bots" },
    { name: "Learn", href: "/tutorials" },
    { name: "Academy", href: "/trading-academy" },
    { name: "Community", href: "/community" },
    { name: "Enterprise", href: "/institutional-apis" },
    { name: "Premium", href: "/premium" },
    { name: "Docs", href: "https://whitepaper.hypercognition.io/hypercognition/" },
  ]

  return (
    <nav className="fixed md:relative top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={newLogo} 
              alt="HyperCognition" 
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <ThemeToggle />
            {!isLoading && user && <UserMenu />}
            <div className="flex items-center gap-2">
              <NetworkSelectorButton />
              <UnifiedWalletButton />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/20 py-4 animate-slide-up">
            <div className="space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                {!isLoading && (
                  user ? (
                    <div className="w-full">
                      <WalletSection />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <CyberButton variant="outline" className="w-full justify-start">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </CyberButton>
                      </Link>
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                        <CyberButton variant="neon" className="w-full justify-start">
                          <span className="text-white">Get Started</span>
                        </CyberButton>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}