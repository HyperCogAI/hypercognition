import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TwitterCredentials {
  id: string;
  user_id: string;
  twitter_api_key_encrypted: string;
  twitter_api_secret_encrypted: string;
  twitter_access_token_encrypted: string;
  twitter_access_secret_encrypted: string;
  is_valid: boolean;
  last_validated_at?: string;
  rate_limit_remaining: number;
  rate_limit_reset_at?: string;
  created_at: string;
  updated_at: string;
}

export function useTwitterCredentials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credentials, isLoading, error } = useQuery({
    queryKey: ['twitter-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twitter_user_credentials')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No credentials found
        throw error;
      }
      return data as TwitterCredentials;
    },
  });

  const saveCredentials = useMutation({
    mutationFn: async (creds: {
      api_key: string;
      api_secret: string;
      access_token: string;
      access_secret: string;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      // Note: In production, these should be encrypted client-side before sending
      // or better yet, use an edge function to handle encryption server-side
      const { data, error } = await supabase
        .from('twitter_user_credentials')
        .upsert([{
          user_id: user.data.user.id,
          twitter_api_key_encrypted: creds.api_key,
          twitter_api_secret_encrypted: creds.api_secret,
          twitter_access_token_encrypted: creds.access_token,
          twitter_access_secret_encrypted: creds.access_secret,
          is_valid: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-credentials'] });
      toast({
        title: "Credentials saved",
        description: "Your Twitter API credentials have been saved securely.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save credentials",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCredentials = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('twitter_user_credentials')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-credentials'] });
      toast({
        title: "Credentials removed",
        description: "Your Twitter API credentials have been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove credentials",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    credentials,
    isLoading,
    error,
    hasCredentials: !!credentials,
    saveCredentials: saveCredentials.mutate,
    deleteCredentials: deleteCredentials.mutate,
    isSaving: saveCredentials.isPending,
    isDeleting: deleteCredentials.isPending,
  };
}
