import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DEX_STYLES } from "@/lib/dex-styles"
import { Token } from "./TokenInputField"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TokenSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: Token[]
  onSelect: (token: Token) => void
  balances?: Record<string, string>
  onAddCustomToken?: () => void
  title?: string
}

export const TokenSelectModal = ({
  open,
  onOpenChange,
  tokens,
  onSelect,
  balances = {},
  onAddCustomToken,
  title = "Select a token"
}: TokenSelectModalProps) => {
  const [search, setSearch] = useState("")

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase()) ||
    token.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (token: Token) => {
    onSelect(token)
    onOpenChange(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DEX_STYLES.modal.content + " max-w-md"}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or paste address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={DEX_STYLES.modal.search + " pl-9"}
          />
        </div>

        {onAddCustomToken && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onAddCustomToken()
              onOpenChange(false)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Custom Token
          </Button>
        )}
        
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((token) => {
              const balance = balances[token.address]
              return (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className={DEX_STYLES.modal.item}
                >
                  <div className="flex items-center gap-3">
                    {token.logoURI && (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="text-left">
                      <div className="font-semibold flex items-center gap-2">
                        {token.symbol}
                        {token.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  {balance && parseFloat(balance) > 0 && (
                    <div className="text-right">
                      <div className="font-medium text-sm">{parseFloat(balance).toFixed(4)}</div>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
