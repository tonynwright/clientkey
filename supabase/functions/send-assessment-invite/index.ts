import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, clientName, clientEmail }: InviteRequest = await req.json();

    console.log("Sending assessment invite to:", clientEmail);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const baseUrl = req.headers.get("origin") || Deno.env.get("SUPABASE_URL")!;
    const assessmentUrl = `${baseUrl}/assessment/${clientId}`;
    const trackingClickUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-email-click?cid=${clientId}&url=${encodeURIComponent(assessmentUrl)}`;
    const trackingPixelUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-email-open?cid=${clientId}`;

    const emailResponse = await resend.emails.send({
      from: "ClientKey <onboarding@resend.dev>",
      to: [clientEmail],
      subject: "Complete Your DISC Personality Assessment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">DISC Personality Assessment</h1>
          
          <p style="color: #555; font-size: 16px;">Hi ${clientName},</p>
          
          <p style="color: #555; font-size: 16px;">
            We'd like to understand your communication style better. Please take a few minutes to complete this DISC personality assessment.
          </p>
          
          <p style="color: #555; font-size: 16px;">
            The assessment consists of 24 quick questions and takes about 5-10 minutes to complete.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingClickUrl}" 
               style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Take Assessment
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Or copy this link: <a href="${trackingClickUrl}" style="color: #4F46E5;">${assessmentUrl}</a>
          </p>
          
          <p style="color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            This assessment will help us communicate with you more effectively.
          </p>
          
          <!-- Tracking pixel -->
          <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;" />
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Track that email was sent
    await supabase.from("email_tracking").insert({
      client_id: clientId,
      event_type: "sent",
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-invite function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
