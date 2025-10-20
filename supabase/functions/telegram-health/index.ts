// Phase 4.3: Health check endpoint for Telegram integration
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const checks = {
    database: false,
    mtkruto: false,
    encryption: false,
  };

  const errors: string[] = [];

  // Check database connectivity
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { error } = await supabase
      .from('telegram_user_credentials')
      .select('id')
      .limit(1);
    
    if (!error) {
      checks.database = true;
    } else {
      errors.push(`Database check failed: ${error.message}`);
    }
  } catch (error) {
    errors.push(`Database check failed: ${error.message}`);
  }

  // Check MTKruto import
  try {
    const { Client } = await import("jsr:@mtkruto/mtkruto@0.63");
    checks.mtkruto = !!Client;
  } catch (error) {
    errors.push(`MTKruto import failed: ${error.message}`);
  }

  // Check encryption key
  try {
    const key = Deno.env.get('TELEGRAM_ENCRYPTION_KEY');
    if (key && key.length === 64) { // 32 bytes as hex = 64 chars
      checks.encryption = true;
    } else {
      errors.push('TELEGRAM_ENCRYPTION_KEY not configured or invalid');
    }
  } catch (error) {
    errors.push(`Encryption check failed: ${error.message}`);
  }

  const allHealthy = Object.values(checks).every(v => v === true);

  return new Response(
    JSON.stringify({ 
      healthy: allHealthy,
      checks,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }),
    { 
      status: allHealthy ? 200 : 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
});
