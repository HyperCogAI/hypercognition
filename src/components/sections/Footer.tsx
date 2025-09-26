import { Github, Twitter, MessageCircle, ExternalLink, FileText, X } from "lucide-react"
import { Link } from "react-router-dom"
import hyperCognitionLogo from "../../assets/hyper-cognition-logo.png"

export const Footer = () => {
  return (
    <footer className="bg-card/20 border-t border-border/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={hyperCognitionLogo} 
                alt="HyperCognition" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold text-white">HyperCognition</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Advanced AI-powered trading platform for the next generation of traders and investors.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://twitter.com/hypercognition" 
                className="w-8 h-8 bg-card/40 rounded-lg flex items-center justify-center hover:bg-accent/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </a>
              <a 
                href="https://github.com/hypercognition" 
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

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Platform</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Trading
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Social Trading
              </a>
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Portfolio
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
              <Link to="/tutorials" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Learning Hub
              </Link>
              <Link to="/trading-academy" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Trading Academy
              </Link>
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
              <a href="#" className="block text-muted-foreground hover:text-accent transition-colors text-sm">
                Compliance
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 HyperCognition. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-accent transition-colors">
                Status
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Security
              </a>
              <a href="https://whitepaper.hypercognition.io/hypercognition/" className="hover:text-accent transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}