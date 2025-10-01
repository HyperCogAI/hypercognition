import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { supabase } from '@/integrations/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  address: string | undefined
  isConnected: boolean
  isLoading: boolean
  walletType: 'evm' | 'solana' | null
  signInWithWallet: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [walletType, setWalletType] = useState<'evm' | 'solana' | null>(null)
  
  // EVM wallet
  const evmWallet = useWallet()
  
  // Solana wallet  
  const solanaWallet = useSolanaWallet()
  
  // Determine which wallet is connected
  const address = evmWallet.isConnected ? evmWallet.address : 
                  solanaWallet.isConnected ? solanaWallet.address : 
                  undefined
  const isConnected = evmWallet.isConnected || solanaWallet.isConnected

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto sign in when wallet is connected
  useEffect(() => {
    if (isConnected && address && !user) {
      // Determine wallet type
      const type = evmWallet.isConnected ? 'evm' : 'solana'
      setWalletType(type)
      signInWithWallet()
    } else if (!isConnected && user) {
      signOut()
    }
  }, [isConnected, address, user])

  const signInWithWallet = async () => {
    if (!address) return

    console.log('Signing in with wallet:', { address, walletType })

    try {
      // Use a valid email domain instead of .local
      const email = `${address.toLowerCase()}@wallet.hypercognition.app`
      // Enhanced security: Generate a stronger password from wallet address + salt
      const salt = 'hypercognition_secure_salt_2024'
      const password = await hashWalletAddress(address, salt)
      
      console.log('Attempting sign in with email:', email)
      
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // If sign in fails, create account
      if (signInError) {
        console.log('Sign in failed, creating new account...', signInError)
        
        const type = evmWallet.isConnected ? 'evm' : 'solana'
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              wallet_address: address,
              wallet_type: type,
              auth_method: 'wallet',
              security_level: 'enhanced'
            }
          }
        })

        if (signUpError) {
          console.error('Sign up error:', signUpError)
          if (signUpError.message !== 'User already registered') {
            throw signUpError
          }
        } else {
          console.log('Account created successfully')
        }
      } else {
        console.log('Signed in successfully')
      }

      // Log security event
      if (user) {
        await logSecurityEvent('wallet_auth', 'authentication', {
          wallet_address: address,
          wallet_type: walletType,
          success: true
        })
      }
    } catch (error: any) {
      console.error('Wallet authentication error:', error)
      // Log failed auth attempt
      await logSecurityEvent('wallet_auth_failed', 'authentication', {
        wallet_address: address,
        wallet_type: walletType,
        error: error.message
      })
    }
  }

  // Enhanced password generation for wallet addresses
  const hashWalletAddress = async (address: string, salt: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(address.toLowerCase() + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Security event logging
  const logSecurityEvent = async (action: string, resource: string, details: any) => {
    try {
      await supabase.from('security_audit_log').insert({
        user_id: user?.id,
        action,
        resource,
        details,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  // Get client IP (simplified version)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: displayName,
          auth_method: 'email'
        }
      }
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    evmWallet.disconnectWallet()
    solanaWallet.disconnectWallet()
    setWalletType(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      address,
      isConnected,
      isLoading,
      walletType,
      signInWithWallet,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}