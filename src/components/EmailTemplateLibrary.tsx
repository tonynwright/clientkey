import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Library, Check } from "lucide-react";

interface TemplateLibraryProps {
  onSelectTemplate: (content: string) => void;
  currentTemplateType: "invitation" | "reminder";
  disabled?: boolean;
}

const TEMPLATE_LIBRARY = {
  invitation: [
    {
      id: "modern-minimal",
      name: "Modern Minimal",
      description: "Clean and contemporary design with bold typography",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 48px 40px; text-align: center; border-bottom: 1px solid #e9ecef;">
              <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
                You're Invited!
              </h1>
              <p style="margin: 0; font-size: 16px; color: #6c757d; line-height: 1.6;">
                Complete your DISC personality assessment
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #495057; line-height: 1.7;">
                Hi <strong>{{CLIENT_NAME}}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #495057; line-height: 1.7;">
                We'd like to learn more about your working style and communication preferences. This assessment takes just 5 minutes and will help us serve you better.
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 16px 48px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                      Start Assessment
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 14px; color: #868e96; line-height: 1.6; text-align: center;">
                This assessment is quick, confidential, and designed to help us work better together.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #868e96; text-align: center; line-height: 1.6;">
                Questions? <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none;">Contact us</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    },
    {
      id: "professional-corporate",
      name: "Professional Corporate",
      description: "Traditional corporate layout with emphasis on credibility",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border: 2px solid #e0e0e0;">
          <tr>
            <td style="padding: 40px; background: {{PRIMARY_COLOR}}; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                Assessment Invitation
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.8;">
                Dear <strong>{{CLIENT_NAME}}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.8;">
                We are pleased to invite you to complete a DISC personality assessment. This assessment is designed to help us understand your communication style and work preferences, enabling us to provide you with the best possible service.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #333333; line-height: 1.8;">
                The assessment takes approximately 5 minutes to complete and your responses will be kept strictly confidential.
              </p>
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 18px 56px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase; border: 2px solid {{PRIMARY_COLOR}};">
                      Complete Assessment
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 32px 0 0; font-size: 15px; color: #666666; line-height: 1.8;">
                We appreciate your time and cooperation.
              </p>
              <p style="margin: 16px 0 0; font-size: 15px; color: #666666; line-height: 1.8;">
                Best regards,<br>
                <strong>The Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: #f9f9f9; border-top: 2px solid #e0e0e0;">
              <p style="margin: 0; font-size: 13px; color: #888888; text-align: center; line-height: 1.6;">
                <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none;">Manage Preferences</a> | Questions? Contact Support
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    },
    {
      id: "friendly-casual",
      name: "Friendly & Casual",
      description: "Warm and approachable design with playful elements",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <tr>
            <td style="padding: 48px 40px; background: linear-gradient(135deg, {{PRIMARY_COLOR}} 0%, {{PRIMARY_COLOR}}dd 100%); text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 24px; line-height: 80px; font-size: 40px;">
                ✨
              </div>
              <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #ffffff;">
                Let's Get to Know You!
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                A quick personality assessment awaits
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 17px; color: #2c3e50; line-height: 1.7;">
                Hey <strong>{{CLIENT_NAME}}</strong>! 👋
              </p>
              <p style="margin: 0 0 20px; font-size: 17px; color: #2c3e50; line-height: 1.7;">
                We're excited to learn more about what makes you unique! We've prepared a fun 5-minute DISC assessment that'll help us understand your working style better.
              </p>
              <p style="margin: 0 0 32px; font-size: 17px; color: #2c3e50; line-height: 1.7;">
                Think of it as a quick self-discovery tool that helps us collaborate more effectively. Ready to dive in?
              </p>
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 18px 48px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); transition: all 0.3s;">
                      Take the Assessment 🚀
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin: 32px 0 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid {{PRIMARY_COLOR}};">
                <p style="margin: 0; font-size: 14px; color: #5a6c7d; line-height: 1.6;">
                  <strong>Pro tip:</strong> Answer honestly! There are no right or wrong answers – just what feels natural to you.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: #f8f9fa; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #7f8c9a;">
                Questions or need help?
              </p>
              <p style="margin: 0; font-size: 13px;">
                <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none; font-weight: 600;">We're here for you</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    }
  ],
  reminder: [
    {
      id: "gentle-reminder",
      name: "Gentle Reminder",
      description: "Soft approach with friendly tone",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, {{PRIMARY_COLOR}}20 0%, {{PRIMARY_COLOR}}40 100%); border-radius: 50%; margin-bottom: 24px; line-height: 64px; font-size: 32px;">
                ⏰
              </div>
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 600; color: #1a1a1a;">
                Just a Friendly Reminder
              </h1>
              <p style="margin: 0; font-size: 15px; color: #6c757d;">
                Your assessment is still waiting for you
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #495057; line-height: 1.7;">
                Hi <strong>{{CLIENT_NAME}}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #495057; line-height: 1.7;">
                We noticed you haven't completed your DISC assessment yet. No worries – we know life gets busy!
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; color: #495057; line-height: 1.7;">
                The assessment takes just 5 minutes and will help us work together more effectively. Whenever you have a moment, we'd love for you to complete it.
              </p>
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 16px 40px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Complete Assessment Now
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 0; font-size: 14px; color: #868e96; text-align: center; line-height: 1.6;">
                Thanks for your time! If you have any questions, we're here to help.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background: #f8f9fa; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #868e96; text-align: center;">
                <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none;">Manage Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    },
    {
      id: "urgent-reminder",
      name: "Urgent Reminder",
      description: "Clear call-to-action with time-sensitive messaging",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border: 3px solid {{PRIMARY_COLOR}}; border-radius: 12px;">
          <tr>
            <td style="padding: 32px 40px; background: {{PRIMARY_COLOR}}; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                ⚡ Action Required
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="margin-bottom: 24px; padding: 16px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; font-size: 15px; color: #856404; font-weight: 600;">
                  ⚠️ Assessment Pending
                </p>
              </div>
              <p style="margin: 0 0 20px; font-size: 16px; color: #212529; line-height: 1.7;">
                Hi <strong>{{CLIENT_NAME}}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #212529; line-height: 1.7;">
                This is a final reminder to complete your DISC personality assessment. We need your input to move forward with providing you the best possible service.
              </p>
              <div style="margin: 28px 0; padding: 24px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #6c757d; font-weight: 600;">What you'll get:</p>
                <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 15px; color: #495057; line-height: 1.8;">
                  <li>Personalized communication insights</li>
                  <li>Better collaboration with our team</li>
                  <li>Tailored service based on your preferences</li>
                </ul>
              </div>
              <table role="presentation" style="width: 100%; margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 18px 48px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 17px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                      Complete Now (5 min)
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 14px; color: #6c757d; text-align: center; line-height: 1.6;">
                Need assistance? <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none; font-weight: 600;">Contact our support team</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    },
    {
      id: "personal-touch",
      name: "Personal Touch",
      description: "Warm and personalized with conversational tone",
      content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f9f9f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px; font-size: 18px; color: #2c3e50; line-height: 1.7;">
                Hi <strong>{{CLIENT_NAME}}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 17px; color: #34495e; line-height: 1.8;">
                I hope this message finds you well. I wanted to personally reach out about the DISC assessment we sent over.
              </p>
              <p style="margin: 0 0 24px; font-size: 17px; color: #34495e; line-height: 1.8;">
                I know everyone's schedules are packed, but I genuinely believe this quick assessment will add tremendous value to our working relationship. It helps me understand how you prefer to communicate and work, so I can be the most effective partner for you.
              </p>
              <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, {{PRIMARY_COLOR}}10 0%, {{PRIMARY_COLOR}}20 100%); border-left: 4px solid {{PRIMARY_COLOR}}; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; color: #2c3e50; line-height: 1.7; font-style: italic;">
                  "Understanding yourself is the beginning of understanding others." – This assessment takes just 5 minutes and provides insights we'll both benefit from.
                </p>
              </div>
              <p style="margin: 24px 0; font-size: 17px; color: #34495e; line-height: 1.8;">
                Would you have a few minutes this week to complete it?
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ASSESSMENT_LINK}}" style="display: inline-block; padding: 16px 40px; background: {{PRIMARY_COLOR}}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Yes, Let's Do This
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 32px 0 0; font-size: 16px; color: #34495e; line-height: 1.8;">
                Thank you for your time and consideration.
              </p>
              <p style="margin: 16px 0 0; font-size: 16px; color: #34495e; line-height: 1.8;">
                Warm regards,<br>
                <strong style="color: #2c3e50;">Your Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #7f8c9a; text-align: center; line-height: 1.6;">
                Questions or concerns? <a href="{{BILLING_PORTAL_LINK}}" style="color: {{PRIMARY_COLOR}}; text-decoration: none;">I'm happy to chat</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    }
  ]
};

export function EmailTemplateLibrary({ onSelectTemplate, currentTemplateType, disabled }: TemplateLibraryProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const templates = TEMPLATE_LIBRARY[currentTemplateType];

  const handleApplyTemplate = () => {
    if (selectedId) {
      const template = templates.find(t => t.id === selectedId);
      if (template) {
        onSelectTemplate(template.content);
        setOpen(false);
        setSelectedId(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Library className="h-4 w-4 mr-2" />
          Browse Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            Email Template Library
          </DialogTitle>
          <DialogDescription>
            Select a professional template and customize it with your branding. Your company name, logo, and colors will be preserved.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedId === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedId(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    {selectedId === template.id && (
                      <Badge variant="default" className="ml-2">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="relative bg-muted/50 rounded-lg p-3 h-48 overflow-hidden">
                    <div 
                      className="text-xs overflow-auto h-full"
                      style={{ 
                        transform: 'scale(0.4)', 
                        transformOrigin: 'top left',
                        width: '250%',
                        height: '250%'
                      }}
                      dangerouslySetInnerHTML={{ __html: template.content }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-muted/80 to-transparent pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyTemplate}
            disabled={!selectedId}
          >
            Apply Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
