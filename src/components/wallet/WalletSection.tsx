import { WalletButton } from "./WalletButton"
import { SolanaWalletButton } from "./SolanaWalletButton"

export const WalletSection = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <WalletButton />
      </div>
      <div className="w-full">
        <SolanaWalletButton />
      </div>
    </div>
  )
}