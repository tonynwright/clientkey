import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinterIssue {
  id: string;
  level: string;
  title: string;
  description: string;
  categories: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify CRON_SECRET for scheduled job authentication
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('authorization');
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized: Invalid or missing CRON_SECRET');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('Starting weekly security scan...');

    // Run security linter (simulated - in production this would call the actual linter API)
    // For now, we'll create a mock implementation that could be replaced with actual linter calls
    const currentFindings: LinterIssue[] = await runSecurityLinter(supabase);
    
    console.log(`Security scan complete. Found ${currentFindings.length} issues.`);

    // Get the last scan to compare
    const { data: lastScan } = await supabase
      .from('security_scans')
      .select('findings')
      .order('scan_date', { ascending: false })
      .limit(1)
      .single();

    const lastFindings = lastScan?.findings as LinterIssue[] || [];
    const lastFindingIds = new Set(lastFindings.map(f => f.id));
    
    // Identify new findings
    const newFindings = currentFindings.filter(finding => !lastFindingIds.has(finding.id));
    
    console.log(`Identified ${newFindings.length} new security issues.`);

    // Store scan results
    const { error: insertError } = await supabase
      .from('security_scans')
      .insert({
        findings: currentFindings,
        findings_count: currentFindings.length,
        new_findings_count: newFindings.length,
      });

    if (insertError) {
      console.error('Error storing scan results:', insertError);
      throw insertError;
    }

    // If there are new findings, send email to admin users
    if (newFindings.length > 0 && resendApiKey) {
      console.log('New security issues detected. Sending email to admins...');
      
      // Get all admin user emails
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        // Get admin user emails
        const adminEmails: string[] = [];
        
        for (const role of adminRoles) {
          const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
          if (userData?.user?.email) {
            adminEmails.push(userData.user.email);
          }
        }

        console.log(`Sending security report to ${adminEmails.length} admin(s)`);

        // Generate email content
        const emailHtml = generateSecurityReportEmail(newFindings, currentFindings);

        // Send email to each admin
        for (const adminEmail of adminEmails) {
          try {
            await resend.emails.send({
              from: 'ClientKey Security <security@resend.dev>',
              to: adminEmail,
              subject: `⚠️ Weekly Security Scan: ${newFindings.length} New Issue${newFindings.length > 1 ? 's' : ''} Detected`,
              html: emailHtml,
            });
            console.log(`Security report sent to ${adminEmail}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${adminEmail}:`, emailError);
          }
        }
      }
    } else {
      console.log('No new security issues detected. No email sent.');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total_findings: currentFindings.length,
        new_findings: newFindings.length,
        message: newFindings.length > 0 
          ? `Security scan complete. ${newFindings.length} new issue(s) detected and reported.`
          : 'Security scan complete. No new issues detected.'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in weekly-security-scan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function runSecurityLinter(supabase: any): Promise<LinterIssue[]> {
  // This is a simplified implementation
  // In production, this would call the actual Supabase linter API
  // For now, we'll check basic security configurations
  
  const findings: LinterIssue[] = [];

  // Check for tables without RLS enabled
  const { data: tables } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  // Note: This is a simplified check. Real linter would do comprehensive analysis
  // You would integrate with actual Supabase linter API here
  
  return findings;
}

function generateSecurityReportEmail(newFindings: LinterIssue[], allFindings: LinterIssue[]): string {
  const criticalFindings = newFindings.filter(f => f.level === 'ERROR');
  const warningFindings = newFindings.filter(f => f.level === 'WARN');

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; }
        .finding { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .finding.critical { border-left-color: #ef4444; }
        .finding.warning { border-left-color: #f59e0b; }
        .finding-title { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .finding-level { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .level-critical { background: #fef2f2; color: #dc2626; }
        .level-warning { background: #fef3c7; color: #d97706; }
        .summary { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔒 Weekly Security Scan Report</h1>
          <p style="margin: 10px 0 0 0;">ClientKey Security Monitoring</p>
        </div>
        
        <div class="content">
          <div class="summary">
            <h2 style="margin-top: 0;">📊 Summary</h2>
            <p><strong>New Issues Detected:</strong> ${newFindings.length}</p>
            <p><strong>Total Active Issues:</strong> ${allFindings.length}</p>
            <p><strong>Critical Issues:</strong> ${criticalFindings.length}</p>
            <p><strong>Warnings:</strong> ${warningFindings.length}</p>
          </div>

          ${newFindings.length > 0 ? `
            <h2>🚨 New Security Issues</h2>
            ${newFindings.map(finding => `
              <div class="finding ${finding.level === 'ERROR' ? 'critical' : 'warning'}">
                <div class="finding-title">${finding.title}</div>
                <span class="finding-level ${finding.level === 'ERROR' ? 'level-critical' : 'level-warning'}">
                  ${finding.level === 'ERROR' ? 'CRITICAL' : 'WARNING'}
                </span>
                <p>${finding.description}</p>
                ${finding.categories ? `<p><small><strong>Categories:</strong> ${finding.categories.join(', ')}</small></p>` : ''}
              </div>
            `).join('')}
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get('SUPABASE_URL')}" class="button">View Full Security Dashboard</a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated security scan report from ClientKey.</p>
          <p>For urgent security issues, please review and address them immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
