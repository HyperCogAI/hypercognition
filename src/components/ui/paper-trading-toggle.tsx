import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface PaperTradingToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function PaperTradingToggle({ enabled, onToggle, className }: PaperTradingToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Switch
          id="paper-trading"
          checked={enabled}
          onCheckedChange={onToggle}
        />
        <Label htmlFor="paper-trading" className="text-sm font-medium">
          Paper Trading
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                Practice trading with virtual funds. All trades are simulated and won't affect real balances.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {enabled && (
        <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
          DEMO MODE
        </Badge>
      )}
    </div>
  )
}