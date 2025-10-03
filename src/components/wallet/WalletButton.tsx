import { useEffect } from "react"
import { CyberButton } from "@/components/ui/cyber-button"
import { GradientBorderButton } from "./GradientBorderButton"
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

  // Auto-trigger wallet modal if opened in a new tab via redirect param
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('w3m-connect') === '1') {
        connectWallet()
        url.searchParams.delete('w3m-connect')
        window.history.replaceState({}, '', url.toString())
      }
    } catch (_) {
      // ignore
    }
  }, [connectWallet])

  if (!isConnected) {
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    if (inIframe) {
      let href = '#'
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('w3m-connect', '1')
        href = url.toString()
      } catch (_) {}
      return (
        <div className="w-full flex flex-col gap-2">
          <div className="relative rounded-full w-[130px] p-[2px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift shadow-[0_0_12px_hsl(var(--primary)/0.35)]">
            <a href={href} target="_top" aria-label="Connect EVM wallet (open in full window)" className="inline-flex items-center justify-center gap-2 w-full h-8 rounded-full bg-black/90 hover:bg-black/95 text-white text-xs font-medium">
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-white">Connect EVM</span>
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
        <span className="text-white">Connect EVM</span>
      </GradientBorderButton>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CyberButton variant="outline" size="sm" className="w-[130px] justify-center">
          <Wallet className="h-4 w-4 text-white" />
          <span className="text-white">{formatAddress(address!)}</span>
        </CyberButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-black/60 border-white/20 backdrop-blur-md">
        <DropdownMenuItem onClick={disconnectWallet} className="text-white hover:bg-white/10 focus:bg-white/10">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}