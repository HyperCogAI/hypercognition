import { UnifiedWalletButton } from "./UnifiedWalletButton"
import { NetworkSelectorButton } from "./NetworkSelectorButton"

export const WalletSection = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <UnifiedWalletButton />
      </div>
      <div className="w-full">
        <NetworkSelectorButton />
      </div>
    </div>
  )
}