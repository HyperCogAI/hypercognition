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

const hoverColor = '210 100% 50%' // RGB(0, 135, 255) = #0087FF

export const NetworkSelectorButton = () => {
  const { selectedNetwork, setNetwork } = useNetworkSelector()

  const currentNetwork = networks.find(n => n.id === selectedNetwork) || networks[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <GradientBorderButton className="w-[130px] justify-center">
            <img src={currentNetwork.logo} alt={currentNetwork.name + ' logo'} loading="lazy" className="h-4 w-4 shrink-0" />
            <span className="text-white">{currentNetwork.name}</span>
          </GradientBorderButton>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--menu-surface))] border-white/20 z-50">
        {networks.map((network) => (
          <DropdownMenuItem 
            key={network.id}
            onClick={() => setNetwork(network.id)}
            className="text-white/70 hover:text-white focus:text-white cursor-pointer transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${hoverColor})`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ''
            }}
          >
            <img src={network.logo} alt={network.name + ' logo'} loading="lazy" className="h-4 w-4 mr-2 shrink-0" />
            {network.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
