import { supabase } from "@/integrations/supabase/client"

interface EnhancedAuthResponse {
  success: boolean
  error?: string
  access_token?: string
  refresh_token?: string
}

export const loginWithEnhancedAuth = async (
  email: string,
  password: string
): Promise<EnhancedAuthResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke("enhanced-auth", {
      body: {
        action: "login",
        email,
        password,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (!data || data.error) {
      return {
        success: false,
        error: data?.error || "Login failed",
      }
    }

    // Set the session using tokens from enhanced-auth
    if (data.access_token && data.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })

      if (sessionError) {
        return {
          success: false,
          error: sessionError.message,
        }
      }
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    }
  } catch (error: any) {
    // Check for rate limiting (429)
    if (error.message?.includes("429") || error.message?.includes("Too many")) {
      return {
        success: false,
        error: "Too many failed login attempts. Please try again later.",
      }
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
