import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { supabase } from '@/integrations/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  address: string | undefined
  isConnected: boolean
  isLoading: boolean
  signInWithWallet: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected, disconnectWallet } = useWallet()

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
      signInWithWallet()
    } else if (!isConnected && user) {
      signOut()
    }
  }, [isConnected, address, user])

  const signInWithWallet = async () => {
    if (!address) return

    try {
      // Create a deterministic email from wallet address
      const email = `${address.toLowerCase()}@wallet.local`
      // Enhanced security: Generate a stronger password from wallet address + salt
      const salt = 'hypercognition_secure_salt_2024'
      const password = await hashWalletAddress(address, salt)
      
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // If sign in fails, create account
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              wallet_address: address,
              auth_method: 'wallet',
              security_level: 'enhanced'
            }
          }
        })

        if (signUpError && signUpError.message !== 'User already registered') {
          console.error('Sign up error:', signUpError)
        }
      }

      // Log security event
      if (user) {
        await logSecurityEvent('wallet_auth', 'authentication', {
          wallet_address: address,
          success: true
        })
      }
    } catch (error) {
      console.error('Wallet authentication error:', error)
      // Log failed auth attempt
      await logSecurityEvent('wallet_auth_failed', 'authentication', {
        wallet_address: address,
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

  const signOut = async () => {
    await supabase.auth.signOut()
    disconnectWallet()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      address,
      isConnected,
      isLoading,
      signInWithWallet,
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