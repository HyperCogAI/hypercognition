import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  contentType: 'comment' | 'agent' | 'profile';
  contentId: string;
  action: 'approved' | 'rejected' | 'flagged';
  reason?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminData } = await supabaseClient
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminData) {
      throw new Error("Access denied - admin privileges required");
    }

    const { contentType, contentId, action, reason, notes }: ModerationRequest = await req.json();

    // Record the moderation action
    const { data: moderation, error: moderationError } = await supabaseClient
      .from('content_moderation')
      .insert({
        content_type: contentType,
        content_id: contentId,
        moderator_id: user.id,
        action,
        reason,
        notes
      })
      .select()
      .single();

    if (moderationError) {
      throw moderationError;
    }

    // Apply the moderation action based on content type
    if (contentType === 'comment' && action === 'rejected') {
      // Hide or delete the comment
      await supabaseClient
        .from('agent_comments')
        .update({ content: '[Comment removed by moderator]' })
        .eq('id', contentId);
    }

    // Send notification to content creator if rejected
    if (action === 'rejected') {
      let userId = null;
      
      // Get the user who created the content
      if (contentType === 'comment') {
        const { data: comment } = await supabaseClient
          .from('agent_comments')
          .select('user_id')
          .eq('id', contentId)
          .single();
        userId = comment?.user_id;
      }

      if (userId) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'moderation',
            title: 'Content Moderated',
            message: `Your ${contentType} has been ${action}${reason ? `: ${reason}` : ''}`,
            data: { contentType, contentId, action, reason }
          });
      }
    }

    console.log("Content moderation action completed:", { contentType, contentId, action });

    return new Response(JSON.stringify({ 
      success: true, 
      moderation 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in content-moderation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);