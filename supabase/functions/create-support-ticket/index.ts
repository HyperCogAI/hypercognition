import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateTicketRequest {
  subject: string;
  description: string;
  category_id: string;
  priority?: "low" | "medium" | "high" | "urgent";
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

    const {
      subject,
      description,
      category_id,
      priority = "medium",
      tags = [],
    }: CreateTicketRequest = await req.json();

    // Validate input
    if (!subject || subject.trim().length < 5) {
      throw new Error("Subject must be at least 5 characters");
    }
    if (!description || description.trim().length < 10) {
      throw new Error("Description must be at least 10 characters");
    }

    // Generate ticket number
    const { data: ticketNumberData, error: ticketNumberError } =
      await supabaseClient.rpc("generate_ticket_number");

    if (ticketNumberError) {
      console.error("Error generating ticket number:", ticketNumberError);
      throw new Error("Failed to generate ticket number");
    }

    const ticketNumber = ticketNumberData as string;

    // Create ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        user_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
        category_id,
        priority,
        tags,
        status: "open",
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      throw new Error("Failed to create ticket");
    }

    // Create initial system message
    await supabaseClient.from("support_messages").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      message: description.trim(),
      is_system: false,
    });

    // Log activity
    await supabaseClient.from("support_activity_log").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      action: "ticket_created",
      details: {
        priority,
        category_id,
      },
    });

    // Get category name for email
    const { data: category } = await supabaseClient
      .from("support_categories")
      .select("name")
      .eq("id", category_id)
      .single();

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: "Support <onboarding@resend.dev>",
        to: [user.email!],
        subject: `Support Ticket Created: ${ticketNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Support Ticket Created</h2>
            <p>Hello,</p>
            <p>Your support ticket has been created successfully. Our team will review it and respond as soon as possible.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${category?.name || "General"}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> ${priority.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Open</p>
            </div>
            
            <p style="margin-top: 20px;">We'll notify you via email when there are updates to your ticket.</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              Support Team
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
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
    console.error("Error in create-support-ticket function:", error);
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
