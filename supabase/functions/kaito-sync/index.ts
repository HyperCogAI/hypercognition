import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KaitoYapsResponse {
  user_id: string;
  username: string;
  yaps_all: number;
  yaps_l24h: number;
  yaps_l48h: number;
  yaps_l7d: number;
  yaps_l30d: number;
  yaps_l3m: number;
  yaps_l6m: number;
  yaps_l12m: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agentIds, usernames, mode = 'on-demand' } = await req.json();
    
    console.log('Kaito sync started', { agentIds, usernames, mode });

    let usernameList: string[] = [];

    // If agentIds provided, fetch associated Twitter usernames from agents table
    if (agentIds && Array.isArray(agentIds)) {
      const { data: agents, error } = await supabaseClient
        .from('agents')
        .select('id, name, symbol')
        .in('id', agentIds);

      if (error) {
        console.error('Error fetching agents:', error);
      } else if (agents) {
        // Use agent name as Twitter username (agents table has no metadata column)
        usernameList = agents
          .map(agent => agent.name)
          .filter(Boolean);
      }
    }

    // Add direct username list
    if (usernames && Array.isArray(usernames)) {
      usernameList = [...usernameList, ...usernames];
    }

    // Remove duplicates
    usernameList = [...new Set(usernameList)];

    if (usernameList.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No usernames provided or found',
          message: 'Please provide either agentIds or usernames'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Syncing Kaito data for ${usernameList.length} users:`, usernameList);

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Rate limit: 100 calls per 5 minutes = ~3 seconds between calls to be safe
    const delayBetweenCalls = 3000;

    async function fetchKaitoWithRetry(username: string, retries = 2): Promise<KaitoYapsResponse> {
      const url = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`;
      let attempt = 0;
      let lastErr: any = null;
      while (attempt <= retries) {
        try {
          const resp = await fetch(url, { signal: AbortSignal.timeout(7000) });
          if (!resp.ok) throw new Error(`API returned ${resp.status}`);
          const raw = await resp.text();
          let json: any;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            console.error('Kaito JSON parse error. Body snippet:', raw?.slice(0, 200));
            throw new Error('Invalid JSON from Kaito');
          }
          if (!json?.username) throw new Error('Missing username in Kaito response');
          return json as KaitoYapsResponse;
        } catch (e) {
          lastErr = e;
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
            attempt++;
            continue;
          }
          throw lastErr;
        }
      }
      throw lastErr ?? new Error('Unknown fetch error');
    }

    for (const username of usernameList) {
      try {
        // Fetch from Kaito API with retries and timeout
        const yapsData = await fetchKaitoWithRetry(username, 2);
        console.log(`Received Yaps data for ${username}:`, yapsData);

        // Find associated agent if exists (match by name or symbol)
        const { data: agent } = await supabaseClient
          .from('agents')
          .select('id')
          .or(`name.ilike.%${username}%,symbol.ilike.%${username}%`)
          .maybeSingle();

        // Guard against null usernames
        if (!yapsData.username) {
          results.failed.push({ username, error: 'Empty username in response' });
        } else {
          // Upsert to database
          const { error: upsertError } = await supabaseClient
            .from('kaito_attention_scores')
            .upsert({
              agent_id: agent?.id || null,
              twitter_user_id: yapsData.user_id,
              twitter_username: yapsData.username,
              yaps_24h: yapsData.yaps_l24h,
              yaps_48h: yapsData.yaps_l48h,
              yaps_7d: yapsData.yaps_l7d,
              yaps_30d: yapsData.yaps_l30d,
              yaps_3m: yapsData.yaps_l3m,
              yaps_6m: yapsData.yaps_l6m,
              yaps_12m: yapsData.yaps_l12m,
              yaps_all: yapsData.yaps_all,
              metadata: { raw_response: yapsData },
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'twitter_username'
            });

          if (upsertError) {
            console.error(`Database error for ${username}:`, upsertError);
            results.failed.push({ username, error: upsertError.message });
          } else {
            results.success.push({ username, yaps_all: yapsData.yaps_all });
          }
        }

        // Rate limiting delay (except for last item)
        if (username !== usernameList[usernameList.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        }

      } catch (error: any) {
        console.error(`Error processing ${username}:`, error);
        results.failed.push({ username, error: error?.message || 'Unknown error' });
      }
    }

    console.log('Kaito sync completed:', results);

    return new Response(
      JSON.stringify({
        message: 'Kaito sync completed',
        stats: {
          total: usernameList.length,
          success: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length
        },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in kaito-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
