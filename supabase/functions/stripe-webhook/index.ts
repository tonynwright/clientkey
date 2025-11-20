import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Webhook signature or secret missing", { status: 400 });
  }

  try {
    const body = await req.text();
    console.log("Received webhook event");

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log(`Processing event: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout completed: ${session.id}`);

        if (session.mode === "subscription" && session.customer && session.subscription) {
          const userId = session.metadata?.user_id;
          const pricingTier = session.metadata?.pricing_tier;

          if (userId && pricingTier) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            // Check if subscription already exists
            const { data: existingSub } = await supabaseClient
              .from("subscriptions")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            const subscriptionData = {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              pricing_tier: pricingTier,
              monthly_price: pricingTier === "early_bird" ? 1900 : 4900,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            };

            if (existingSub) {
              await supabaseClient
                .from("subscriptions")
                .update(subscriptionData)
                .eq("user_id", userId);
              console.log("Updated existing subscription");
            } else {
              await supabaseClient
                .from("subscriptions")
                .insert(subscriptionData);
              console.log("Created new subscription");

              // Increment early bird counter if applicable
              if (pricingTier === "early_bird") {
                await supabaseClient.rpc("increment_early_bird_counter");
                console.log("Incremented early bird counter");
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);

        const { data: existingSub } = await supabaseClient
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (existingSub) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_subscription_id", subscription.id);
          console.log("Subscription status updated");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);

        await supabaseClient
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
          })
          .eq("stripe_subscription_id", subscription.id);
        console.log("Subscription marked as canceled");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice: ${invoice.id}`);

        if (invoice.subscription) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: "active",
            })
            .eq("stripe_subscription_id", invoice.subscription as string);
          console.log("Subscription marked as active after payment");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice: ${invoice.id}`);

        if (invoice.subscription) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", invoice.subscription as string);
          console.log("Subscription marked as past_due");

          // Send payment failure email
          try {
            const customer = await stripe.customers.retrieve(invoice.customer as string);
            const customerEmail = (customer as Stripe.Customer).email;
            
            if (customerEmail) {
              const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
              await resend.emails.send({
                from: "ClientKey <onboarding@resend.dev>",
                to: [customerEmail],
                subject: "Payment Failed - Action Required",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Payment Failed</h2>
                    <p>We were unable to process your subscription payment for ClientKey.</p>
                    <p><strong>What happened?</strong><br>
                    Your payment method was declined or there was an issue processing your payment.</p>
                    <p><strong>What you need to do:</strong><br>
                    Please update your payment method to continue using ClientKey premium features.</p>
                    <p style="margin: 30px 0;">
                      <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" 
                         style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Update Payment Method
                      </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                      If you have any questions, please contact our support team.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                      <a href="https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600" style="color: #2563eb;">Manage Your Subscription</a>
                    </p>
                  </div>
                `,
              });
              console.log("Payment failure email sent to:", customerEmail);
            }
          } catch (emailError) {
            console.error("Failed to send payment failure email:", emailError);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
