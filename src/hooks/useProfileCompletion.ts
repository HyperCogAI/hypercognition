import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface ProfileCompletionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
}

export function useProfileCompletion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completionScore, isLoading } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return (data as any)?.profile_completion_percentage || 0;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: hasWallet } = useQuery({
    queryKey: ['user-has-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('user_verified_wallets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
    enabled: !!user?.id,
  });

  const steps: ProfileCompletionStep[] = [
    {
      id: 'display_name',
      title: 'Set Display Name',
      description: 'Choose a unique display name',
      completed: !!profile?.display_name && profile.display_name !== 'Anonymous',
      points: 20,
    },
    {
      id: 'avatar',
      title: 'Upload Avatar',
      description: 'Add a profile picture',
      completed: !!profile?.avatar_url,
      points: 20,
    },
    {
      id: 'bio',
      title: 'Write Bio',
      description: 'Tell others about yourself',
      completed: !!profile?.bio && profile.bio.length > 10,
      points: 15,
    },
    {
      id: 'username',
      title: 'Set Username',
      description: 'Choose a unique username',
      completed: !!profile?.username,
      points: 15,
    },
    {
      id: 'email_verified',
      title: 'Verify Email',
      description: 'Verify your email address',
      completed: !!((profile as any)?.email_verified),
      points: 15,
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your crypto wallet',
      completed: !!hasWallet,
      points: 15,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;

  const updateCompletionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // Calculate completion score client-side
      let score = 0;
      
      if (profile?.display_name && profile.display_name !== 'Anonymous') score += 20;
      if (profile?.avatar_url) score += 20;
      if (profile?.bio && profile.bio.length > 10) score += 15;
      if (profile?.username) score += 15;
      if ((profile as any)?.email_verified) score += 15;
      if (hasWallet) score += 15;

      const newScore = Math.min(score, 100);

      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_completion_percentage: newScore } as any)
        .eq('user_id', user.id);

      if (error) throw error;
      return newScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-completion', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });

  return {
    completionScore: completionScore || 0,
    steps,
    completedSteps,
    totalSteps,
    isLoading,
    refreshCompletion: updateCompletionMutation.mutate,
  };
}
