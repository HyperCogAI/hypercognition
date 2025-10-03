import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Connection, PublicKey } from "@solana/web3.js"
import { Plus, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"

export const AddCustomToken = ({ onTokenAdded }: { onTokenAdded?: () => void }) => {
  const [open, setOpen] = useState(false)
  const [contractAddress, setContractAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { publicKey } = useWallet()

  const validateAndAddToken = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add custom tokens.",
        variant: "destructive"
      })
      return
    }

    if (!contractAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid contract address.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Validate the address format
      let mintPubkey: PublicKey
      try {
        mintPubkey = new PublicKey(contractAddress.trim())
      } catch (error) {
        toast({
          title: "Invalid Address",
          description: "The contract address format is invalid.",
          variant: "destructive"
        })
        return
      }

      // Connect to Solana mainnet
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

      // Fetch token metadata from Jupiter API
      const response = await fetch(`https://tokens.jup.ag/token/${mintPubkey.toString()}`)
      
      let tokenData: any
      if (response.ok) {
        tokenData = await response.json()
      } else {
        // If Jupiter doesn't have it, try to get basic account info from chain
        const accountInfo = await connection.getAccountInfo(mintPubkey)
        if (!accountInfo) {
          toast({
            title: "Token Not Found",
            description: "Could not find token information for this address.",
            variant: "destructive"
          })
          return
        }

        // Use basic info
        tokenData = {
          address: mintPubkey.toString(),
          name: `Token ${mintPubkey.toString().substring(0, 8)}`,
          symbol: mintPubkey.toString().substring(0, 6).toUpperCase(),
          decimals: 9,
          logoURI: null
        }
      }

      // Check if token already exists for this user
      const { data: existing } = await supabase
        .from('custom_solana_tokens')
        .select('id')
        .eq('user_id', publicKey.toString())
        .eq('mint_address', mintPubkey.toString())
        .maybeSingle()

      if (existing) {
        toast({
          title: "Token Already Added",
          description: "This token is already in your custom token list.",
          variant: "destructive"
        })
        return
      }

      // Add token to database
      const { error } = await supabase
        .from('custom_solana_tokens')
        .insert({
          user_id: publicKey.toString(),
          mint_address: mintPubkey.toString(),
          name: tokenData.name || 'Unknown Token',
          symbol: tokenData.symbol || 'UNKNOWN',
          decimals: tokenData.decimals || 9,
          image_url: tokenData.logoURI,
          description: tokenData.description || `${tokenData.name} on Solana`,
          is_active: true
        })

      if (error) throw error

      toast({
        title: "Token Added",
        description: `${tokenData.symbol} has been added to your token list.`,
      })

      setContractAddress("")
      setOpen(false)
      onTokenAdded?.()

    } catch (error: any) {
      console.error("Add token error:", error)
      toast({
        title: "Failed to Add Token",
        description: error.message || "Could not add the token. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Token
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Token</DialogTitle>
          <DialogDescription>
            Enter a Solana token contract address to add it to your swap list
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract-address">Token Contract Address</Label>
            <Input
              id="contract-address"
              placeholder="e.g., So11111111111111111111111111111111111111112"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This should be a valid Solana SPL token mint address
            </p>
          </div>
          <Button
            className="w-full"
            onClick={validateAndAddToken}
            disabled={isLoading || !contractAddress.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              "Add Token"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
