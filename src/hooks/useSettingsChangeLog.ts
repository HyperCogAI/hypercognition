import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSettingsChangeLog = () => {
  const { data: changeLog, isLoading, error } = useQuery({
    queryKey: ['settings-change-log'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('settings_change_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return {
    changeLog,
    isLoading,
    error,
  };
};
