import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOTIFY-PRICE-INCREASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify CRON_SECRET for authentication
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    if (!authHeader || authHeader.replace("Bearer ", "") !== cronSecret) {
      logStep("Unauthorized request");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    logStep("Fetching all subscription schedules");

    // Get all subscription schedules
    const schedules = await stripe.subscriptionSchedules.list({ limit: 100 });
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twentyNineDaysFromNow = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);
    
    let notificationsSent = 0;

    for (const schedule of schedules.data) {
      // Check if this is an early bird schedule with a price transition
      if (schedule.phases && schedule.phases.length >= 2) {
        const transitionPhase = schedule.phases[1];
        const transitionDate = new Date(transitionPhase.start_date * 1000);

        // Check if transition is ~30 days away (within a 24-hour window)
        if (transitionDate >= twentyNineDaysFromNow && transitionDate <= thirtyDaysFromNow) {
          logStep("Found early bird subscription expiring in 30 days", {
            scheduleId: schedule.id,
            transitionDate: transitionDate.toISOString(),
          });

          const subscription = await stripe.subscriptions.retrieve(schedule.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

          // Get user_id from subscription metadata
          const userId = subscription.metadata?.user_id;
          
          if (!userId || !customer.email) {
            logStep("Missing user_id or email", { userId, hasEmail: !!customer.email });
            continue;
          }

          // Check if we've already sent this notification
          const { data: existingNotification } = await supabaseAdmin
            .from("early_bird_notifications")
            .select("*")
            .eq("user_id", userId)
            .eq("subscription_id", subscription.id)
            .maybeSingle();

          if (existingNotification) {
            logStep("Notification already sent", { userId, subscriptionId: subscription.id });
            continue;
          }

          // Send email notification
          try {
            await resend.emails.send({
              from: "ClientKey <onboarding@resend.dev>",
              to: [customer.email],
              subject: "Your ClientKey Early Bird Pricing Ends Soon",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">Your Early Bird Pricing Ends in 30 Days</h2>
                  <p>Hello,</p>
                  <p>Thank you for being one of our early bird customers! We wanted to give you advance notice that your promotional pricing will end in approximately 30 days.</p>
                  
                  <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Current Price:</strong> $19/month</p>
                    <p style="margin: 10px 0 0 0;"><strong>New Price (starting ${transitionDate.toLocaleDateString()}):</strong> $49/month</p>
                  </div>

                  <p><strong>What This Means:</strong></p>
                  <ul>
                    <li>Your subscription will automatically renew at the regular price of $49/month</li>
                    <li>You'll continue to have access to all ClientKey premium features</li>
                    <li>No action is needed on your part</li>
                  </ul>

                  <p>As an early bird customer, you've enjoyed our promotional pricing for a full year. We hope ClientKey has brought value to your client relationships!</p>

                  <p style="margin: 30px 0;">
                    <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Manage Your Subscription
                    </a>
                  </p>

                  <p style="color: #666; font-size: 14px;">
                    If you have any questions about this change or would like to discuss your subscription, please don't hesitate to reach out to our support team.
                  </p>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="color: #666; font-size: 12px;">
                    <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" style="color: #4F46E5;">Manage Your Subscription</a>
                  </p>
                </div>
              `,
            });

            // Record that we sent the notification
            await supabaseAdmin
              .from("early_bird_notifications")
              .insert({
                user_id: userId,
                subscription_id: subscription.id,
                price_increase_date: transitionDate.toISOString(),
              });

            notificationsSent++;
            logStep("Notification sent successfully", {
              email: customer.email,
              userId,
              transitionDate: transitionDate.toISOString(),
            });
          } catch (emailError) {
            logStep("Failed to send email", {
              error: emailError instanceof Error ? emailError.message : String(emailError),
              email: customer.email,
            });
          }
        }
      }
    }

    logStep("Function completed", { notificationsSent });

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
