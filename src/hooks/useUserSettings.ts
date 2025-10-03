import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }

      return data;
    },
  });

  // Update user settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettingsUpdate>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
