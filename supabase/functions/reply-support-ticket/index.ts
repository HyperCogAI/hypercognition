import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReplyTicketRequest {
  ticket_id: string;
  message: string;
  is_internal?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const {
      ticket_id,
      message,
      is_internal = false,
    }: ReplyTicketRequest = await req.json();

    // Validate input
    if (!ticket_id) {
      throw new Error("Ticket ID is required");
    }
    if (!message || message.trim().length < 1) {
      throw new Error("Message cannot be empty");
    }
    if (message.trim().length > 5000) {
      throw new Error("Message is too long (max 5000 characters)");
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("support_tickets")
      .select("*, support_categories(name)")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      throw new Error("Ticket not found");
    }

    // Check if user is authorized (ticket owner or support agent)
    const isTicketOwner = ticket.user_id === user.id;
    const { data: isAgent } = await supabaseClient
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!isTicketOwner && !isAgent) {
      throw new Error("Unauthorized to reply to this ticket");
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabaseClient
      .from("support_messages")
      .insert({
        ticket_id,
        user_id: user.id,
        message: message.trim(),
        is_internal: isAgent ? is_internal : false,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      throw new Error("Failed to create message");
    }

    // Update ticket status if it was waiting for customer and customer replied
    if (isTicketOwner && ticket.status === "waiting_customer") {
      await supabaseClient
        .from("support_tickets")
        .update({ status: "in_progress" })
        .eq("id", ticket_id);
    }

    // Log activity
    await supabaseClient.from("support_activity_log").insert({
      ticket_id,
      user_id: user.id,
      action: isAgent ? "agent_replied" : "customer_replied",
      details: {
        is_internal,
      },
    });

    // Send email notification (only if not internal)
    if (!is_internal) {
      try {
        // If agent replied, notify customer
        if (isAgent && ticket.user_id !== user.id) {
          const { data: customer } = await supabaseClient.auth.admin.getUserById(
            ticket.user_id
          );

          if (customer?.user?.email) {
            await resend.emails.send({
              from: "Support <onboarding@resend.dev>",
              to: [customer.user.email],
              subject: `New Reply: ${ticket.ticket_number} - ${ticket.subject}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">New Reply to Your Support Ticket</h2>
                  <p>Hello,</p>
                  <p>You have received a new reply to your support ticket.</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
                    <p style="margin: 15px 0 5px 0;"><strong>Reply:</strong></p>
                    <div style="background-color: white; padding: 15px; border-left: 3px solid #4CAF50; margin-top: 10px;">
                      ${message.trim().replace(/\n/g, '<br>')}
                    </div>
                  </div>
                  
                  <p style="margin-top: 20px;">You can reply to this ticket by responding to this email or visiting our support portal.</p>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Best regards,<br>
                    Support Team
                  </p>
                </div>
              `,
            });
          }
        }
        // If customer replied and ticket is assigned, notify agent
        else if (!isAgent && ticket.assigned_to) {
          const { data: agent } = await supabaseClient.auth.admin.getUserById(
            ticket.assigned_to
          );

          if (agent?.user?.email) {
            await resend.emails.send({
              from: "Support <onboarding@resend.dev>",
              to: [agent.user.email],
              subject: `Customer Reply: ${ticket.ticket_number} - ${ticket.subject}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Customer Replied to Ticket</h2>
                  <p>Hello,</p>
                  <p>The customer has replied to ticket <strong>${ticket.ticket_number}</strong>.</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
                    <p style="margin: 5px 0;"><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
                    <p style="margin: 15px 0 5px 0;"><strong>Customer Reply:</strong></p>
                    <div style="background-color: white; padding: 15px; border-left: 3px solid #2196F3; margin-top: 10px;">
                      ${message.trim().replace(/\n/g, '<br>')}
                    </div>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Support System
                  </p>
                </div>
              `,
            });
          }
        }
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: newMessage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in reply-support-ticket function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: error.message === "Unauthorized" || error.message === "Unauthorized to reply to this ticket" ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
