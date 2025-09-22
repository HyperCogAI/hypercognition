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
      
      // Mock data for now - will use real data once migration is run
      const mockCompetitions: Competition[] = [
        {
          id: '1',
          title: 'Weekly Trading Championship',
          description: 'Compete for the highest returns in a week-long trading battle',
          competition_type: 'weekly_returns',
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          prize_pool: 10000,
          entry_fee: 100,
          current_participants: 47,
          max_participants: 100,
          is_active: true,
          rules: { max_position_size: 0.1 },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Risk Management Masters',
          description: 'Achieve the best risk-adjusted returns',
          competition_type: 'risk_adjusted',
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          prize_pool: 25000,
          entry_fee: 250,
          current_participants: 23,
          max_participants: 50,
          is_active: true,
          rules: { max_drawdown: 0.05 },
          created_at: new Date().toISOString()
        }
      ];

      setCompetitions(mockCompetitions);

      // Calculate stats
      const totalPrizePool = mockCompetitions.reduce((sum, comp) => sum + (comp.prize_pool || 0), 0);
      const activeCompetitions = mockCompetitions.filter(comp => comp.is_active).length;
      const totalParticipants = mockCompetitions.reduce((sum, comp) => sum + comp.current_participants, 0);

      setStats({
        totalPrizePool,
        activeCompetitions,
        totalParticipants,
        myParticipations: 1 // Mock data
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