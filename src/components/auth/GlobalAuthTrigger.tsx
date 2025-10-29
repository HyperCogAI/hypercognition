import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

type PendingAuth = 
  | { type: 'google' }
  | { type: 'twitter' }
  | { type: 'magic', email: string }
  | null

export const GlobalAuthTrigger = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { signInWithGoogle, signInWithTwitter, signInWithMagicLink } = useAuth()
  const { toast } = useToast()
  const [pendingAuth, setPendingAuth] = useState<PendingAuth>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const oauth = searchParams.get('oauth')
    const magicEmail = searchParams.get('magicEmail')

    // Detect pending auth and store it instead of auto-triggering
    if (oauth === 'google') {
      console.log('[GlobalAuthTrigger] Detected Google auth param')
      setPendingAuth({ type: 'google' })
    } else if (oauth === 'twitter') {
      console.log('[GlobalAuthTrigger] Detected Twitter auth param')
      setPendingAuth({ type: 'twitter' })
    } else if (magicEmail) {
      console.log('[GlobalAuthTrigger] Detected Magic Link auth param')
      setPendingAuth({ type: 'magic', email: magicEmail })
    }

    // Clean up query params immediately
    if (oauth || magicEmail) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('oauth')
      newParams.delete('magicEmail')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleContinueAuth = async () => {
    if (!pendingAuth || isProcessing) return

    setIsProcessing(true)
    try {
      if (pendingAuth.type === 'google') {
        console.log('[GlobalAuthTrigger] User clicked: Continue with Google')
        await signInWithGoogle()
      } else if (pendingAuth.type === 'twitter') {
        console.log('[GlobalAuthTrigger] User clicked: Continue with Twitter')
        await signInWithTwitter()
      } else if (pendingAuth.type === 'magic') {
        console.log('[GlobalAuthTrigger] User clicked: Send magic link')
        await signInWithMagicLink(pendingAuth.email)
        toast({
          title: "Check your email!",
          description: "We sent you a magic link to sign in"
        })
      }
      setPendingAuth(null)
    } catch (error: any) {
      console.error('[GlobalAuthTrigger] Auth error:', error)
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!pendingAuth) return null

  const getAuthMessage = () => {
    if (pendingAuth.type === 'google') return "Continue with Google"
    if (pendingAuth.type === 'twitter') return "Continue with Twitter"
    return `Send magic link to ${pendingAuth.email}`
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="p-4 bg-background border-border shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Complete Sign In
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Click below to continue your authentication
            </p>
            <Button
              onClick={handleContinueAuth}
              disabled={isProcessing}
              className="w-full"
              size="sm"
            >
              {isProcessing ? "Processing..." : getAuthMessage()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setPendingAuth(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
