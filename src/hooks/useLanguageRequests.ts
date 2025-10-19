import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LanguageRequest {
  id: string;
  user_id: string;
  language_code: string;
  language_name: string;
  native_name: string | null;
  priority: string;
  status: string;
  votes: number;
  created_at: string;
  updated_at: string;
  user_voted?: boolean;
}

export const useLanguageRequests = () => {
  const [requests, setRequests] = useState<LanguageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('language_requests')
        .select('*')
        .order('votes', { ascending: false });

      if (requestsError) throw requestsError;

      // Check which requests the user has voted on
      if (user) {
        const { data: votesData } = await supabase
          .from('language_request_votes')
          .select('request_id')
          .eq('user_id', user.id);

        const votedRequestIds = new Set(votesData?.map(v => v.request_id) || []);

        const requestsWithVotes = requestsData?.map(req => ({
          ...req,
          user_voted: votedRequestIds.has(req.id)
        })) || [];

        setRequests(requestsWithVotes);
      } else {
        setRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Failed to fetch language requests:', error);
      toast({
        title: "Error loading requests",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const createRequest = async (languageCode: string, languageName: string, nativeName?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a request",
          variant: "destructive"
        });
        return false;
      }

      // Check if request already exists
      const { data: existing } = await supabase
        .from('language_requests')
        .select('id')
        .eq('language_code', languageCode)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Request already exists",
          description: "This language has already been requested. You can vote for it!",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('language_requests')
        .insert({
          user_id: user.id,
          language_code: languageCode,
          language_name: languageName,
          native_name: nativeName,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Thank you for your suggestion!",
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Failed to create request:', error);
      toast({
        title: "Error submitting request",
        description: "Please try again",
        variant: "destructive"
      });
      return false;
    }
  };

  const voteRequest = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to vote",
          variant: "destructive"
        });
        return false;
      }

      const { data, error } = await supabase.rpc('vote_language_request', {
        request_id_param: requestId
      });

      if (error) throw error;

      const result = data as { voted: boolean; message: string };
      
      toast({
        title: result.voted ? "Vote added" : "Vote removed",
        description: result.message,
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Failed to vote:', error);
      toast({
        title: "Error voting",
        description: "Please try again",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };

    loadData();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchRequests();
    });

    // Subscribe to realtime updates for language requests
    const channel = supabase
      .channel('language-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'language_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    requests,
    loading,
    createRequest,
    voteRequest,
    refetch: fetchRequests
  };
};