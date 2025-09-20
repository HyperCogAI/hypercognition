import { Github, Twitter, MessageCircle, ExternalLink } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="bg-card/20 border-t border-border/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">HyperCognition</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The future of autonomous AI trading agents for DeFi and cryptocurrency markets.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="Discord"
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
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Cookie Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm flex items-center gap-1">
                Status Page
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 HyperCognition. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">Built with ❤️ for the DeFi community</span>
          </div>
        </div>
      </div>
    </footer>
  )
}