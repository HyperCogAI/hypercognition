import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLogoRequest {
  agentName: string;
  agentSymbol: string;
  style?: string;
  agentId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentName, agentSymbol, style = "modern minimalist", agentId }: GenerateLogoRequest = await req.json();

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));

    // Create a specific prompt for AI trading agent logos
    const prompt = `${style} logo design for AI trading agent "${agentName}" with symbol "${agentSymbol}", 
                   clean geometric design, technology theme, cryptocurrency style, 
                   simple icon on transparent background, vector art style, 
                   professional fintech branding, sharp lines, gradient colors, 
                   AI and trading elements, ultra high resolution`;

    console.log('Generating logo with prompt:', prompt);

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const imageData = `data:image/png;base64,${base64}`;

    console.log('Logo generated successfully for agent:', agentName);

    // Optionally update the DB if an agentId is provided
    let updated = false;
    try {
      if (agentId) {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
          console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        } else {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
          const { error: updateError } = await admin
            .from('agents')
            .update({ avatar_url: imageData, logo_generated: true })
            .eq('id', agentId);
          if (updateError) {
            console.error('Failed to update agent avatar_url:', updateError.message || updateError);
          } else {
            updated = true;
            console.log('Agent updated with new logo:', agentId);
          }
        }
      }
    } catch (e) {
      console.error('Error while updating agent in DB:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageData,
        agentName,
        agentSymbol,
        updated
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: any) {
    console.error('Error generating logo:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate logo', 
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
};

serve(handler);