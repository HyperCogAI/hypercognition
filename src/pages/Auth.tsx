import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { UnifiedAuthModal } from "@/components/auth/UnifiedAuthModal"
import { PasswordResetForm } from "@/components/auth/PasswordResetForm"
import { SEOHead } from "@/components/seo/SEOHead"

const Auth = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const mode = searchParams.get('mode')
  const [isResetMode, setIsResetMode] = useState(false)

  useEffect(() => {
    // Check for password reset mode from query param or URL hash
    if (mode === 'reset') {
      setIsResetMode(true)
    } else if (window.location.hash.includes('type=recovery')) {
      setIsResetMode(true)
    }
  }, [mode])

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
