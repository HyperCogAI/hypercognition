import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export const GlobalAuthTrigger = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { signInWithGoogle, signInWithTwitter, signInWithMagicLink } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const oauth = searchParams.get('oauth')
    const magicEmail = searchParams.get('magicEmail')

    const triggerAuth = async () => {
      try {
        if (oauth === 'google') {
          console.log('[GlobalAuthTrigger] Auto-triggering Google sign-in')
          await signInWithGoogle()
        } else if (oauth === 'twitter') {
          console.log('[GlobalAuthTrigger] Auto-triggering Twitter sign-in')
          await signInWithTwitter()
        } else if (magicEmail) {
          console.log('[GlobalAuthTrigger] Auto-triggering Magic Link for:', magicEmail)
          await signInWithMagicLink(magicEmail)
          toast({
            title: "Check your email!",
            description: "We sent you a magic link to sign in"
          })
        }

        // Clean up query params after triggering
        if (oauth || magicEmail) {
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('oauth')
          newParams.delete('magicEmail')
          setSearchParams(newParams, { replace: true })
        }
      } catch (error: any) {
        console.error('[GlobalAuthTrigger] Auth error:', error)
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to authenticate",
          variant: "destructive"
        })
      }
    }

    if (oauth || magicEmail) {
      triggerAuth()
    }
  }, [searchParams, signInWithGoogle, signInWithTwitter, signInWithMagicLink, setSearchParams, toast])

  return null
}
