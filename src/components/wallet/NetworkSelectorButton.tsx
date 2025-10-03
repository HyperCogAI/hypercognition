import { GradientBorderButton } from "./GradientBorderButton"
import { useNetworkSelector } from "@/hooks/useNetworkSelector"
import { Network } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const NetworkSelectorButton = () => {
  const { selectedNetwork, setNetwork } = useNetworkSelector()

  const networkLabel = selectedNetwork === 'evm' ? 'EVM' : 'Solana'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <GradientBorderButton className="w-[130px] justify-center">
            <Network className="h-4 w-4 text-white" />
            <span className="text-white">{networkLabel}</span>
          </GradientBorderButton>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-black/60 border-white/20 backdrop-blur-md">
        <DropdownMenuItem 
          onClick={() => setNetwork('evm')}
          className="text-white hover:bg-white/10 focus:bg-white/10"
        >
          <Network className="h-4 w-4 mr-2" />
          EVM Networks
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setNetwork('solana')}
          className="text-white hover:bg-white/10 focus:bg-white/10"
        >
          <Network className="h-4 w-4 mr-2" />
          Solana
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
