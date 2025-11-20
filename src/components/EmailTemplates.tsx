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
import { Loader2, Mail, Palette, Code, Eye } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  content: string;
  company_name: string | null;
  company_logo_url: string | null;
  primary_color: string;
}

export function EmailTemplates() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invitationTemplate, setInvitationTemplate] = useState<EmailTemplate | null>(null);
  const [reminderTemplate, setReminderTemplate] = useState<EmailTemplate | null>(null);
  const { isDemoAccount } = useAuth();

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
          Customize your email invitation and reminder templates. Use variables: {'{{CLIENT_NAME}}'}, {'{{ASSESSMENT_LINK}}'}, {'{{PRIMARY_COLOR}}'}, {'{{BILLING_PORTAL_LINK}}'}
        </CardDescription>
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
                saving={saving}
              />
            )}
          </TabsContent>

          <TabsContent value="reminder" className="space-y-4">
            {reminderTemplate && (
              <TemplateEditor
                template={reminderTemplate}
                onUpdate={setReminderTemplate}
                onSave={handleSaveTemplate}
                saving={saving}
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
  saving: boolean;
}

function TemplateEditor({ template, onUpdate, onSave, saving }: TemplateEditorProps) {
  const [showCode, setShowCode] = useState(false);
  
  const handleChange = (field: keyof EmailTemplate, value: string) => {
    onUpdate({ ...template, [field]: value });
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
        <div className="space-y-2">
          <Label htmlFor="subject">Subject Line</Label>
          <Input
            id="subject"
            value={template.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            placeholder="Email subject"
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
              />
              <Input
                value={template.primary_color}
                onChange={(e) => handleChange("primary_color", e.target.value)}
                placeholder="#4F46E5"
                className="flex-1"
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
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Email Content</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
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
          {showCode && (
            <>
              <Textarea
                id="content"
                value={template.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Email HTML content"
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{{CLIENT_NAME}}'}, {'{{ASSESSMENT_LINK}}'}, {'{{PRIMARY_COLOR}}'}, {'{{BILLING_PORTAL_LINK}}'}
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(template)} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Live Preview</Label>
          <Badge variant="secondary" className="text-xs">
            Real-time preview with sample data
          </Badge>
        </div>
        <div className="border rounded-lg bg-muted/30 p-4 min-h-[500px] max-h-[700px] overflow-auto">
          <div className="bg-white rounded-md shadow-sm">
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Preview shows sample data: John Smith as client name, with placeholder links
        </p>
      </div>
    </div>
  );
}
