import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useWallet } from "@/hooks/useWallet"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useNetworkSelector } from "@/hooks/useNetworkSelector"
import { Mail, Wallet, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"

interface AuthMethodsPanelProps {
  showWalletOption?: boolean
}

const emailSchema = z.string().email("Invalid email address")

export const AuthMethodsPanel = ({ showWalletOption = true }: AuthMethodsPanelProps) => {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle, signInWithTwitter, signInWithMagicLink } = useAuth()
  const { toast } = useToast()
  const { selectedNetwork } = useNetworkSelector()
  
  // Wallet hooks
  const { connectWallet: connectEvm } = useWallet()
  const { connectWallet: connectSol } = useSolanaWallet()

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      emailSchema.parse(email)
    } catch (error) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await signInWithMagicLink(email)
      setEmailSent(true)
      toast({
        title: "Check your email!",
        description: "We sent you a magic link to sign in"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithTwitter()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Twitter",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    const isEvmNetwork = selectedNetwork === 'base' || selectedNetwork === 'ethereum' || selectedNetwork === 'bnb'
    try {
      if (isEvmNetwork) {
        await connectEvm()
      } else {
        await connectSol()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      })
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--primary))/0.2] border-2 border-[hsl(var(--primary))] flex items-center justify-center">
          <Check className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <p className="text-sm text-gray-400">
          Click the link in your email to complete sign in
        </p>
        <Button
          variant="ghost"
          onClick={() => setEmailSent(false)}
          className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))/0.8]"
        >
          Try a different email
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Email Magic Link */}
      <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-primary/60 text-white outline outline-[1px] outline-white hover:bg-primary/70"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Continue with Email"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0c0f] px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth */}
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full border-gray-700 bg-[#16181f] hover:bg-[#1d2029] text-white"
        disabled={isLoading}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </Button>

      {/* Twitter OAuth */}
      <Button
        onClick={handleTwitterSignIn}
        variant="outline"
        className="w-full border-gray-700 bg-[#16181f] hover:bg-[#1d2029] text-white"
        disabled={isLoading}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Twitter
      </Button>

      {/* Wallet Connection */}
      {showWalletOption && (
        <Button
          onClick={handleWalletConnect}
          variant="outline"
          className="w-full border-gray-700 bg-[#16181f] hover:bg-[#1d2029] text-white"
        >
          <Wallet className="h-5 w-5 mr-2" />
          Continue with a wallet
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground mt-4">
        Secured Authentication
      </p>
    </div>
  )
}
