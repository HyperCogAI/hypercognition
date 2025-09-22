import { WalletButton } from "./WalletButton"
import { SolanaWalletButton } from "./SolanaWalletButton"
import { Badge } from "@/components/ui/badge"

export const WalletSection = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">EVM</Badge>
        <WalletButton />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">SOL</Badge>
        <SolanaWalletButton />
      </div>
    </div>
  )
}