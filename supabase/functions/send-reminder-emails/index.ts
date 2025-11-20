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

    // Send reminders
    for (const client of clientsNeedingReminders) {
      try {
        const assessmentUrl = `${baseUrl.replace('.supabase.co', '')}/assessment/${client.id}`;
        const trackingClickUrl = `${baseUrl}/functions/v1/track-email-click?cid=${client.id}&url=${encodeURIComponent(assessmentUrl)}`;
        const trackingPixelUrl = `${baseUrl}/functions/v1/track-email-open?cid=${client.id}`;

        await resend.emails.send({
          from: "ClientKey <onboarding@resend.dev>",
          to: [client.email],
          subject: "Reminder: Complete Your DISC Assessment",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">Friendly Reminder</h1>
              
              <p style="color: #555; font-size: 16px;">Hi ${client.name},</p>
              
              <p style="color: #555; font-size: 16px;">
                We noticed you started but haven't yet completed your DISC personality assessment. 
                It only takes 5-10 minutes and will help us communicate with you more effectively.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${trackingClickUrl}" 
                   style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Complete Assessment Now
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px;">
                Or copy this link: <a href="${trackingClickUrl}" style="color: #4F46E5;">${assessmentUrl}</a>
              </p>
              
              <p style="color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                This is a friendly reminder. We look forward to understanding your communication style better.
              </p>
              
              <!-- Tracking pixel -->
              <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;" />
            </div>
          `,
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
