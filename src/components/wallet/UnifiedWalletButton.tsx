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
import hyperLogo from "@/assets/Hyper_Cognition_logo3large-7.png"

export const UnifiedWalletButton = () => {
  // Get hooks for both wallets
  const evmWallet = useWallet()
  const solWallet = useSolanaWallet()
  const { selectedNetwork } = useNetworkSelector()

  // Determine if selected network is EVM or Solana
  const isEvmNetwork = selectedNetwork === 'base' || selectedNetwork === 'ethereum' || selectedNetwork === 'bnb'
  
  const isConnected = isEvmNetwork ? evmWallet.isConnected : solWallet.isConnected
  const isConnecting = isEvmNetwork ? evmWallet.isConnecting : solWallet.isConnecting
  const address = isEvmNetwork ? evmWallet.address : solWallet.address
  const connectWallet = isEvmNetwork ? evmWallet.connectWallet : solWallet.connectWallet
  const disconnectWallet = isEvmNetwork ? evmWallet.disconnectWallet : solWallet.disconnectWallet

  const formatAddress = (addr: string) => {
    if (!isEvmNetwork) {
      return solWallet.formatAddress(addr)
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Auto-trigger wallet modal based on network
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('w3m-connect') === '1') {
        evmWallet.connectWallet()
        url.searchParams.delete('w3m-connect')
        window.history.replaceState({}, '', url.toString())
      }
      if (url.searchParams.get('solana-connect') === '1') {
        solWallet.connectWallet()
        url.searchParams.delete('solana-connect')
        window.history.replaceState({}, '', url.toString())
      }
    } catch (_) {
      // ignore
    }
  }, [evmWallet.connectWallet, solWallet.connectWallet])

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
          <div className="relative rounded-full w-[130px] p-[2px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift shadow-[0_0_12px_hsl(var(--primary)/0.35)]">
            <a href={href} target="_top" aria-label="Connect wallet (open in full window)" className="inline-flex items-center justify-center gap-2 w-full h-8 rounded-full bg-black/90 hover:bg-black/95 text-white text-xs font-medium">
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
      <DropdownMenuContent align="end" className="w-48 bg-[#0a0c0f] border-2 border-[hsl(var(--primary))/0.3] z-50 shadow-xl">
        <div className="px-4 py-3 border-b border-white/10 flex justify-center">
          <img src={hyperLogo} alt="HyperCognition" className="h-6 w-auto" />
        </div>
        <DropdownMenuItem onClick={disconnectWallet} className="text-white hover:bg-[hsl(var(--primary))/0.1] focus:bg-[hsl(var(--primary))/0.1] cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
