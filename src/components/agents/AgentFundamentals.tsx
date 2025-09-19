import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface FundamentalAgent {
  id: string
  name: string
  symbol: string
  avatar: string
  buyback: string
  revenue: string
  chain: string
}

interface AgentFundamentalsProps {
  agent: FundamentalAgent
}

export const AgentFundamentals = ({ agent }: AgentFundamentalsProps) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-card/50 rounded-lg transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {agent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Chain indicator */}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full" />
          </div>
        </div>
        <div>
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-muted-foreground">DYOR</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-sm">{agent.buyback}</div>
        <div className="text-xs text-muted-foreground">{agent.revenue}</div>
      </div>
    </div>
  )
}