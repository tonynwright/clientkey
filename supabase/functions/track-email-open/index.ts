import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent PNG pixel
const TRACKING_PIXEL = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
  (c) => c.charCodeAt(0)
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("cid");

    if (!clientId) {
      console.log("No client ID provided");
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/png", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already tracked
    const { data: existing } = await supabase
      .from("email_tracking")
      .select("id")
      .eq("client_id", clientId)
      .eq("event_type", "opened")
      .single();

    if (!existing) {
      const { error } = await supabase
        .from("email_tracking")
        .insert({
          client_id: clientId,
          event_type: "opened",
        });

      if (error) {
        console.error("Error tracking email open:", error);
      } else {
        console.log("Email open tracked for client:", clientId);
      }
    }

    return new Response(TRACKING_PIXEL, {
      headers: { 
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error("Error in track-email-open function:", error);
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/png", ...corsHeaders },
    });
  }
};

serve(handler);
