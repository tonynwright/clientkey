import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
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

    // Fetch custom email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_type", "invitation")
      .single();

    if (templateError) {
      console.error("Error fetching email template:", templateError);
      throw new Error("Failed to load email template");
    }

    // Replace template variables
    let emailContent = template.content
      .replace(/\{\{CLIENT_NAME\}\}/g, clientName)
      .replace(/\{\{ASSESSMENT_LINK\}\}/g, trackingClickUrl)
      .replace(/\{\{PRIMARY_COLOR\}\}/g, template.primary_color || '#4F46E5');

    // Add tracking pixel
    emailContent += `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;" />`;

    const fromEmail = template.company_name 
      ? `${template.company_name} <onboarding@resend.dev>`
      : "ClientKey <onboarding@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [clientEmail],
      subject: template.subject,
      html: emailContent,
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
