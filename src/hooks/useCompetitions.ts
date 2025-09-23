import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Competition {
  id: string;
  title: string;
  description?: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  prize_pool?: number;
  entry_fee?: number;
  current_participants: number;
  max_participants?: number;
  is_active: boolean;
  rules?: any;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  competition_id: string;
  starting_balance: number;
  current_balance: number;
  total_pnl: number;
  pnl_percentage: number;
  total_trades: number;
  win_rate: number;
  rank?: number;
  joined_at: string;
  last_updated: string;
}

interface CompetitionStats {
  totalPrizePool: number;
  activeCompetitions: number;
  totalParticipants: number;
  myParticipations: number;
}

export const useCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [myParticipations, setMyParticipations] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [stats, setStats] = useState<CompetitionStats>({
    totalPrizePool: 0,
    activeCompetitions: 0,
    totalParticipants: 0,
    myParticipations: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real competitions from Supabase
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (competitionsError) throw competitionsError;

      // Transform data to match interface
      const competitions: Competition[] = (competitionsData || []).map(comp => ({
        id: comp.id,
        title: comp.name,
        description: comp.description || '',
        competition_type: comp.type,
        start_date: comp.start_date,
        end_date: comp.end_date,
        prize_pool: comp.total_prize_pool || 0,
        entry_fee: comp.entry_fee || 0,
        current_participants: 0, // Will be calculated separately
        max_participants: comp.max_participants || 0,
        is_active: comp.status === 'active',
        rules: comp.rules || {},
        created_at: comp.created_at
      }));

      setCompetitions(competitions);

      // Calculate stats
      const totalPrizePool = competitions.reduce((sum, comp) => sum + (comp.prize_pool || 0), 0);
      const activeCompetitions = competitions.filter(comp => comp.is_active).length;
      const totalParticipants = competitions.reduce((sum, comp) => sum + comp.current_participants, 0);

      setStats({
        totalPrizePool,
        activeCompetitions,
        totalParticipants,
        myParticipations: 0 // Can be calculated based on user participation
      });

    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch competitions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLeaderboard = useCallback(async (competitionId: string) => {
    try {
      // Mock leaderboard data
      const mockLeaderboard: Participant[] = [
        {
          id: '1',
          user_id: 'user1',
          competition_id: competitionId,
          starting_balance: 10000,
          current_balance: 11250,
          total_pnl: 1250,
          pnl_percentage: 12.5,
          total_trades: 24,
          win_rate: 67.5,
          rank: 1,
          joined_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          competition_id: competitionId,
          starting_balance: 10000,
          current_balance: 10950,
          total_pnl: 950,
          pnl_percentage: 9.5,
          total_trades: 18,
          win_rate: 72.2,
          rank: 2,
          joined_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          user_id: 'user3',
          competition_id: competitionId,
          starting_balance: 10000,
          current_balance: 10875,
          total_pnl: 875,
          pnl_percentage: 8.75,
          total_trades: 31,
          win_rate: 58.1,
          rank: 3,
          joined_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, []);

  const joinCompetition = useCallback(async (competitionId: string) => {
    try {
      // Mock join competition
      toast({
        title: "Competition Joined!",
        description: "You've successfully joined the competition. Good luck!",
      });

      // Refresh competitions to update participant count
      await fetchCompetitions();
    } catch (error) {
      console.error('Error joining competition:', error);
      toast({
        title: "Error",
        description: "Failed to join competition",
        variant: "destructive"
      });
    }
  }, [fetchCompetitions, toast]);

  const updateScores = useCallback(async (competitionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('competition-scoring', {
        body: { competitionId }
      });

      if (error) {
        console.error('Error updating scores:', error);
        toast({
          title: "Error",
          description: "Failed to update competition scores",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Scores Updated",
        description: `Updated ${data.participantsUpdated} participant scores`,
      });

      // Refresh leaderboard
      await fetchLeaderboard(competitionId);
    } catch (error) {
      console.error('Error in updateScores:', error);
    }
  }, [fetchLeaderboard, toast]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  return {
    competitions,
    myParticipations,
    leaderboard,
    stats,
    loading,
    fetchCompetitions,
    fetchLeaderboard,
    joinCompetition,
    updateScores
  };
};