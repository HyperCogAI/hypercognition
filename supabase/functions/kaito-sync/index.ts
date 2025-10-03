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
  rank_30d?: number;
}

interface KaitoLeaderboardEntry {
  user_id: string;
  username: string;
  yaps_30d: number;
  rank: number;
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

    const { agentIds, usernames, mode = 'on-demand', fetchLeaderboard = false } = await req.json();
    
    console.log('Kaito sync started', { agentIds, usernames, mode, fetchLeaderboard });

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

    // Fetch leaderboard first to get rankings
    let leaderboardMap = new Map<string, number>();
    if (fetchLeaderboard || mode === 'leaderboard') {
      try {
        console.log('Fetching Kaito leaderboard for rankings...');
        const leaderboardUrl = 'https://api.kaito.ai/api/v1/leaderboard?period=30d&limit=500';
        const leaderboardResp = await fetch(leaderboardUrl, {
          headers: {
            'accept': 'application/json',
            'cache-control': 'no-cache',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (leaderboardResp.ok) {
          const leaderboardData = await leaderboardResp.json();
          const entries = leaderboardData.data || leaderboardData.leaderboard || leaderboardData;
          if (Array.isArray(entries)) {
            entries.forEach((entry: any, index: number) => {
              const username = (entry.username || entry.user_name || entry.handle || '').toString().replace(/^@+/, '');
              const rank = entry.rank || (index + 1);
              if (username) {
                leaderboardMap.set(username.toLowerCase(), rank);
              }
            });
            console.log(`Loaded ${leaderboardMap.size} rankings from leaderboard`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    }

    // Rate limit: 100 calls per 5 minutes = ~3 seconds between calls to be safe
    const delayBetweenCalls = 3000;

    async function fetchKaitoWithRetry(username: string, retries = 4): Promise<KaitoYapsResponse> {
      const base = username.replace(/^@+/, '');
      const candidates = [base, '@' + base, base.toLowerCase()];
      let attempt = 0;
      let lastErr: any = null;
      while (attempt <= retries) {
        const candidate = candidates[attempt % candidates.length];
        try {
          const url = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(candidate)}`;
          const resp = await fetch(url, {
            headers: {
              'accept': 'application/json',
              'cache-control': 'no-cache',
            },
            signal: AbortSignal.timeout(10000)
          });

          if (!resp.ok) throw new Error(`API returned ${resp.status}`);

          const contentType = resp.headers.get('content-type') || '';
          const raw = await resp.text();
          if (!raw || raw.trim() === '') {
            throw new Error('Empty response from Kaito');
          }

          let json: any;
          try {
            // Prefer JSON when possible
            json = contentType.includes('application/json') ? JSON.parse(raw) : JSON.parse(raw);
          } catch (e) {
            console.error('Kaito JSON parse error. Body snippet:', raw.slice(0, 200));
            throw new Error('Invalid JSON from Kaito');
          }

          // Normalize potential field variations from the API
          const src = (json && typeof json === 'object' && json.data) ? json.data : json;
          const pick = (...keys: (string | number)[]) => {
            for (const k of keys) {
              const key = typeof k === 'number' ? String(k) : k;
              if (src && src[key] != null) return src[key];
            }
            return 0;
          };
          const name = (src.username ?? src.user_name ?? src.handle ?? candidate)?.toString() ?? candidate;

          const normalized: KaitoYapsResponse = {
            user_id: (src.user_id ?? src.userId ?? src.id ?? '').toString(),
            username: name.replace(/^@+/, ''),
            yaps_all: Number(pick('yaps_all','yapsAll','total')),
            yaps_l24h: Number(pick('yaps_l24h','yaps_24h','yaps24h','l24h','24h')),
            yaps_l48h: Number(pick('yaps_l48h','yaps_48h','yaps48h','l48h','48h')),
            yaps_l7d: Number(pick('yaps_l7d','yaps_7d','yaps7d','l7d','7d')),
            yaps_l30d: Number(pick('yaps_l30d','yaps_30d','yaps30d','l30d','30d')),
            yaps_l3m: Number(pick('yaps_l3m','yaps_3m','yaps3m','l3m','3m')),
            yaps_l6m: Number(pick('yaps_l6m','yaps_6m','yaps6m','l6m','6m')),
            yaps_l12m: Number(pick('yaps_l12m','yaps_12m','yaps12m','l12m','12m')),
            rank_30d: src.rank || leaderboardMap.get(name.toLowerCase())
          };

          if (!normalized.username) throw new Error('Missing username in Kaito response');
          return normalized;
        } catch (e) {
          lastErr = e;
          // Exponential backoff with jitter
          const delay = Math.min(5000, 500 + attempt * 750);
          await new Promise(r => setTimeout(r, delay));
          attempt++;
          continue;
        }
      }
      throw lastErr ?? new Error('Unknown fetch error');
    }

    for (const username of usernameList) {
      try {
        // Fetch from Kaito API with retries and timeout
        const yapsData = await fetchKaitoWithRetry(username, 4);
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
          const hasAny = [
            yapsData.yaps_all, yapsData.yaps_l24h, yapsData.yaps_l48h,
            yapsData.yaps_l7d, yapsData.yaps_l30d, yapsData.yaps_l3m,
            yapsData.yaps_l6m, yapsData.yaps_l12m,
          ].some((v) => Number(v) > 0);

          if (!hasAny) {
            console.warn(`No Yaps returned for ${username}, skipping upsert.`);
            results.failed.push({ username, error: 'no_data' });
          } else {
            // Check if rank exists in leaderboard if not already set
            const rank = yapsData.rank_30d || leaderboardMap.get(yapsData.username.toLowerCase());
            
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
                rank_30d: rank || null,
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
