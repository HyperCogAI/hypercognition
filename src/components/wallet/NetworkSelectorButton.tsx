import { GradientBorderButton } from "./GradientBorderButton"
import { useNetworkSelector, type NetworkType } from "@/hooks/useNetworkSelector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ethereumLogo from "@/assets/networks/ethereum-coingecko.png"
import bnbLogo from "@/assets/networks/bnb-coingecko.png"
import solanaLogo from "@/assets/networks/solana-coingecko.png"
import baseLogo from "@/assets/networks/base-official.png"

const networks = [
  { id: 'base' as NetworkType, name: 'Base', logo: baseLogo },
  { id: 'ethereum' as NetworkType, name: 'Ethereum', logo: ethereumLogo },
  { id: 'bnb' as NetworkType, name: 'BNB Chain', logo: bnbLogo },
  { id: 'solana' as NetworkType, name: 'Solana', logo: solanaLogo },
]

const hoverColor = '220 22% 12%' // Slightly lighter than menu background (220 22% 6%)

export const NetworkSelectorButton = () => {
  const { selectedNetwork, setNetwork } = useNetworkSelector()

  const currentNetwork = networks.find(n => n.id === selectedNetwork) || networks[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <GradientBorderButton className="w-auto justify-center">
            <img src={currentNetwork.logo} alt={currentNetwork.name + ' logo'} loading="lazy" className="h-4 w-auto object-contain shrink-0" />
          </GradientBorderButton>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#0a0c0f] border-2 border-[hsl(var(--primary))/0.3] z-50 shadow-xl">
        {networks.map((network) => (
          <DropdownMenuItem 
            key={network.id}
            onClick={() => setNetwork(network.id)}
            className="text-white hover:bg-[hsl(var(--primary))/0.1] focus:bg-[hsl(var(--primary))/0.1] cursor-pointer transition-colors"
          >
            <img src={network.logo} alt={network.name + ' logo'} loading="lazy" className="h-4 w-auto object-contain mr-2 shrink-0" />
            {network.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
