import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WalletSection } from "@/components/wallet/WalletSection"
import { SEOHead } from "@/components/seo/SEOHead"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Zap } from "lucide-react"
import newLogo from "@/assets/new-logo.png"

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  
  const [mode, setMode] = useState<'login' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  if (!isLoading && user) {
    navigate('/')
    return null
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
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
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try logging in instead.",
              variant: "destructive"
            })
            setMode('login')
          } else {
            throw error
          }
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Please check your email to verify your account.",
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your account.",
        })
        navigate('/')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      toast({
        title: "Authentication failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead 
        title={`${mode === 'login' ? 'Sign In' : 'Create Account'} - HyperCognition`}
        description={mode === 'login' ? 'Sign in to your HyperCognition account to access AI trading agents' : 'Create your HyperCognition account and start trading AI agents'}
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

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {mode === 'login' ? 'Welcome Back' : 'Join HyperCognition'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Sign in to access your AI trading dashboard' 
                : 'Create your account to start trading AI agents'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Wallet Authentication */}
            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                Quick connect with your wallet
              </div>
              <WalletSection />
            </div>

            <Separator className="bg-border/50" />

            {/* Email Authentication Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <CyberButton 
                type="submit" 
                variant="neon" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-white">
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  </div>
                ) : (
                  <span className="text-white">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </CyberButton>
            </form>

            {/* Mode Toggle */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              </span>{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
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