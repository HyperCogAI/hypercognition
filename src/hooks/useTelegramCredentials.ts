import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TelegramCredentials {
  id: string;
  user_id: string;
  is_authenticated: boolean;
  telegram_user_id?: string;
  telegram_username?: string;
  telegram_first_name?: string;
  last_validated_at?: string;
}

export function useTelegramCredentials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['telegram-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_user_credentials')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TelegramCredentials | null;
    },
  });

  const authenticate = useMutation({
    mutationFn: async ({ apiId, apiHash, phoneNumber }: { 
      apiId: string; 
      apiHash: string; 
      phoneNumber: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('telegram-authenticate', {
        body: { apiId, apiHash, phoneNumber }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-credentials'] });
      toast({
        title: "Code sent",
        description: "Check your Telegram app for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyCode = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.functions.invoke('telegram-verify-code', {
        body: { code }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-credentials'] });
      toast({
        title: "Authentication successful",
        description: "Your Telegram account is now connected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    credentials,
    isLoading,
    isAuthenticated: credentials?.is_authenticated || false,
    authenticate: authenticate.mutate,
    verifyCode: verifyCode.mutate,
    isAuthenticating: authenticate.isPending || verifyCode.isPending,
  };
}
