import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reminder email check...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get reminder settings
    const { data: settings, error: settingsError } = await supabase
      .from("reminder_settings")
      .select("*")
      .single();

    if (settingsError) throw settingsError;

    const reminderDelayDays = settings.reminder_delay_days;
    const maxReminders = settings.max_reminders;

    console.log(`Using settings: delay=${reminderDelayDays} days, max=${maxReminders} reminders`);

    // Get clients who have not completed assessment
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, email")
      .is("disc_type", null);

    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      console.log("No clients pending assessment");
      return new Response(
        JSON.stringify({ success: true, message: "No clients pending", sent: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${clients.length} clients without assessment`);

    // Get tracking data
    const { data: trackingData, error: trackingError } = await supabase
      .from("email_tracking")
      .select("*");

    if (trackingError) throw trackingError;

    // Filter clients who need reminders
    const delayDate = new Date();
    delayDate.setDate(delayDate.getDate() - reminderDelayDays);

    const clientsNeedingReminders = clients.filter((client) => {
      const clientTracking = trackingData?.filter((t) => t.client_id === client.id) || [];
      
      // Check if invitation was sent
      const sentEvent = clientTracking.find((t) => t.event_type === "sent");
      if (!sentEvent) return false;

      // Check if email was opened
      const openedEvent = clientTracking.find((t) => t.event_type === "opened");
      if (!openedEvent) return false;

      // Check if already completed
      const completedEvent = clientTracking.find((t) => t.event_type === "completed");
      if (completedEvent) return false;

      // Count how many reminders have been sent (sent events after the initial one)
      const remindersSent = clientTracking.filter((t) => {
        if (t.event_type !== "sent") return false;
        const metadata = t.metadata as any;
        return metadata?.is_reminder === true;
      }).length;

      // Check if max reminders reached
      if (remindersSent >= maxReminders) {
        console.log(`Client ${client.id} has reached max reminders (${remindersSent}/${maxReminders})`);
        return false;
      }

      // Check if enough time has passed since last action
      const lastActionDate = new Date(
        Math.max(
          new Date(openedEvent.created_at).getTime(),
          ...clientTracking
            .filter(t => t.event_type === "sent" && (t.metadata as any)?.is_reminder === true)
            .map(t => new Date(t.created_at).getTime())
        )
      );

      if (lastActionDate > delayDate) {
        console.log(`Client ${client.id} not ready yet. Last action: ${lastActionDate}, needs to be before: ${delayDate}`);
        return false;
      }

      // Check if reminder already sent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reminderSentToday = clientTracking.some((t) => {
        const eventDate = new Date(t.created_at);
        eventDate.setHours(0, 0, 0, 0);
        const metadata = t.metadata as any;
        return t.event_type === "sent" && metadata?.is_reminder === true && eventDate >= today;
      });

      return !reminderSentToday;
    });

    console.log(`${clientsNeedingReminders.length} clients need reminders`);

    let sentCount = 0;
    const baseUrl = Deno.env.get("SUPABASE_URL")!;

    // Fetch custom email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_type", "reminder")
      .single();

    if (templateError) {
      console.error("Error fetching email template:", templateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to load email template",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const fromEmail = template.company_name 
      ? `${template.company_name} <onboarding@resend.dev>`
      : "ClientKey <onboarding@resend.dev>";

    // Send reminders
    for (const client of clientsNeedingReminders) {
      try {
        const assessmentUrl = `${baseUrl.replace('.supabase.co', '')}/assessment/${client.id}`;
        const trackingClickUrl = `${baseUrl}/functions/v1/track-email-click?cid=${client.id}&url=${encodeURIComponent(assessmentUrl)}`;
        const trackingPixelUrl = `${baseUrl}/functions/v1/track-email-open?cid=${client.id}`;

        // Replace template variables
        let emailContent = template.content
          .replace(/\{\{CLIENT_NAME\}\}/g, client.name)
          .replace(/\{\{ASSESSMENT_LINK\}\}/g, trackingClickUrl)
          .replace(/\{\{PRIMARY_COLOR\}\}/g, template.primary_color || '#4F46E5');

        // Add tracking pixel
        emailContent += `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;" />`;

        await resend.emails.send({
          from: fromEmail,
          to: [client.email],
          subject: template.subject,
          html: emailContent,
        });

        // Track reminder sent with metadata
        const clientTracking = trackingData?.filter((t) => t.client_id === client.id) || [];
        const reminderCount = clientTracking.filter((t) => {
          const metadata = t.metadata as any;
          return t.event_type === "sent" && metadata?.is_reminder === true;
        }).length;

        await supabase.from("email_tracking").insert({
          client_id: client.id,
          event_type: "sent",
          metadata: { 
            is_reminder: true,
            reminder_number: reminderCount + 1
          },
        });

        sentCount++;
        console.log(`Reminder sent to ${client.email}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${client.email}:`, error);
      }
    }

    console.log(`Reminder check complete. Sent ${sentCount} reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reminder check complete", 
        sent: sentCount,
        checked: clients.length,
        needingReminders: clientsNeedingReminders.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
