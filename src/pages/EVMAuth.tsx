import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useWallet } from "@/hooks/useWallet"
import { CyberButton } from "@/components/ui/cyber-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletButton } from "@/components/wallet/WalletButton"
import { SEOHead } from "@/components/seo/SEOHead"
import { ArrowLeft, Zap, Wallet } from "lucide-react"
import newLogo from "@/assets/new-logo.png"

export default function EVMAuth() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { isConnected, address } = useWallet()

  // Redirect if already authenticated
  if (!isLoading && user) {
    navigate('/')
    return null
  }

  // Auto-redirect when EVM wallet is connected
  if (isConnected && address) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead 
        title="Connect EVM Wallet - HyperCognition"
        description="Connect your Ethereum wallet to access EVM trading features and AI agents on HyperCognition"
        keywords="EVM wallet, metamask, wallet connect, ethereum wallet, connect wallet, ethereum trading"
      />
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="flex justify-center">
            <img 
              src={newLogo} 
              alt="HyperCognition" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        <Card className="border-primary/20 bg-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Connect EVM Wallet
            </CardTitle>
            <CardDescription>
              Connect your Ethereum-compatible wallet to access EVM trading features and AI agents
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* EVM Wallet Connection */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Choose your preferred EVM wallet
                </div>
                <div className="text-xs text-muted-foreground">
                  MetaMask, WalletConnect, and other EVM wallets supported
                </div>
              </div>
              
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="text-sm font-medium text-center">Access to:</div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  ETH and ERC-20 token trading
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Ethereum AI trading agents
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  DeFi protocols on Ethereum
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Multi-chain portfolio tracking
                </div>
              </div>
            </div>

            {/* Alternative Auth */}
            <div className="text-center text-sm border-t border-border/50 pt-4">
              <span className="text-muted-foreground">
                Need Solana wallet instead?
              </span>{' '}
              <Link
                to="/solana-auth"
                className="text-primary hover:text-primary/80 hover:underline"
              >
                Connect Solana Wallet
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-xs text-muted-foreground">
          By connecting your wallet, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}