import { CyberButton } from "@/components/ui/cyber-button"
import { useWallet } from "@/hooks/useWallet"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const WalletButton = () => {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet()

  if (isConnecting) {
    return (
      <CyberButton variant="neon" size="sm" disabled className="group">
        <Wallet className="h-4 w-4 text-primary-foreground group-hover:text-muted-foreground" />
        <span className="text-primary-foreground group-hover:text-muted-foreground">Connecting...</span>
      </CyberButton>
    )
  }

  if (!isConnected) {
    return (
      <CyberButton variant="neon" size="sm" onClick={connectWallet} className="group">
        <Wallet className="h-4 w-4 text-primary-foreground group-hover:text-muted-foreground" />
        <span className="text-primary-foreground group-hover:text-muted-foreground">Connect Wallet</span>
      </CyberButton>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CyberButton variant="cyber" size="sm">
          <Wallet className="h-4 w-4" />
          {formatAddress(address!)}
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