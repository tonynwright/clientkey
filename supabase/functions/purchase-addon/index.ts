import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADDON_PRICE = "price_1SVzWNDdXbYbPM4z2D7jHiJ4";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting addon purchase");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    console.log(`Creating addon purchase for user: ${user.id}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found. Please upgrade to a paid plan first.");
    }

    const customerId = customers.data[0].id;
    console.log(`Found existing customer: ${customerId}`);

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found. Please upgrade to a paid plan first.");
    }

    const subscription = subscriptions.data[0];
    console.log(`Found active subscription: ${subscription.id}`);

    // Add addon to subscription
    await stripe.subscriptionItems.create({
      subscription: subscription.id,
      price: ADDON_PRICE,
      quantity: 1,
    });

    console.log(`Addon added to subscription`);

    // Update database
    const { data: dbSub } = await supabaseClient
      .from("subscriptions")
      .select("addon_client_packs")
      .eq("user_id", user.id)
      .single();

    const newPackCount = (dbSub?.addon_client_packs || 0) + 1;

    await supabaseClient
      .from("subscriptions")
      .update({ addon_client_packs: newPackCount })
      .eq("user_id", user.id);

    console.log(`Database updated with ${newPackCount} packs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        addon_packs: newPackCount,
        message: "Successfully added 5 client slots to your account"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Addon purchase error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
