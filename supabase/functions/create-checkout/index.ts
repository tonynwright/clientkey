import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EARLY_BIRD_PRICE = "price_1SVPruDdXbYbPM4zxhtwVLHX";
const REGULAR_PRICE = "price_1SVPrvDdXbYbPM4zboOLwcoY";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting checkout creation");

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

    console.log(`Creating checkout for user: ${user.id}`);

    // Get coupon code from request body if provided
    const body = await req.json().catch(() => ({}));
    const couponCode = body.coupon;

    // Check early bird counter
    const { data: counter } = await supabaseClient
      .from("signup_counter")
      .select("early_bird_count, early_bird_limit")
      .single();

    const isEarlyBird = counter && counter.early_bird_count < counter.early_bird_limit;
    const selectedPrice = isEarlyBird ? EARLY_BIRD_PRICE : REGULAR_PRICE;
    const tier = isEarlyBird ? "early_bird" : "regular";

    console.log(`Selected tier: ${tier}, price: ${selectedPrice}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    }

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPrice,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        pricing_tier: tier,
      },
      subscription_data: isEarlyBird ? {
        metadata: {
          user_id: user.id,
          pricing_tier: tier,
          early_bird_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      } : {
        metadata: {
          user_id: user.id,
          pricing_tier: tier,
        },
      },
    };

    // Add coupon if provided
    if (couponCode) {
      console.log(`Applying coupon: ${couponCode}`);
      sessionConfig.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Checkout session created: ${session.id}`);

    // For early bird customers, create a subscription schedule to switch to regular price after 1 year
    if (isEarlyBird && session.subscription) {
      const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      
      await stripe.subscriptionSchedules.create({
        from_subscription: session.subscription as string,
        phases: [
          {
            items: [{ price: EARLY_BIRD_PRICE, quantity: 1 }],
            end_date: oneYearFromNow,
          },
          {
            items: [{ price: REGULAR_PRICE, quantity: 1 }],
          },
        ],
      });
      
      console.log(`Subscription schedule created for early bird customer, will switch to regular price after 1 year`);
    }

    return new Response(
      JSON.stringify({ url: session.url, tier }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
