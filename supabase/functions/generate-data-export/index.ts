import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { requestId } = await req.json();

    // Generate comprehensive data export
    const exportData = await generateUserDataExport(supabase, user.id);

    // Log the export request
    await supabase.from('security_audit_log').insert({
      user_id: user.id,
      action: 'data_export_generated',
      resource: 'gdpr_compliance',
      details: {
        request_id: requestId,
        data_categories: Object.keys(exportData),
        export_timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      exportData,
      metadata: {
        generated_at: new Date().toISOString(),
        user_id: user.id,
        request_id: requestId,
        data_retention_notice: "This export contains all personal data we hold about you. Please store it securely."
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Data export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const generateUserDataExport = async (supabase: any, userId: string) => {
  const exportData: any = {
    user_profile: {},
    trading_data: {},
    portfolio_data: {},
    notification_preferences: {},
    security_settings: {},
    audit_logs: {}
  };

  try {
    // Export user profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      exportData.user_profile = {
        ...profileData,
        note: "Your basic profile information"
      };
    }

    // Export portfolio data
    const { data: portfolioData } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId);

    exportData.portfolio_data = {
      holdings: portfolioData || [],
      note: "Your investment portfolio and holdings"
    };

    // Export orders and trading history
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);

    exportData.trading_data = {
      orders: ordersData || [],
      note: "Your trading history and order data"
    };

    // Export notification preferences
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (notificationPrefs) {
      exportData.notification_preferences = {
        ...notificationPrefs,
        note: "Your notification and communication preferences"
      };
    }

    // Export security and audit logs (limited for privacy)
    const { data: securityLogs } = await supabase
      .from('security_audit_log')
      .select('action, resource, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    exportData.audit_logs = {
      recent_activity: securityLogs || [],
      note: "Recent security and account activity (last 100 events)"
    };

    // Export agent ratings and comments
    const { data: ratingsData } = await supabase
      .from('agent_ratings')
      .select('*')
      .eq('user_id', userId);

    const { data: commentsData } = await supabase
      .from('agent_comments')
      .select('*')
      .eq('user_id', userId);

    exportData.social_data = {
      ratings: ratingsData || [],
      comments: commentsData || [],
      note: "Your ratings and comments on agents"
    };

    // Export favorites
    const { data: favoritesData } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId);

    exportData.preferences = {
      favorites: favoritesData || [],
      note: "Your saved favorites and preferences"
    };

  } catch (error) {
    console.error('Error generating data export:', error);
    exportData.export_error = {
      message: "Some data could not be exported due to technical issues",
      timestamp: new Date().toISOString()
    };
  }

  return exportData;
};

serve(handler);