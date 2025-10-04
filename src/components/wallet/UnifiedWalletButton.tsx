import { useEffect } from "react"
import { CyberButton } from "@/components/ui/cyber-button"
import { GradientBorderButton } from "./GradientBorderButton"
import { useWallet } from "@/hooks/useWallet"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useNetworkSelector } from "@/hooks/useNetworkSelector"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const UnifiedWalletButton = () => {
  const { selectedNetwork } = useNetworkSelector()
  
  // EVM wallet
  const { 
    address: evmAddress, 
    isConnected: evmConnected, 
    isConnecting: evmConnecting, 
    connectWallet: connectEvm, 
    disconnectWallet: disconnectEvm 
  } = useWallet()

  // Solana wallet
  const { 
    address: solAddress, 
    isConnected: solConnected, 
    isConnecting: solConnecting, 
    connectWallet: connectSol, 
    disconnectWallet: disconnectSol,
    formatAddress: formatSolAddress
  } = useSolanaWallet()

  // Auto-trigger wallet modal based on network
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('w3m-connect') === '1') {
        connectEvm()
        url.searchParams.delete('w3m-connect')
        window.history.replaceState({}, '', url.toString())
      }
      if (url.searchParams.get('solana-connect') === '1') {
        connectSol()
        url.searchParams.delete('solana-connect')
        window.history.replaceState({}, '', url.toString())
      }
    } catch (_) {
      // ignore
    }
  }, [connectEvm, connectSol])

  // Determine if selected network is EVM or Solana
  const isEvmNetwork = selectedNetwork === 'base' || selectedNetwork === 'ethereum' || selectedNetwork === 'bnb'
  
  const isConnected = isEvmNetwork ? evmConnected : solConnected
  const isConnecting = isEvmNetwork ? evmConnecting : solConnecting
  const address = isEvmNetwork ? evmAddress : solAddress
  const connectWallet = isEvmNetwork ? connectEvm : connectSol
  const disconnectWallet = isEvmNetwork ? disconnectEvm : disconnectSol

  const formatAddress = (addr: string) => {
    if (!isEvmNetwork) {
      return formatSolAddress(addr)
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    if (inIframe) {
      const param = isEvmNetwork ? 'w3m-connect' : 'solana-connect'
      let href = '#'
      try {
        const url = new URL(window.location.href)
        url.searchParams.set(param, '1')
        href = url.toString()
      } catch (_) {}
      return (
        <div className="w-full flex flex-col gap-2">
          <div className="relative rounded-full w-[130px] p-[2px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift">
            <a href={href} target="_top" aria-label="Connect wallet (open in full window)" className="inline-flex items-center justify-center gap-2 w-full h-8 rounded-full bg-black hover:bg-gray-900 text-white text-xs font-medium">
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-white">Connect</span>
            </a>
          </div>
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
      <GradientBorderButton onClick={connectWallet} className="w-[130px] justify-center">
        <Wallet className="h-4 w-4 text-white" />
        <span className="text-white">Connect</span>
      </GradientBorderButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <GradientBorderButton className="w-[130px] justify-center">
            <Wallet className="h-4 w-4 text-white" />
            <span className="text-white">{formatAddress(address!)}</span>
          </GradientBorderButton>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--menu-surface))] border-white/20 z-50">
        <DropdownMenuItem onClick={disconnectWallet} className="text-white hover:bg-white/10 focus:bg-white/10">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
