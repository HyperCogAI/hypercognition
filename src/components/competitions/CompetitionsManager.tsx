import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Target,
  Clock,
  Medal,
  Crown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useCompetitions } from '@/hooks/useCompetitions';
import { formatDistanceToNow, format } from 'date-fns';

export const CompetitionsManager = () => {
  const {
    competitions,
    leaderboard,
    stats,
    loading,
    fetchLeaderboard,
    joinCompetition,
    updateScores
  } = useCompetitions();

  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);

  const getCompetitionStatus = (competition: any) => {
    const now = new Date();
    const start = new Date(competition.start_date);
    const end = new Date(competition.end_date);

    if (now < start) return { status: 'upcoming', color: 'bg-blue-500', label: 'Upcoming' };
    if (now > end) return { status: 'ended', color: 'bg-gray-500', label: 'Ended' };
    return { status: 'active', color: 'bg-green-500', label: 'Active' };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold">#{rank}</span>;
    }
  };

  const handleViewLeaderboard = (competitionId: string) => {
    setSelectedCompetition(competitionId);
    fetchLeaderboard(competitionId);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Competitions</p>
                <p className="text-2xl font-bold">{stats.activeCompetitions}</p>
              </div>
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Prize Pool</p>
                <p className="text-2xl font-bold">${stats.totalPrizePool.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Competitions</p>
                <p className="text-2xl font-bold">{stats.myParticipations}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#16181f]">
          <TabsTrigger value="competitions">All Competitions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitions.map((competition) => {
              const statusInfo = getCompetitionStatus(competition);
              const progress = competition.max_participants 
                ? (competition.current_participants / competition.max_participants) * 100 
                : 0;

              return (
                <Card key={competition.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{competition.title}</CardTitle>
                      </div>
                      <Badge className={`${statusInfo.color} text-white border-none`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>{competition.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Prize and Entry Fee */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg">
                        <p className="text-lg font-bold text-yellow-700">
                          ${competition.prize_pool?.toLocaleString()}
                        </p>
                        <p className="text-xs text-yellow-600">Prize Pool</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold">
                          ${competition.entry_fee?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Entry Fee</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {format(new Date(competition.start_date), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {statusInfo.status === 'active' 
                            ? `Ends ${formatDistanceToNow(new Date(competition.end_date), { addSuffix: true })}`
                            : `Ends: ${format(new Date(competition.end_date), 'MMM dd, yyyy HH:mm')}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Participants Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participants</span>
                        <span>
                          {competition.current_participants}
                          {competition.max_participants && ` / ${competition.max_participants}`}
                        </span>
                      </div>
                      {competition.max_participants && (
                        <Progress value={progress} className="h-2" />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => joinCompetition(competition.id)}
                        disabled={statusInfo.status === 'ended'}
                        className="flex-1"
                      >
                        {statusInfo.status === 'upcoming' ? 'Register' : 'Join Now'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleViewLeaderboard(competition.id)}
                      >
                        View Leaderboard
                      </Button>
                    </div>

                    {/* Competition Type Badge */}
                    <div className="flex justify-center">
                      <Badge variant="outline" className="text-xs">
                        {competition.competition_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {selectedCompetition ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Competition Leaderboard
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateScores(selectedCompetition)}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Update Scores
                  </Button>
                </div>
                <CardDescription>
                  Real-time rankings based on trading performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                        index < 3 ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(participant.rank || index + 1)}
                        </div>
                        
                        <div>
                          <p className="font-medium">Trader #{participant.user_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {participant.total_trades} trades • {participant.win_rate.toFixed(1)}% win rate
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${
                          participant.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-bold">
                            {participant.pnl_percentage >= 0 ? '+' : ''}{participant.pnl_percentage.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${participant.current_balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Select a competition to view its leaderboard
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};