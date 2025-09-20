import { useState } from "react"
import { CyberButton } from "@/components/ui/cyber-button"
import { WalletButton } from "@/components/wallet/WalletButton"
import { Menu, X, Bot, Zap } from "lucide-react"
import hyperCognitionLogo from "@/assets/hyper-cognition-logo.png"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Trade", href: "#trade" },
    { name: "AI Bots", href: "#bots" },
    { name: "ACP", href: "/acp" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Analytics", href: "#analytics" },
    { name: "Docs", href: "#docs" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={hyperCognitionLogo} 
              alt="HyperCognition" 
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <CyberButton variant="neon" className="group" asChild>
              <a href="/acp">
                <Bot className="h-4 w-4 text-white" />
                <span className="text-white">Assistant</span>
              </a>
            </CyberButton>
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
                <div className="w-full">
                  <WalletButton />
                </div>
                <CyberButton variant="cyber" className="w-full justify-start group">
                  <Bot className="h-4 w-4" />
                  Launch App
                </CyberButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}