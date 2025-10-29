import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { UnifiedAuthModal } from "@/components/auth/UnifiedAuthModal"
import { PasswordResetForm } from "@/components/auth/PasswordResetForm"
import { SEOHead } from "@/components/seo/SEOHead"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const Auth = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const mode = searchParams.get('mode')
  const [isResetMode, setIsResetMode] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Check for password reset mode from query param or URL hash
    if (mode === 'reset') {
      setIsResetMode(true)
    } else if (window.location.hash.includes('type=recovery')) {
      setIsResetMode(true)
    }
  }, [mode])

  // Handle email confirmation, magic link completion, and password recovery
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')
    
    if ((type === 'signup' || type === 'magiclink' || type === 'recovery') && accessToken) {
      // Session is already established by Supabase
      toast({
        title: type === 'recovery' ? "Password reset ready" : "Authenticated!",
        description: type === 'recovery' 
          ? "You can now set a new password" 
          : "Welcome to HyperCognition"
      })
      
      // Clean hash from URL
      window.history.replaceState({}, '', window.location.pathname + window.location.search)
      
      // For recovery mode, stay on auth page to show password reset form
      if (type === 'recovery') {
        setIsResetMode(true)
        return
      }
      
      // For signup/magiclink, redirect after a brief moment
      setTimeout(() => {
        navigate(redirectTo, { replace: true })
      }, 1000)
    }
  }, [navigate, redirectTo, toast])

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && !isResetMode) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, isResetMode, redirectTo, navigate])

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
