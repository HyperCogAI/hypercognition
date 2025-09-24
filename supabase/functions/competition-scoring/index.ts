import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitionScoreUpdate {
  competitionId: string;
  participantId?: string;
  orderId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { competitionId, participantId, orderId } = await req.json() as CompetitionScoreUpdate;
    
    console.log('Processing competition score update:', { competitionId, participantId, orderId });

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('trading_competitions')
      .select('*')
      .eq('id', competitionId)
      .eq('is_active', true)
      .single();

    if (compError || !competition) {
      console.error('Competition not found or inactive:', compError);
      return new Response(
        JSON.stringify({ error: 'Competition not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if competition is still running
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);

    if (now < startDate || now > endDate) {
      console.log('Competition not active (outside date range)');
      return new Response(
        JSON.stringify({ message: 'Competition not currently active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let participantsToUpdate = [];

    if (participantId) {
      // Update specific participant
      participantsToUpdate = [participantId];
    } else {
      // Update all participants in the competition
      const { data: allParticipants, error: participantsError } = await supabase
        .from('competition_participants')
        .select('user_id')
        .eq('competition_id', competitionId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch participants' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      participantsToUpdate = allParticipants.map(p => p.user_id);
    }

    const updatedParticipants = [];

    // Calculate scores for each participant
    for (const userId of participantsToUpdate) {
      try {
        // Get participant record
        const { data: participant, error: partError } = await supabase
          .from('competition_participants')
          .select('*')
          .eq('competition_id', competitionId)
          .eq('user_id', userId)
          .single();

        if (partError || !participant) {
          console.error('Participant not found:', userId);
          continue;
        }

        // Calculate performance based on orders placed during competition
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'filled')
          .gte('created_at', competition.start_date)
          .lte('created_at', competition.end_date);

        if (ordersError) {
          console.error('Error fetching orders for participant:', userId, ordersError);
          continue;
        }

        // Calculate trading metrics
        let totalPnL = 0;
        let totalVolume = 0;
        let winningTrades = 0;
        let totalTrades = orders?.length || 0;

        if (orders && orders.length > 0) {
          for (const order of orders) {
            const volume = order.filled_amount * (order.price || 0);
            totalVolume += volume;

            // Simulate P&L calculation (in real scenario, would calculate based on current vs entry price)
            const simulatedPnL = volume * (Math.random() * 0.1 - 0.05); // ±5% random P&L
            totalPnL += simulatedPnL;

            if (simulatedPnL > 0) {
              winningTrades++;
            }
          }
        }

        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
        const pnlPercentage = participant.starting_balance > 0 
          ? (totalPnL / participant.starting_balance) * 100 
          : 0;
        const currentBalance = participant.starting_balance + totalPnL;

        // Update participant record
        const { error: updateError } = await supabase
          .from('competition_participants')
          .update({
            current_balance: currentBalance,
            total_pnl: totalPnL,
            pnl_percentage: pnlPercentage,
            total_trades: totalTrades,
            win_rate: winRate,
            last_updated: new Date().toISOString()
          })
          .eq('id', participant.id);

        if (updateError) {
          console.error('Error updating participant:', updateError);
          continue;
        }

        updatedParticipants.push({
          userId,
          totalPnL,
          pnlPercentage,
          currentBalance,
          totalTrades,
          winRate
        });

      } catch (error) {
        console.error('Error calculating score for participant:', userId, error);
        continue;
      }
    }

    // Update rankings
    const { data: allParticipants, error: rankingError } = await supabase
      .from('competition_participants')
      .select('*')
      .eq('competition_id', competitionId)
      .order('pnl_percentage', { ascending: false });

    if (!rankingError && allParticipants) {
      // Update ranks
      for (let i = 0; i < allParticipants.length; i++) {
        await supabase
          .from('competition_participants')
          .update({ rank: i + 1 })
          .eq('id', allParticipants[i].id);
      }
    }

    console.log('Competition scores updated successfully');

    return new Response(
      JSON.stringify({
        message: 'Competition scores updated successfully',
        competitionId,
        participantsUpdated: updatedParticipants.length,
        details: updatedParticipants
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in competition scoring engine:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});