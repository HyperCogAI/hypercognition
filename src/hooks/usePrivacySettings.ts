import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PrivacySettings = Database['public']['Tables']['privacy_settings']['Row'];
type PrivacySettingsUpdate = Database['public']['Tables']['privacy_settings']['Update'];

export const usePrivacySettings = () => {
  const queryClient = useQueryClient();

  // Fetch privacy settings
  const { data: privacySettings, isLoading, error } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Create default privacy settings if they don't exist
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('privacy_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }

      return data;
    },
  });

  // Update privacy settings
  const updatePrivacySettings = useMutation({
    mutationFn: async (updates: Partial<PrivacySettingsUpdate>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      toast({
        title: 'Privacy Settings Updated',
        description: 'Your privacy preferences have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update privacy settings',
        variant: 'destructive',
      });
    },
  });

  return {
    privacySettings,
    isLoading,
    error,
    updatePrivacySettings: updatePrivacySettings.mutate,
    isUpdating: updatePrivacySettings.isPending,
  };
};
