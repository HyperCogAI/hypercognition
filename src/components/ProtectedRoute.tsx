import { useAuth } from "@/contexts/AuthContext"
import { WalletButton } from "@/components/wallet/WalletButton"
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton"
import { useWallet as useEvmWallet } from "@/hooks/useWallet"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useAuth()
  const { isConnected: evmConnected } = useEvmWallet()
  const { isConnected: solanaConnected } = useSolanaWallet()
  const location = useLocation()
  const isSolanaRoute = location.pathname.startsWith('/solana')
  const isConnected = isSolanaRoute ? solanaConnected : evmConnected

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access this feature and start trading AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isSolanaRoute ? <SolanaWalletButton /> : <WalletButton />}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}