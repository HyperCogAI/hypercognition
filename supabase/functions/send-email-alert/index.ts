import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@4.0.0';

const supabase = createClient(
  'https://xdinlkmqmjlrmunsjswf.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, signal } = await req.json();

    console.log(`Sending email alert to user ${userId} for signal ${signal.id}`);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      throw new Error('User email not found');
    }

    // Get KOL username
    const { data: kolAccount } = await supabase
      .from('twitter_kol_accounts')
      .select('twitter_username')
      .eq('id', signal.kol_account_id)
      .single();

    const kolUsername = kolAccount?.twitter_username || 'KOL';
    const gemTypeEmoji: Record<string, string> = {
      token: '🪙',
      nft: '🖼️',
      protocol: '⚡',
      airdrop: '🎁',
      alpha: '🔥',
    };
    const emoji = gemTypeEmoji[signal.gem_type] || '🚨';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .signal-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .confidence { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 12px; background: #e5e7eb; border-radius: 12px; margin: 4px; font-size: 12px; }
            .tweet-text { background: #f3f4f6; padding: 16px; border-left: 4px solid #667eea; margin: 16px 0; border-radius: 4px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} Gem Alert from @${kolUsername}</h1>
              <p>AI detected a high-confidence trading signal</p>
            </div>
            <div class="content">
              <div class="signal-card">
                <div style="margin-bottom: 16px;">
                  <span class="confidence">${signal.confidence_score}% Confidence</span>
                  ${signal.gem_type ? `<span class="badge">${signal.gem_type.toUpperCase()}</span>` : ''}
                </div>
                
                <div class="tweet-text">
                  <strong>Tweet:</strong><br/>
                  ${signal.tweet_text}
                </div>

                <div style="margin: 16px 0;">
                  <strong>🤖 AI Analysis:</strong><br/>
                  ${signal.ai_analysis}
                </div>

                ${signal.extracted_data?.tokens && signal.extracted_data.tokens.length > 0 ? `
                  <div style="margin: 16px 0;">
                    <strong>🪙 Detected Tokens:</strong><br/>
                    ${signal.extracted_data.tokens.map((t: any) => 
                      `<span class="badge">$${t.ticker}${t.chain ? ` (${t.chain})` : ''}</span>`
                    ).join(' ')}
                  </div>
                ` : ''}

                <div style="margin-top: 20px;">
                  <a href="https://b6a67e95-6e1f-4ed6-90e2-7be22237d647.lovableproject.com/kol-signals?signal=${signal.id}" class="button">
                    View Full Signal
                  </a>
                  <a href="${signal.tweet_url}" class="button" style="background: #1da1f2;">
                    View Tweet
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>You're receiving this because you have email alerts enabled for KOL signals.</p>
                <p><a href="https://b6a67e95-6e1f-4ed6-90e2-7be22237d647.lovableproject.com/settings/twitter-kols">Manage alert settings</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'HyperCognition KOL Alerts <alerts@hypercognition.io>',
      to: [userData.user.email],
      subject: `${emoji} ${signal.confidence_score}% Gem Alert from @${kolUsername}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw emailError;
    }

    console.log(`Email sent successfully to ${userData.user.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Email alert error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
