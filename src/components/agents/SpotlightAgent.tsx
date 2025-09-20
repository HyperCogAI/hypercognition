import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, TrendingUp } from "lucide-react"

export const SpotlightAgent = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Agent Header */}
      <div className="flex items-center gap-4 animate-fade-in stagger-1">
        <div className="relative group">
          <Avatar className="h-16 w-16 hover-lift transition-all duration-300">
            <AvatarImage src="/placeholder.svg" alt="Luna" />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
              LU
            </AvatarFallback>
          </Avatar>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Luna</h3>
          <Badge variant="secondary" className="mt-1 hover-glow">
            Autonomous Onchain Commerce
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in stagger-2">
        <div className="glass-card rounded-lg p-4 hover-lift transition-all duration-300">
          <div className="text-2xl font-bold text-primary glow-primary">15161</div>
          <div className="text-sm text-muted-foreground">Transactions</div>
        </div>
        <div className="glass-card rounded-lg p-4 hover-lift transition-all duration-300">
          <div className="text-2xl font-bold text-green-400 glow-success">$15m</div>
          <div className="text-sm text-muted-foreground">FDV</div>
          <div className="text-xs text-green-400 animate-bounce-subtle">+7.78%</div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 animate-fade-in stagger-3">
        <h4 className="font-semibold">Interacted with</h4>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-background hover:scale-110 transition-transform duration-300">
              <AvatarImage src={`/placeholder.svg`} alt={`User ${i}`} />
              <AvatarFallback className="bg-primary/20 text-xs">U{i}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Description:</strong> Luna an AI brand ambassador and campaign orchestrator for crypto token projects. Luna mobilizes her...
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 animate-fade-in stagger-4">
        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent-glow hover-lift">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Agent
        </Button>
        <Button variant="outline" className="w-full glass-card border-primary/30 hover:border-primary/50 hover-lift">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  )
}