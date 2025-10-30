import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type OnboardingStep = 'welcome' | 'connect_wallet' | 'preferences' | 'complete_profile' | 'done';

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateOnboardingStepMutation = useMutation({
    mutationFn: async (step: number) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ onboarding_step: step } as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 99 
        } as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast.success('Welcome to HyperCognition! 🎉');
    },
    onError: (error: Error) => {
      toast.error('Failed to complete onboarding: ' + error.message);
    },
  });

  const skipOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: -1 
        } as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast.info('You can complete your profile anytime from settings');
    },
  });

  return {
    updateStep: updateOnboardingStepMutation.mutate,
    completeOnboarding: completeOnboardingMutation.mutate,
    skipOnboarding: skipOnboardingMutation.mutate,
    isUpdating: updateOnboardingStepMutation.isPending || completeOnboardingMutation.isPending,
  };
}
