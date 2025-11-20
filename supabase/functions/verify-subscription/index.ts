import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
};

const toIso = (unix: number | null | undefined) => {
  if (!unix || typeof unix !== "number") return null;
  const date = new Date(unix * 1000);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer
    logStep("Fetching Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found in Stripe");
      return new Response(
        JSON.stringify({ subscription: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Get active subscriptions
    logStep("Fetching active subscriptions");
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription found");
      return new Response(
        JSON.stringify({ subscription: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    logStep("Raw subscription data from Stripe", {
      subscriptionId: subscription.id,
      priceId,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      current_period_start_type: typeof subscription.current_period_start,
      current_period_end_type: typeof subscription.current_period_end,
    });
    
    // Determine tier based on price
    let tier = "regular";
    if (priceId === "price_1SVPruDdXbYbPM4zxhtwVLHX") {
      tier = "early_bird";
    }

    logStep("Determined subscription tier", { tier, priceId });

    // Update or create subscription in database
    logStep("Checking for existing subscription in database");
    const { data: existingSub } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    logStep("Existing subscription check result", { 
      exists: !!existingSub,
      existingId: existingSub?.id,
      existingTier: existingSub?.pricing_tier,
    });

    const subscriptionData = {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      pricing_tier: tier,
      monthly_price: tier === "early_bird" ? 1900 : 4900,
      status: subscription.status,
      current_period_start: toIso(subscription.current_period_start as any),
      current_period_end: toIso(subscription.current_period_end as any),
    };

    logStep("Prepared subscription data for database", subscriptionData);

    if (existingSub) {
      logStep("Updating existing subscription");
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update(subscriptionData)
        .eq("user_id", user.id);

      if (updateError) {
        logStep("ERROR updating subscription", { error: updateError });
        throw updateError;
      }
      logStep("Subscription updated successfully");
    } else {
      logStep("Creating new subscription");
      const { error: insertError } = await supabaseClient
        .from("subscriptions")
        .insert({
          user_id: user.id,
          ...subscriptionData,
        });

      if (insertError) {
        logStep("ERROR inserting subscription", { error: insertError });
        throw insertError;
      }
      logStep("Subscription created successfully");

      // Increment early bird counter if applicable
      if (tier === "early_bird") {
        logStep("Incrementing early bird counter");
        await supabaseClient.rpc("increment_early_bird_counter");
      }
    }

    const responseData = { 
      subscription: {
        tier,
        status: subscription.status,
        current_period_end: toIso(subscription.current_period_end as any),
      }
    };

    logStep("Sending success response", responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("ERROR in verify-subscription", { 
      message: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
    });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
