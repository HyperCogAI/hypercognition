import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { loginWithEnhancedAuth } from "@/services/authService"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
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

export const EmailPasswordAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)
  const { signInWithEmail, signUpWithEmail } = useAuth()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Try enhanced auth first
      const enhancedResult = await loginWithEnhancedAuth(data.email, data.password)
      
      if (enhancedResult.success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
      } else {
        throw new Error(enhancedResult.error || "Login failed")
      }
    } catch (error: any) {
      // Fallback to direct Supabase auth
      try {
        await signInWithEmail(data.email, data.password)
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
      } catch (fallbackError: any) {
        toast({
          title: "Login failed",
          description: fallbackError.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      await signUpWithEmail(data.email, data.password)
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      })
      signupForm.reset()
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again."
      
      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please sign in instead."
      }
      
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
      const { supabase } = await import("@/integrations/supabase/client")
      const redirectUrl = `${window.location.origin}/auth?mode=reset`
      
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
          <h3 className="text-lg font-semibold">Reset your password</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleForgotPassword}
            disabled={isSendingReset}
            className="flex-1"
          >
            {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
            disabled={isSendingReset}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-4">
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-4">
        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              {...signupForm.register("email")}
            />
            {signupForm.formState.errors.email && (
              <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              {...signupForm.register("password")}
            />
            {signupForm.formState.errors.password && (
              <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirm Password</Label>
            <Input
              id="signup-confirm"
              type="password"
              placeholder="••••••••"
              {...signupForm.register("confirmPassword")}
            />
            {signupForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
