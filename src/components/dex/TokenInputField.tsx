import { ChevronDown } from "lucide-react"
import { DEX_STYLES } from "@/lib/dex-styles"
import { cn } from "@/lib/utils"

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  isCustom?: boolean
}

interface TokenInputFieldProps {
  token: Token | null
  amount: string
  balance?: string
  usdValue?: string
  onAmountChange: (amount: string) => void
  onTokenSelect: () => void
  label: string
  disabled?: boolean
  onMaxClick?: () => void
}

export const TokenInputField = ({
  token,
  amount,
  balance,
  usdValue,
  onAmountChange,
  onTokenSelect,
  label,
  disabled = false,
  onMaxClick
}: TokenInputFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={DEX_STYLES.input.label}>{label}</label>
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Balance: {parseFloat(balance).toFixed(4)}
            </span>
            {onMaxClick && (
              <button
                onClick={onMaxClick}
                className="text-xs text-primary hover:text-primary-glow transition-colors font-medium"
                disabled={disabled}
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className={cn(DEX_STYLES.input.container, disabled && "opacity-50 cursor-not-allowed")}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onTokenSelect}
            className={DEX_STYLES.token.button}
            disabled={disabled}
            type="button"
          >
            {token ? (
              <>
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className={DEX_STYLES.token.logo}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <span className={DEX_STYLES.token.symbol}>{token.symbol}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select token</span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className={DEX_STYLES.input.field}
            disabled={disabled}
          />
        </div>
        
        {usdValue && parseFloat(amount) > 0 && (
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">~${usdValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}
