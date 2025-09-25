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

  console.log('WalletButton state:', { address, isConnected, isConnecting })


  if (!isConnected) {
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    if (inIframe) {
      const href = window.location.href
      return (
        <div className="w-full flex flex-col gap-2">
          <CyberButton variant="outline" size="sm" onClick={connectWallet}>
            <Wallet className="h-4 w-4 text-white" />
            <span className="text-white">Connect EVM</span>
          </CyberButton>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Having trouble in preview? Open in a new tab to connect.
          </a>
        </div>
      )
    }

    return (
      <CyberButton variant="outline" size="sm" onClick={connectWallet}>
        <Wallet className="h-4 w-4 text-white" />
        <span className="text-white">Connect EVM</span>
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