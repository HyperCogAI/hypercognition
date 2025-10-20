import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSignalCommunity(signalId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ['signal-comments', signalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            wallet_address
          )
        `)
        .eq('signal_id', signalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's vote
  const { data: userVote } = useQuery({
    queryKey: ['signal-vote', signalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_votes' as any)
        .select('vote_type')
        .eq('signal_id', signalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as any)?.vote_type || null;
    },
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async (commentText: string) => {
      const { error } = await supabase
        .from('signal_comments' as any)
        .insert({
          signal_id: signalId,
          comment_text: commentText,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-comments', signalId] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote on signal
  const voteSignal = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const { error } = await supabase
        .from('signal_votes' as any)
        .upsert({
          signal_id: signalId,
          vote_type: voteType,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-vote', signalId] });
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-signals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Share signal
  const shareSignal = useMutation({
    mutationFn: async (shareNote: string) => {
      const { error } = await supabase
        .from('signal_shares' as any)
        .insert({
          signal_id: signalId,
          share_note: shareNote,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Signal shared",
        description: "Signal added to community feed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    userVote,
    addComment: addComment.mutate,
    voteSignal: voteSignal.mutate,
    shareSignal: shareSignal.mutate,
    isLoading: addComment.isPending || voteSignal.isPending || shareSignal.isPending,
  };
}
