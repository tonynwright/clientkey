import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipientEmail: string;
  subject: string;
  content: string;
  primaryColor: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, subject, content, primaryColor }: TestEmailRequest = await req.json();

    console.log("Sending test email to:", recipientEmail);

    // Replace template variables with sample data
    const sampleData = {
      '{{CLIENT_NAME}}': 'John Smith',
      '{{ASSESSMENT_LINK}}': 'https://example.com/assessment/sample-link',
      '{{PRIMARY_COLOR}}': primaryColor || '#4F46E5',
      '{{BILLING_PORTAL_LINK}}': 'https://billing.stripe.com/p/login/example',
    };

    let emailContent = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      emailContent = emailContent.split(key).join(value);
    });

    const emailResponse = await resend.emails.send({
      from: "ClientKey <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `[TEST] ${subject}`,
      html: emailContent,
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
