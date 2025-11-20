import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Validate CRON_SECRET to prevent unauthorized access
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (cronSecret !== providedSecret) {
      console.error("Unauthorized access attempt - invalid or missing CRON_SECRET");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("Starting expiring subscriptions check");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Calculate date 7 days from now
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Calculate date 8 days from now (to create a 24-hour window)
    const eightDaysFromNow = new Date();
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);

    console.log("Checking for subscriptions expiring between:", sevenDaysFromNow, "and", eightDaysFromNow);

    // Find active subscriptions expiring in 7 days
    const { data: expiringSubscriptions, error } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("current_period_end", sevenDaysFromNow.toISOString())
      .lt("current_period_end", eightDaysFromNow.toISOString());

    if (error) {
      throw error;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No expiring subscriptions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Send reminder emails
    const emailPromises = expiringSubscriptions.map(async (subscription) => {
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
          subscription.user_id
        );

        if (userError || !userData?.user?.email) {
          console.error(`Could not find user email for subscription ${subscription.id}`);
          return null;
        }

        const userEmail = userData.user.email;
        const expirationDate = new Date(subscription.current_period_end).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const tierName = subscription.pricing_tier === 'early_bird' ? 'Early Bird' : 
                        subscription.pricing_tier === 'regular' ? 'Pro' : 
                        subscription.pricing_tier;

        await resend.emails.send({
          from: "ClientKey <onboarding@resend.dev>",
          to: [userEmail],
          subject: "Your ClientKey subscription is expiring soon",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Subscription Renewal Reminder</h2>
              <p>Your ClientKey <strong>${tierName}</strong> subscription will renew on <strong>${expirationDate}</strong>.</p>
              
              <p><strong>What happens next?</strong><br>
              Your subscription will automatically renew unless you choose to cancel before the renewal date.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Current Plan:</strong> ${tierName}</p>
                <p style="margin: 10px 0 0 0;"><strong>Monthly Price:</strong> $${(subscription.monthly_price / 100).toFixed(2)}</p>
                <p style="margin: 10px 0 0 0;"><strong>Renewal Date:</strong> ${expirationDate}</p>
              </div>
              
              <p>If you'd like to make changes to your subscription or update your payment method, you can manage everything through your billing portal.</p>
              
              <p style="margin: 30px 0;">
                <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Manage Subscription
                </a>
              </p>
              
              <p style="color: #666; font-size: 14px;">
                Thank you for using ClientKey! If you have any questions, please contact our support team.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" style="color: #2563eb;">Manage Your Subscription</a>
              </p>
            </div>
          `,
        });

        console.log(`Expiration reminder sent to: ${userEmail}`);
        return { success: true, email: userEmail };
      } catch (emailError) {
        console.error(`Failed to send expiration email for subscription ${subscription.id}:`, emailError);
        return { success: false, error: emailError };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r?.success).length;

    console.log(`Sent ${successCount} expiration reminder emails`);

    return new Response(JSON.stringify({ 
      message: `Sent ${successCount} expiration reminder emails`,
      total: expiringSubscriptions.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking expiring subscriptions:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
