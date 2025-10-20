import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[recalculate-reputations] Starting daily reputation recalculation`);

    // Get all users who have voted or interacted with signals
    const { data: activeUsers, error: usersError } = await supabase
      .from('signal_votes')
      .select('user_id')
      .limit(1000);

    if (usersError) {
      throw usersError;
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(activeUsers?.map(v => v.user_id) || [])];

    console.log(`[recalculate-reputations] Found ${uniqueUserIds.length} users to recalculate`);

    let successCount = 0;
    let errorCount = 0;

    for (const userId of uniqueUserIds) {
      try {
        // Call the database function to calculate reputation
        const { error: calcError } = await supabase
          .rpc('calculate_user_reputation', { p_user_id: userId });

        if (calcError) {
          console.error(`[recalculate-reputations] Error calculating for user ${userId}:`, calcError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`[recalculate-reputations] Error processing user ${userId}:`, error);
        errorCount++;
      }
    }

    // Update vote weights based on reputation
    const { data: reputations, error: repError } = await supabase
      .from('user_reputation')
      .select('user_id, reputation_tier');

    if (!repError && reputations) {
      for (const rep of reputations) {
        // Calculate vote weight based on tier
        let voteWeight = 1.0;
        switch (rep.reputation_tier) {
          case 'legend':
            voteWeight = 2.0;
            break;
          case 'expert':
            voteWeight = 1.5;
            break;
          case 'contributor':
            voteWeight = 1.2;
            break;
          default:
            voteWeight = 1.0;
        }

        // Update all votes for this user
        await supabase
          .from('signal_votes')
          .update({ vote_weight: voteWeight })
          .eq('user_id', rep.user_id);
      }
    }

    console.log(`[recalculate-reputations] Completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalUsers: uniqueUserIds.length,
        successful: successCount,
        errors: errorCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[recalculate-reputations] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
