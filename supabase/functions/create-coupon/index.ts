import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating coupon");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    console.log(`Admin user ${user.id} creating coupon`);

    const body = await req.json();
    const { name, percent_off, amount_off, currency, duration, duration_in_months, max_redemptions, redeem_by } = body;

    // Input validation
    if (!name || typeof name !== "string" || name.length > 50) {
      throw new Error("Invalid coupon name");
    }

    if (!percent_off && !amount_off) {
      throw new Error("Either percent_off or amount_off must be provided");
    }

    if (percent_off && (percent_off <= 0 || percent_off > 100)) {
      throw new Error("Percent off must be between 0 and 100");
    }

    if (amount_off && amount_off <= 0) {
      throw new Error("Amount off must be greater than 0");
    }

    if (max_redemptions && (max_redemptions <= 0 || max_redemptions > 10000)) {
      throw new Error("Max redemptions must be between 1 and 10,000");
    }

    if (redeem_by) {
      const expirationDate = new Date(redeem_by * 1000);
      const now = new Date();
      if (expirationDate <= now) {
        throw new Error("Expiration date must be in the future");
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const couponData: Stripe.CouponCreateParams = {
      name: name.toUpperCase().trim(),
      duration: duration || "once",
    };

    if (percent_off) {
      couponData.percent_off = percent_off;
    } else if (amount_off) {
      couponData.amount_off = amount_off;
      couponData.currency = currency || "usd";
    }

    if (duration === "repeating" && duration_in_months) {
      if (duration_in_months <= 0 || duration_in_months > 36) {
        throw new Error("Duration must be between 1 and 36 months");
      }
      couponData.duration_in_months = duration_in_months;
    }

    // Add usage limit if provided
    if (max_redemptions) {
      couponData.max_redemptions = max_redemptions;
    }

    // Add expiration date if provided
    if (redeem_by) {
      couponData.redeem_by = redeem_by;
    }

    const coupon = await stripe.coupons.create(couponData);
    console.log(`Coupon created: ${coupon.id}`);

    return new Response(
      JSON.stringify({ coupon }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Coupon creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
