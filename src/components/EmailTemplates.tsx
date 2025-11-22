import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Mail, Palette, Code, Eye, Send } from "lucide-react";
import { EmailTemplateLibrary } from "./EmailTemplateLibrary";

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  content: string;
  company_name: string | null;
  company_logo_url: string | null;
  primary_color: string;
}

export function EmailTemplates({ onUpgrade }: { onUpgrade?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [invitationTemplate, setInvitationTemplate] = useState<EmailTemplate | null>(null);
  const [reminderTemplate, setReminderTemplate] = useState<EmailTemplate | null>(null);
  const { isDemoAccount, user, subscription } = useAuth();
  
  const isPaidUser = subscription?.pricing_tier === "early_bird" || subscription?.pricing_tier === "regular";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*");

      if (error) throw error;

      if (data) {
        setInvitationTemplate(data.find(t => t.template_type === "invitation") || null);
        setReminderTemplate(data.find(t => t.template_type === "reminder") || null);
      }
    } catch (error: any) {
      toast.error("Failed to load email templates: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    if (isDemoAccount) {
      toast.error("Demo account is read-only. Sign up for your own account to edit templates!");
      return;
    }

    if (!isPaidUser) {
      toast.error("Email customization is a Pro feature. Upgrade to customize your templates!");
      onUpgrade?.();
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: template.subject,
          content: template.content,
          company_name: template.company_name,
          company_logo_url: template.company_logo_url,
          primary_color: template.primary_color,
        })
        .eq("id", template.id);

      if (error) throw error;

      toast.success("Email template saved successfully");
    } catch (error: any) {
      toast.error("Failed to save template: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    if (!user?.email) {
      toast.error("Unable to determine your email address");
      return;
    }

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: {
          recipientEmail: user.email,
          subject: template.subject,
          content: template.content,
          primaryColor: template.primary_color,
        },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${user.email}`);
    } catch (error: any) {
      toast.error("Failed to send test email: " + error.message);
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Email Templates</CardTitle>
        </div>
        <CardDescription>
          Customize your email invitation and reminder templates with your branding. Dynamic content like client names and assessment links are automatically inserted when emails are sent.
        </CardDescription>
        {isPaidUser && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-start gap-2">
              <span className="text-xs">👤</span>
              <span className="text-xs">Client Name</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              <span className="text-xs">🔗</span>
              <span className="text-xs">Assessment Link</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              <span className="text-xs">🎨</span>
              <span className="text-xs">Brand Color</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              <span className="text-xs">💳</span>
              <span className="text-xs">Billing Portal</span>
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invitation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invitation">Invitation Email</TabsTrigger>
            <TabsTrigger value="reminder">Reminder Email</TabsTrigger>
          </TabsList>

          <TabsContent value="invitation" className="space-y-4">
            {invitationTemplate && (
              <TemplateEditor
                template={invitationTemplate}
                onUpdate={setInvitationTemplate}
                onSave={handleSaveTemplate}
                onSendTest={handleSendTestEmail}
                saving={saving}
                sendingTest={sendingTest}
                isPaidUser={isPaidUser}
                templateType="invitation"
              />
            )}
          </TabsContent>

          <TabsContent value="reminder" className="space-y-4">
            {reminderTemplate && (
              <TemplateEditor
                template={reminderTemplate}
                onUpdate={setReminderTemplate}
                onSave={handleSaveTemplate}
                onSendTest={handleSendTestEmail}
                saving={saving}
                sendingTest={sendingTest}
                isPaidUser={isPaidUser}
                templateType="reminder"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface TemplateEditorProps {
  template: EmailTemplate;
  onUpdate: (template: EmailTemplate) => void;
  onSave: (template: EmailTemplate) => void;
  onSendTest: (template: EmailTemplate) => void;
  saving: boolean;
  sendingTest: boolean;
  isPaidUser: boolean;
  templateType: "invitation" | "reminder";
}

function TemplateEditor({ template, onUpdate, onSave, onSendTest, saving, sendingTest, isPaidUser, templateType }: TemplateEditorProps) {
  const [showCode, setShowCode] = useState(false);
  
  const handleChange = (field: keyof EmailTemplate, value: string) => {
    onUpdate({ ...template, [field]: value });
  };

  const handleSelectTemplate = (content: string) => {
    onUpdate({ ...template, content });
    toast.success("Template applied! Customize it with your branding.");
  };

  // Generate preview with sample data
  const previewHtml = useMemo(() => {
    const sampleData = {
      '{{CLIENT_NAME}}': 'John Smith',
      '{{ASSESSMENT_LINK}}': '#assessment-preview',
      '{{PRIMARY_COLOR}}': template.primary_color || '#4F46E5',
      '{{BILLING_PORTAL_LINK}}': 'https://billing.stripe.com/p/login/example',
    };

    let html = template.content;
    Object.entries(sampleData).forEach(([key, value]) => {
      html = html.split(key).join(value);
    });

    return html;
  }, [template.content, template.primary_color]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Section */}
      <div className="space-y-4">
        {!isPaidUser && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Pro Feature</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Email template customization is available on Pro plans. You can still send invitations with default templates, but upgrade to customize branding, colors, and content.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject">Subject Line</Label>
          <Input
            id="subject"
            value={template.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            placeholder="Email subject"
            disabled={!isPaidUser}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={template.company_name || ""}
              onChange={(e) => handleChange("company_name", e.target.value)}
              placeholder="Your Company Name"
              disabled={!isPaidUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-color" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Primary Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={template.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
                disabled={!isPaidUser}
              />
              <Input
                value={template.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                placeholder="#4F46E5"
                className="flex-1"
                disabled={!isPaidUser}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-logo">Company Logo URL (Optional)</Label>
          <Input
            id="company-logo"
            value={template.company_logo_url || ""}
            onChange={(e) => handleChange("company_logo_url", e.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={!isPaidUser}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Email Content</Label>
            <div className="flex gap-2">
              <EmailTemplateLibrary 
                onSelectTemplate={handleSelectTemplate}
                currentTemplateType={templateType}
                disabled={!isPaidUser}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
                disabled={!isPaidUser}
              >
                {showCode ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Edit Code
                  </>
                )}
              </Button>
            </div>
          </div>
          {showCode && (
            <>
              <Textarea
                id="content"
                value={template.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Email HTML content"
                className="min-h-[300px] font-mono text-sm"
                disabled={!isPaidUser}
              />
              <div className="bg-muted/50 rounded-md p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">Available Dynamic Variables:</p>
                <div className="grid grid-cols-2 gap-2">
                  <code className="text-xs bg-background px-2 py-1 rounded">{'{{CLIENT_NAME}}'}</code>
                  <code className="text-xs bg-background px-2 py-1 rounded">{'{{ASSESSMENT_LINK}}'}</code>
                  <code className="text-xs bg-background px-2 py-1 rounded">{'{{PRIMARY_COLOR}}'}</code>
                  <code className="text-xs bg-background px-2 py-1 rounded">{'{{BILLING_PORTAL_LINK}}'}</code>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onSendTest(template)} 
            disabled={sendingTest || saving}
          >
            {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!sendingTest && <Send className="mr-2 h-4 w-4" />}
            Send Test Email
          </Button>
          <Button onClick={() => onSave(template)} disabled={saving || sendingTest || !isPaidUser}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
            {!isPaidUser && <Badge variant="secondary" className="ml-2">Pro</Badge>}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Email Preview</Label>
          <Badge variant="secondary" className="text-xs gap-1">
            <Eye className="h-3 w-3" />
            Live Preview
          </Badge>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Preview shows how your email will look with sample data:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium">John Smith</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Color:</span>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: template.primary_color }}></div>
                <span className="font-mono text-xs">{template.primary_color}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-border rounded-lg bg-gradient-to-b from-muted/30 to-muted/50 p-6 min-h-[500px] max-h-[700px] overflow-auto shadow-sm">
          <div className="bg-white rounded-md shadow-md">
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
