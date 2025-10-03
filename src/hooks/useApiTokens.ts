import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ApiToken = Database['public']['Tables']['user_api_tokens']['Row'];
type ApiTokenInsert = Database['public']['Tables']['user_api_tokens']['Insert'];

export const useApiTokens = () => {
  const queryClient = useQueryClient();

  // Fetch API tokens
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['api-tokens'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_api_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create new API token
  const createToken = useMutation({
    mutationFn: async (tokenData: Partial<ApiTokenInsert>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate a random token
      const token = `sk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;
      
      const tokenPrefix = token.substring(0, 12);
      const tokenHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(token)
      ).then(hash => 
        Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      );

      const { data, error } = await supabase
        .from('user_api_tokens')
        .insert({
          user_id: user.id,
          name: tokenData.name || 'New Token',
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          scopes: tokenData.scopes || ['read'],
          rate_limit_per_hour: tokenData.rate_limit_per_hour || 1000,
          expires_at: tokenData.expires_at,
          description: tokenData.description,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, token }; // Return token only once
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
      toast({
        title: 'API Token Created',
        description: 'Save this token now - you won\'t be able to see it again!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API token',
        variant: 'destructive',
      });
    },
  });

  // Revoke API token
  const revokeToken = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('user_api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
      toast({
        title: 'Token Revoked',
        description: 'The API token has been deactivated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke token',
        variant: 'destructive',
      });
    },
  });

  // Delete API token
  const deleteToken = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('user_api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
      toast({
        title: 'Token Deleted',
        description: 'The API token has been permanently deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete token',
        variant: 'destructive',
      });
    },
  });

  return {
    tokens,
    isLoading,
    error,
    createToken: createToken.mutate,
    revokeToken: revokeToken.mutate,
    deleteToken: deleteToken.mutate,
    isCreating: createToken.isPending,
  };
};
