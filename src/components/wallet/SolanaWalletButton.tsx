import { CyberButton } from "@/components/ui/cyber-button"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
export const SolanaWalletButton = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    walletName 
  } = useSolanaWallet()

  if (isConnecting) {
    return (
      <CyberButton variant="neon" size="sm" disabled>
        <Wallet className="h-4 w-4 text-white" />
        <span className="text-white">Connecting...</span>
      </CyberButton>
    )
  }

  if (!isConnected) {
    return (
      <WalletMultiButton className="!h-8 !rounded-full !px-3 !text-xs !bg-transparent !border !border-primary/30 hover:!bg-primary/5 !text-primary" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CyberButton variant="cyber" size="sm">
          <Wallet className="h-4 w-4" />
          {formatAddress(address!)} ({walletName})
        </CyberButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={disconnectWallet}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}