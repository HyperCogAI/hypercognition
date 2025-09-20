import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLogoRequest {
  agentName: string;
  agentSymbol: string;
  style?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentName, agentSymbol, style = "modern minimalist" }: GenerateLogoRequest = await req.json();

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

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageData,
        agentName,
        agentSymbol
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