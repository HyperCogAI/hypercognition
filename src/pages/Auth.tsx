import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { UnifiedAuthModal } from "@/components/auth/UnifiedAuthModal"
import { PasswordResetForm } from "@/components/auth/PasswordResetForm"
import { SEOHead } from "@/components/seo/SEOHead"
import { useAuth } from "@/contexts/AuthContext"

const Auth = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const mode = searchParams.get('mode')
  const [isResetMode, setIsResetMode] = useState(false)
  const { user, signInWithGoogle, signInWithTwitter, signInWithMagicLink } = useAuth()

  useEffect(() => {
    // Check for password reset mode from query param or URL hash
    if (mode === 'reset') {
      setIsResetMode(true)
    } else if (window.location.hash.includes('type=recovery')) {
      setIsResetMode(true)
    }
  }, [mode])

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && !isResetMode) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, isResetMode, redirectTo, navigate])

  // Handle OAuth/Magic Link bridging from iframe
  useEffect(() => {
    const oauth = searchParams.get('oauth')
    const magicEmail = searchParams.get('magicEmail')
    
    if (oauth === 'google') {
      signInWithGoogle()
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('oauth')
      window.history.replaceState({}, '', newUrl.toString())
    } else if (oauth === 'twitter') {
      signInWithTwitter()
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('oauth')
      window.history.replaceState({}, '', newUrl.toString())
    }
    
    if (magicEmail) {
      signInWithMagicLink(magicEmail)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('magicEmail')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams, signInWithGoogle, signInWithTwitter, signInWithMagicLink])

  return (
    <>
      <SEOHead 
        title="Login - HyperCognition"
        description="Sign in to HyperCognition to access AI-powered trading tools and analytics"
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        {isResetMode ? (
          <PasswordResetForm onSuccess={() => navigate(redirectTo)} />
        ) : (
          <UnifiedAuthModal 
            isOpen={true} 
            onClose={() => navigate(redirectTo)} 
          />
        )}
      </div>
    </>
  )
}

export default Auth
