import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("cid");
    const redirectUrl = url.searchParams.get("url");

    if (!clientId || !redirectUrl) {
      return new Response("Missing parameters", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Track the click
    const { error } = await supabase
      .from("email_tracking")
      .insert({
        client_id: clientId,
        event_type: "clicked",
      });

    if (error) {
      console.error("Error tracking email click:", error);
    } else {
      console.log("Email click tracked for client:", clientId);
    }

    // Redirect to the assessment
    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error("Error in track-email-click function:", error);
    return new Response("Error processing request", {
      status: 500,
      headers: corsHeaders,
    });
  }
};

serve(handler);
