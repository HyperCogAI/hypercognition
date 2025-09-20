import { Github, Twitter, MessageCircle, ExternalLink, FileText, X } from "lucide-react"
import hyperCognitionLogo from "../../assets/hyper-cognition-logo.png"

export const Footer = () => {
  return (
    <footer className="bg-card/20 border-t border-border/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div className="space-y-4">
            <img 
              src={hyperCognitionLogo} 
              alt="HyperCognition"
              className="h-8 w-auto"
            />
            <div className="flex gap-3 mt-6">
              <a 
                href="https://x.com/HyperCogAI" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 text-muted-foreground hover:text-accent fill-current" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                  <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
                </svg>
              </a>
              <a 
                href="https://t.me/Donut_Swap" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="Telegram"
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
              <a 
                href="https://whitepaper.hypercognition.io/hypercognition/" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="Documentation"
              >
                <FileText className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Product</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                AI Agents
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Trading Platform
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Analytics
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Marketplace
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Resources</h4>
            <div className="space-y-2">
              <a href="https://whitepaper.hypercognition.io/hypercognition/" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                API Reference
              </a>
              <a href="https://whitepaper.hypercognition.io/hypercognition/" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Tutorials
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Community
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <div className="space-y-2">
              <a href="/privacy" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Terms of Service
              </a>
              <a href="/cookies" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Cookie Policy
              </a>
              <a href="/contact" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 HyperCognition. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">Built with <span className="text-blue-400">💙</span> for the DeFi community</span>
          </div>
        </div>
      </div>
    </footer>
  )
}