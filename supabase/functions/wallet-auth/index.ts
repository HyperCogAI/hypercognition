// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { address, walletType } = await req.json();

    if (!address || !walletType || !["evm", "solana"].includes(walletType)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid address/walletType" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://xdinlkmqmjlrmunsjswf.supabase.co";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ error: "Server not configured with service role key" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const email = `${String(address).toLowerCase()}@wallet.hypercognition.app`;

    // 1) Create user if not exists (confirmed, so no email flow needed)
    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        wallet_address: String(address).toLowerCase(),
        wallet_type: walletType,
        auth_method: "wallet",
        security_level: "enhanced",
      },
    });

    if (createErr) {
      const msg = String(createErr.message || '');
      const code = (createErr as any)?.code;
      const status = (createErr as any)?.status;
      // Allow "already registered" and email_exists cases to proceed
      const isAlready = msg.toLowerCase().includes('already') || code === 'email_exists' || status === 422;
      if (!isAlready) {
        return new Response(
          JSON.stringify({ error: msg || "Failed to create user" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 2) Generate an OTP we can exchange client-side for a session
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${SUPABASE_URL}/auth/v1/verify`,
      },
    });

    if (linkErr) {
      return new Response(
        JSON.stringify({ error: linkErr.message || "Failed to generate OTP link" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token_hash = (linkData as any)?.properties?.hashed_token ?? (linkData as any)?.properties?.token_hash;

    if (!token_hash) {
      return new Response(
        JSON.stringify({ error: "Token hash not available in generated magic link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ email, token_hash }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
