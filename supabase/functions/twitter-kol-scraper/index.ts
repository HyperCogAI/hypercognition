import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { createHmac } from "node:crypto";

const supabase = createClient(
  'https://xdinlkmqmjlrmunsjswf.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwitterCredentials {
  user_id: string;
  twitter_api_key_encrypted: string;
  twitter_api_secret_encrypted: string;
  twitter_access_token_encrypted: string;
  twitter_access_secret_encrypted: string;
  rate_limit_remaining: number;
}

interface KOLAccount {
  id: string;
  twitter_username: string;
  watchlist_id: string;
  user_id: string;
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessSecret: string
): string {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, apiSecret, accessSecret);
  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

async function searchRecentTweets(username: string, credentials: TwitterCredentials): Promise<any[]> {
  const url = `https://api.x.com/2/tweets/search/recent?query=from:${username} -is:retweet&max_results=10&tweet.fields=created_at,author_id`;
  const method = "GET";
  
  const oauthHeader = generateOAuthHeader(
    method,
    url,
    credentials.twitter_api_key_encrypted,
    credentials.twitter_api_secret_encrypted,
    credentials.twitter_access_token_encrypted,
    credentials.twitter_access_secret_encrypted
  );

  console.log(`Searching tweets for @${username}`);
  
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  // CRITICAL FIX: Parse and update rate limit from response headers
  const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
  const rateLimitReset = response.headers.get('x-rate-limit-reset');
  
  if (rateLimitRemaining && rateLimitReset) {
    await supabase
      .from('twitter_user_credentials')
      .update({
        rate_limit_remaining: parseInt(rateLimitRemaining),
        rate_limit_reset_at: new Date(parseInt(rateLimitReset) * 1000).toISOString(),
      })
      .eq('user_id', credentials.user_id);
  }

  if (!response.ok) {
    const error = await response.text();
    console.error(`Twitter API error for @${username}:`, error);
    throw new Error(`Twitter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Twitter KOL scraper...');

    // Get all active watchlists with valid credentials
    const { data: watchlists, error: watchlistError } = await supabase
      .from('twitter_kol_watchlists')
      .select(`
        id,
        user_id,
        twitter_kol_accounts (
          id,
          twitter_username,
          priority,
          last_checked_at
        )
      `)
      .eq('is_active', true);

    if (watchlistError) throw watchlistError;
    if (!watchlists || watchlists.length === 0) {
      console.log('No active watchlists found');
      return new Response(JSON.stringify({ message: 'No active watchlists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${watchlists.length} active watchlists`);

    // Process each watchlist
    for (const watchlist of watchlists) {
      console.log(`Processing watchlist ${watchlist.id} for user ${watchlist.user_id}`);

      // Get user's Twitter credentials
      const { data: creds, error: credsError } = await supabase
        .from('twitter_user_credentials')
        .select('*')
        .eq('user_id', watchlist.user_id)
        .eq('is_valid', true)
        .single();

      if (credsError || !creds) {
        console.log(`No valid credentials for user ${watchlist.user_id}`);
        continue;
      }

      // Check rate limits
      if (creds.rate_limit_remaining < 10) {
        console.log(`Rate limit too low for user ${watchlist.user_id}: ${creds.rate_limit_remaining}`);
        continue;
      }

      // Process each KOL account
      const accounts = watchlist.twitter_kol_accounts || [];
      for (const account of accounts) {
        try {
          const tweets = await searchRecentTweets(account.twitter_username, creds as TwitterCredentials);
          console.log(`Found ${tweets.length} tweets for @${account.twitter_username}`);

          if (tweets.length > 0) {
            // Call AI analyzer
            const analyzerResponse = await supabase.functions.invoke('twitter-kol-ai-analyzer', {
              body: {
                tweets,
                kol_username: account.twitter_username,
                kol_account_id: account.id,
                watchlist_id: watchlist.id,
                user_id: watchlist.user_id,
              },
            });

            if (analyzerResponse.error) {
              console.error('AI analyzer error:', analyzerResponse.error);
            }
          }

          // Update last_checked_at
          await supabase
            .from('twitter_kol_accounts')
            .update({ last_checked_at: new Date().toISOString() })
            .eq('id', account.id);

        } catch (error: any) {
          console.error(`Error processing @${account.twitter_username}:`, error);
          
          // CRITICAL FIX: Log error to database for user visibility
          await supabase.from('watchlist_sync_errors').insert({
            watchlist_id: watchlist.id,
            user_id: watchlist.user_id,
            error_type: 'twitter_api_error',
            error_message: error.message || 'Unknown error',
            function_name: 'twitter-kol-scraper',
            metadata: {
              kol_username: account.twitter_username,
              kol_account_id: account.id,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }

      // Update rate limits
      await supabase
        .from('twitter_user_credentials')
        .update({
          rate_limit_remaining: Math.max(0, creds.rate_limit_remaining - accounts.length),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', watchlist.user_id);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Scraper completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Scraper error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
