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
      const password = address.toLowerCase() // Use address as password for simplicity
      
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
            }
          }
        })

        if (signUpError && signUpError.message !== 'User already registered') {
          console.error('Sign up error:', signUpError)
        }
      }
    } catch (error) {
      console.error('Wallet authentication error:', error)
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