import { WalletButton } from "./WalletButton"
import { SolanaWalletButton } from "./SolanaWalletButton"
import { Badge } from "@/components/ui/badge"

export const WalletSection = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs w-10 justify-center bg-primary/60 border border-white text-primary-foreground hover:bg-primary/70">EVM</Badge>
        <div className="flex-1">
          <WalletButton />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs w-10 justify-center">SOL</Badge>
        <div className="flex-1">
          <SolanaWalletButton />
        </div>
      </div>
    </div>
  )
}