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
          <div className="w3m-custom-style">
            {/* @ts-ignore */}
            <w3m-button size="sm" label="EVM" balance="hide" />
            <style dangerouslySetInnerHTML={{
              __html: `
                .w3m-custom-style w3m-button {
                  --w3m-color-mix: var(--w3m-color-mix);
                  --w3m-color-mix-strength: 40%;
                  --w3m-font-family: inherit;
                  --w3m-border-radius-master: 24px;
                  width: auto !important;
                  min-width: 80px !important;
                }
                .w3m-custom-style w3m-button::part(button) {
                  background: linear-gradient(135deg, hsl(196 100% 47%), hsl(210 100% 56%)) !important;
                  color: white !important;
                  border: 1px solid hsl(196 100% 47%) !important;
                  border-radius: 24px !important;
                  padding: 8px 16px !important;
                  font-weight: 500 !important;
                  box-shadow: 0 2px 8px hsla(196, 100%, 47%, 0.3) !important;
                  transition: all 0.2s ease !important;
                }
                .w3m-custom-style w3m-button::part(button):hover {
                  transform: translateY(-1px) !important;
                  box-shadow: 0 4px 12px hsla(196, 100%, 47%, 0.4) !important;
                }
              `
            }} />
          </div>
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

    // @ts-ignore - Web3Modal button is dynamically loaded
    return (
      <div className="w3m-custom-style">
        {/* @ts-ignore */}
        <w3m-button size="sm" label="EVM" balance="hide" />
        <style dangerouslySetInnerHTML={{
          __html: `
            .w3m-custom-style w3m-button {
              --w3m-color-mix: var(--w3m-color-mix);
              --w3m-color-mix-strength: 40%;
              --w3m-font-family: inherit;
              --w3m-border-radius-master: 24px;
              width: auto !important;
              min-width: 80px !important;
            }
            .w3m-custom-style w3m-button::part(button) {
              background: linear-gradient(135deg, hsl(196 100% 47%), hsl(210 100% 56%)) !important;
              color: white !important;
              border: 1px solid hsl(196 100% 47%) !important;
              border-radius: 24px !important;
              padding: 8px 16px !important;
              font-weight: 500 !important;
              box-shadow: 0 2px 8px hsla(196, 100%, 47%, 0.3) !important;
              transition: all 0.2s ease !important;
            }
            .w3m-custom-style w3m-button::part(button):hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 12px hsla(196, 100%, 47%, 0.4) !important;
            }
          `
        }} />
      </div>
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