import { CyberButton } from "@/components/ui/cyber-button"
import { GradientBorderButton } from "./GradientBorderButton"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useEffect } from "react"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  // Auto-trigger wallet modal if opened in a new tab via redirect param
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('solana-connect') === '1') {
        connectWallet()
        url.searchParams.delete('solana-connect')
        window.history.replaceState({}, '', url.toString())
      }
    } catch (_) {
      // ignore
    }
  }, [connectWallet])

  if (isConnecting) {
    return (
      <CyberButton variant="neon" size="sm" disabled>
        <Wallet className="h-4 w-4 text-white" />
        <span className="text-white">Connecting...</span>
      </CyberButton>
    )
  }

  if (!isConnected) {
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    if (inIframe) {
      let href = '#'
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('solana-connect', '1')
        href = url.toString()
      } catch (_) {}
      return (
        <div className="w-full flex flex-col gap-2">
          <CyberButton asChild variant="outline" size="sm" className="w-[130px] justify-center">
            <a href={href} target="_top" aria-label="Connect Solana wallet (open in full window)">
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-white">Connect SOL</span>
            </a>
          </CyberButton>
          <a
            href={href}
            target="_top"
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Open in a full window to connect (recommended).
          </a>
        </div>
      )
    }

    return (
      <GradientBorderButton 
        onClick={() => {
          console.log('Solana Connect button clicked')
          connectWallet()
        }} 
        className="w-[130px] justify-center"
      >
        <Wallet className="h-4 w-4 text-white" />
        <span className="text-white">Connect SOL</span>
      </GradientBorderButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CyberButton variant="outline" size="sm" className="w-[130px] justify-center">
          <Wallet className="h-4 w-4 text-white" />
          <span className="text-white">{formatAddress(address!)}</span>
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