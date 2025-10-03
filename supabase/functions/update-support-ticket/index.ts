import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpdateTicketRequest {
  ticket_id: string;
  status?: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string | null;
  category_id?: string;
  tags?: string[];
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

    const updateData: UpdateTicketRequest = await req.json();
    const { ticket_id, ...updates } = updateData;

    if (!ticket_id) {
      throw new Error("Ticket ID is required");
    }

    // Get current ticket
    const { data: currentTicket, error: ticketError } = await supabaseClient
      .from("support_tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !currentTicket) {
      throw new Error("Ticket not found");
    }

    // Check if user is authorized
    const isTicketOwner = currentTicket.user_id === user.id;
    const { data: isAgent } = await supabaseClient
      .from("admin_users")
      .select("id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    // Only agents can make most updates, owners can only close their own tickets
    if (!isAgent) {
      if (!isTicketOwner) {
        throw new Error("Unauthorized");
      }
      // Users can only update status to closed
      if (updates.status && updates.status !== "closed") {
        throw new Error("Users can only close their own tickets");
      }
      if (Object.keys(updates).some(key => key !== "status")) {
        throw new Error("Users can only update ticket status");
      }
    }

    // Prepare update object
    const updateObject: any = {};
    const activityDetails: any = {};

    if (updates.status && updates.status !== currentTicket.status) {
      updateObject.status = updates.status;
      activityDetails.status_change = {
        from: currentTicket.status,
        to: updates.status,
      };

      // Add system message for status change
      await supabaseClient.from("support_messages").insert({
        ticket_id,
        user_id: user.id,
        message: `Ticket status changed from ${currentTicket.status} to ${updates.status}`,
        is_system: true,
      });
    }

    if (updates.priority && updates.priority !== currentTicket.priority) {
      updateObject.priority = updates.priority;
      activityDetails.priority_change = {
        from: currentTicket.priority,
        to: updates.priority,
      };
    }

    if (updates.assigned_to !== undefined && updates.assigned_to !== currentTicket.assigned_to) {
      updateObject.assigned_to = updates.assigned_to;
      activityDetails.assignment_change = {
        from: currentTicket.assigned_to,
        to: updates.assigned_to,
      };

      // Add system message for assignment
      if (updates.assigned_to) {
        await supabaseClient.from("support_messages").insert({
          ticket_id,
          user_id: user.id,
          message: `Ticket assigned to support agent`,
          is_system: true,
        });
      }
    }

    if (updates.category_id && updates.category_id !== currentTicket.category_id) {
      updateObject.category_id = updates.category_id;
      activityDetails.category_change = {
        from: currentTicket.category_id,
        to: updates.category_id,
      };
    }

    if (updates.tags) {
      updateObject.tags = updates.tags;
      activityDetails.tags_updated = true;
    }

    // Apply updates
    if (Object.keys(updateObject).length > 0) {
      const { data: updatedTicket, error: updateError } = await supabaseClient
        .from("support_tickets")
        .update(updateObject)
        .eq("id", ticket_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating ticket:", updateError);
        throw new Error("Failed to update ticket");
      }

      // Log activity
      await supabaseClient.from("support_activity_log").insert({
        ticket_id,
        user_id: user.id,
        action: "ticket_updated",
        details: activityDetails,
      });

      // Send email notification for important changes
      try {
        // Notify customer of status changes
        if (updates.status && currentTicket.user_id !== user.id) {
          const { data: customer } = await supabaseClient.auth.admin.getUserById(
            currentTicket.user_id
          );

          if (customer?.user?.email) {
            let emailSubject = "";
            let emailBody = "";

            if (updates.status === "resolved") {
              emailSubject = `Ticket Resolved: ${currentTicket.ticket_number}`;
              emailBody = `
                <p>Great news! Your support ticket has been resolved.</p>
                <p>If you're satisfied with the resolution, no action is needed. The ticket will be automatically closed.</p>
                <p>If you need further assistance, please reply to this ticket.</p>
              `;
            } else if (updates.status === "closed") {
              emailSubject = `Ticket Closed: ${currentTicket.ticket_number}`;
              emailBody = `<p>Your support ticket has been closed.</p>`;
            } else {
              emailSubject = `Ticket Status Updated: ${currentTicket.ticket_number}`;
              emailBody = `<p>Your support ticket status has been updated to: <strong>${updates.status}</strong></p>`;
            }

            await resend.emails.send({
              from: "Support <onboarding@resend.dev>",
              to: [customer.user.email],
              subject: emailSubject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Support Ticket Update</h2>
                  <p>Hello,</p>
                  ${emailBody}
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${currentTicket.ticket_number}</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${currentTicket.subject}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${updates.status}</p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Best regards,<br>
                    Support Team
                  </p>
                </div>
              `,
            });
          }
        }

        // Notify assigned agent
        if (updates.assigned_to && updates.assigned_to !== currentTicket.assigned_to) {
          const { data: agent } = await supabaseClient.auth.admin.getUserById(
            updates.assigned_to
          );

          if (agent?.user?.email) {
            await resend.emails.send({
              from: "Support <onboarding@resend.dev>",
              to: [agent.user.email],
              subject: `Ticket Assigned: ${currentTicket.ticket_number}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">New Ticket Assigned to You</h2>
                  <p>Hello,</p>
                  <p>A support ticket has been assigned to you.</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${currentTicket.ticket_number}</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${currentTicket.subject}</p>
                    <p style="margin: 5px 0;"><strong>Priority:</strong> ${currentTicket.priority.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${currentTicket.status}</p>
                  </div>
                  
                  <p style="margin-top: 20px;">Please review and respond to this ticket as soon as possible.</p>
                  
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

      return new Response(
        JSON.stringify({
          success: true,
          ticket: updatedTicket,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No updates provided",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in update-support-ticket function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: error.message === "Unauthorized" ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
