import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Create default preferences if they don't exist
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    },
  });

  // Update notification preferences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferencesUpdate>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
};
