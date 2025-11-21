import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ONBOARDING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify CRON_SECRET for scheduled execution
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      logStep("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active onboarding progress that needs email
    const { data: progressRecords, error: progressError } = await supabaseAdmin
      .from("client_onboarding_progress")
      .select(`
        *,
        client:clients(*),
        sequence:onboarding_sequences(*)
      `)
      .is("completed_at", null)
      .eq("is_paused", false);

    if (progressError) {
      logStep("Error fetching progress records", { error: progressError });
      throw progressError;
    }

    logStep("Found progress records", { count: progressRecords?.length });

    let emailsSent = 0;

    for (const progress of progressRecords || []) {
      try {
        // Get the next step for this client
        const { data: nextStep, error: stepError } = await supabaseAdmin
          .from("onboarding_sequence_steps")
          .select("*")
          .eq("sequence_id", progress.sequence_id)
          .eq("step_order", progress.current_step + 1)
          .single();

        if (stepError || !nextStep) {
          // No more steps, mark as completed
          if (!stepError) {
            await supabaseAdmin
              .from("client_onboarding_progress")
              .update({ completed_at: new Date().toISOString() })
              .eq("id", progress.id);
            logStep("Sequence completed for client", { clientId: progress.client_id });
          }
          continue;
        }

        // Check if enough time has passed since last email or start
        const lastEmailDate = progress.last_email_sent_at 
          ? new Date(progress.last_email_sent_at) 
          : new Date(progress.started_at);
        
        const daysSinceLastEmail = Math.floor(
          (Date.now() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastEmail < nextStep.delay_days) {
          logStep("Not time yet for next email", { 
            clientId: progress.client_id, 
            daysSince: daysSinceLastEmail, 
            delayNeeded: nextStep.delay_days 
          });
          continue;
        }

        // Send the email
        const client = progress.client;
        const sequence = progress.sequence;

        // Replace template variables
        let emailContent = nextStep.email_content
          .replace(/{{client_name}}/g, client.name)
          .replace(/{{client_company}}/g, client.company || "")
          .replace(/{{client_email}}/g, client.email);

        const { error: emailError } = await resend.emails.send({
          from: "ClientKey <onboarding@resend.dev>",
          to: [client.email],
          subject: nextStep.email_subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Welcome to ${sequence.name}</h2>
              <div style="margin: 20px 0;">
                ${emailContent}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated message from your onboarding sequence.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Need help? Contact us at support@clientkey.com<br>
                <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" style="color: #4F46E5;">Manage your subscription</a>
              </p>
            </div>
          `,
        });

        if (emailError) {
          logStep("Error sending email", { error: emailError, clientId: client.id });
          continue;
        }

        // Update progress
        await supabaseAdmin
          .from("client_onboarding_progress")
          .update({
            current_step: progress.current_step + 1,
            last_email_sent_at: new Date().toISOString(),
          })
          .eq("id", progress.id);

        emailsSent++;
        logStep("Email sent successfully", { 
          clientId: client.id, 
          clientEmail: client.email,
          step: nextStep.step_order 
        });

      } catch (error) {
        logStep("Error processing client", { clientId: progress.client_id, error });
      }
    }

    logStep("Onboarding emails job completed", { emailsSent });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        message: `Sent ${emailsSent} onboarding emails` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logStep("ERROR in send-onboarding-emails", { 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});