import { useNavigate, useSearchParams } from "react-router-dom"
import { UnifiedAuthModal } from "@/components/auth/UnifiedAuthModal"
import { SEOHead } from "@/components/seo/SEOHead"

const Auth = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  return (
    <>
      <SEOHead 
        title="Login - HyperCognition"
        description="Sign in to HyperCognition to access AI-powered trading tools and analytics"
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <UnifiedAuthModal 
          isOpen={true} 
          onClose={() => navigate(redirectTo)} 
        />
      </div>
    </>
  )
}

export default Auth
