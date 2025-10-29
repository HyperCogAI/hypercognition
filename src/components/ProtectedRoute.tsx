import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, session } = useAuth()
  const location = useLocation()
  const hasAccess = !!session

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    const redirectPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirect=${redirectPath}`} replace />
  }

  return <>{children}</>
}