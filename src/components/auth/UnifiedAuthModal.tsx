import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useWallet } from "@/hooks/useWallet"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useNetworkSelector } from "@/hooks/useNetworkSelector"
import { Mail, Wallet, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import hypercognitionLogo from "@/assets/Hyper_Cognition_logo3large.png"
import { EmailPasswordAuth } from "./EmailPasswordAuth"

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const emailSchema = z.string().email("Invalid email address")

export const UnifiedAuthModal = ({ isOpen, onClose }: UnifiedAuthModalProps) => {
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

    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    console.log('[UnifiedAuthModal] Magic Link - inIframe:', inIframe)

    if (inIframe) {
      const safeURL = new URL('/auth', window.location.origin)
      safeURL.searchParams.set('magicEmail', email)
      
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = safeURL.toString()
        } else {
          window.location.href = safeURL.toString()
        }
      } catch {
        window.location.href = safeURL.toString()
      }
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
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    console.log('[UnifiedAuthModal] Google Sign-In - inIframe:', inIframe)

    if (inIframe) {
      const safeURL = new URL('/auth', window.location.origin)
      safeURL.searchParams.set('oauth', 'google')
      
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = safeURL.toString()
        } else {
          window.location.href = safeURL.toString()
        }
      } catch {
        window.location.href = safeURL.toString()
      }
      return
    }

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
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    console.log('[UnifiedAuthModal] Twitter Sign-In - inIframe:', inIframe)

    if (inIframe) {
      const safeURL = new URL('/auth', window.location.origin)
      safeURL.searchParams.set('oauth', 'twitter')
      
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = safeURL.toString()
        } else {
          window.location.href = safeURL.toString()
        }
      } catch {
        window.location.href = safeURL.toString()
      }
      return
    }

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
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex items-start md:items-center justify-center min-h-[100vh] p-4 pt-8 md:pt-4">
      <Card className="w-full max-w-md bg-background border border-border rounded-2xl">
        <CardHeader className="space-y-4">
          {/* HyperCognition Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src={hypercognitionLogo} 
              alt="HyperCognition" 
              className="h-10 w-auto"
            />
          </div>
          
          <CardTitle className="text-2xl font-bold text-center text-white">
            {emailSent ? "Check your email" : "Log in or sign up"}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {emailSent 
              ? "We sent you a magic link. Click it to sign in."
              : "Choose your preferred sign-in method"
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!emailSent ? (
            <Tabs defaultValue="email-password" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#16181f]">
                <TabsTrigger value="email-password">Email</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>

              {/* Email & Password Tab */}
              <TabsContent value="email-password" className="space-y-4 mt-4">
                <EmailPasswordAuth />
              </TabsContent>

              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-4 mt-4">
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
                    {isLoading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              </TabsContent>

              {/* Social & Wallet Tab */}
              <TabsContent value="social" className="space-y-4 mt-4">
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
                <Button
                  onClick={handleWalletConnect}
                  variant="outline"
                  className="w-full border-gray-700 bg-[#16181f] hover:bg-[#1d2029] text-white"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Continue with a wallet
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secured Authentication
                </p>
              </TabsContent>
            </Tabs>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
