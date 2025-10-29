import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "@/contexts/AuthContext"
import { UnifiedAuthModal } from "@/components/auth/UnifiedAuthModal"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, session } = useAuth()
  const hasAccess = !!session
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      console.log('[ProtectedRoute] Opening auth modal - user not authenticated')
      setIsAuthModalOpen(true)
    } else if (hasAccess) {
      console.log('[ProtectedRoute] User authenticated, closing modal')
      setIsAuthModalOpen(false)
    }
  }, [isLoading, hasAccess])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <UnifiedAuthModal 
          isOpen={true} 
          onClose={() => {}} 
        />
      </div>,
      document.body
    )
  }

  return <>{children}</>
}