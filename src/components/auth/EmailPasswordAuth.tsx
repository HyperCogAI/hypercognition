import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Signup form schema with strong password requirements
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  displayName: z.string().optional(),
  password: z
    .string()
    .min(14, "Password must be at least 14 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

interface EmailPasswordAuthProps {
  mode: 'login' | 'signup'
}

export const EmailPasswordAuth = ({ mode }: EmailPasswordAuthProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const { toast } = useToast()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await signInWithEmail(data.email, data.password)
      toast({
        title: "Success",
        description: "You've been signed in successfully",
      })
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      await signUpWithEmail(data.email, data.password, data.displayName)
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      })
      signupForm.reset()
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again."
      
      if (error.message?.includes("already registered") || 
          error.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Please sign in instead."
      } else if (error.message?.includes("Password")) {
        errorMessage = error.message
      } else if (error.status === 429) {
        errorMessage = "Too many requests. Please try again in a few minutes."
      } else if (error.message?.includes("email")) {
        errorMessage = "Failed to send confirmation email. Please check your email address."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('Signup error:', error)
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSendingReset(true)
    try {
      const redirectUrl = `${window.location.origin}/auth`
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      toast({
        title: "Reset link sent!",
        description: "Check your email for a password reset link.",
      })
      setShowForgotPassword(false)
      setForgotEmail("")
    } catch (error: any) {
      toast({
        title: "Failed to send reset link",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-white">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="your@email.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
        <Button
          onClick={handleForgotPassword}
          className="w-full bg-primary/60 text-white outline outline-[1px] outline-white hover:bg-primary/70"
          disabled={isSendingReset}
        >
          {isSendingReset ? "Sending..." : "Send Reset Link"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowForgotPassword(false)}
          className="w-full text-gray-400 hover:text-white"
        >
          Back to login
        </Button>
      </div>
    )
  }

  return (
    <>
      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                {...loginForm.register("email")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                {...loginForm.register("password")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary/60 text-white outline outline-[1px] outline-white hover:bg-primary/70"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <Button
            type="button"
            variant="link"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-sm text-gray-400 hover:text-white"
          >
            Forgot password?
          </Button>
        </form>
      ) : (
        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-white">Display Name (Optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-name"
                type="text"
                placeholder="Your name"
                {...signupForm.register("displayName")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                {...signupForm.register("email")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {signupForm.formState.errors.email && (
              <p className="text-sm text-red-500">{signupForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                {...signupForm.register("password")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {signupForm.formState.errors.password && (
              <p className="text-sm text-red-500">{signupForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password" className="text-white">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="••••••••"
                {...signupForm.register("confirmPassword")}
                className="pl-10 bg-[#16181f] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {signupForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">{signupForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary/60 text-white outline outline-[1px] outline-white hover:bg-primary/70"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      )}
    </>
  )
}
