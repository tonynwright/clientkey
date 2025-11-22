import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BarChart3, Users, Mail, Sparkles, FileText, Target, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalyticsDocs() {
  const navigate = useNavigate();

  const eventCategories = {
    clientManagement: [
      {
        event: "client_added",
        description: "Triggered when a new client is created",
        parameters: { method: "'manual' | 'demo'" },
        trigger: "User creates client manually or via demo data seeding",
        importance: "High - Key conversion metric"
      },
      {
        event: "client_deleted",
        description: "Triggered when a client is deleted",
        parameters: "None",
        trigger: "User deletes single or multiple clients",
        importance: "Medium - Track data cleanup patterns"
      },
      {
        event: "client_edited",
        description: "Triggered when client information is updated",
        parameters: "None",
        trigger: "User edits client details or tags",
        importance: "Low - Track engagement depth"
      }
    ],
    assessments: [
      {
        event: "assessment_started",
        description: "Triggered when a client begins the DISC assessment",
        parameters: { client_id: "string" },
        trigger: "Client opens assessment link and views first question",
        importance: "High - Track funnel entry"
      },
      {
        event: "assessment_completed",
        description: "Triggered when a client finishes the DISC assessment",
        parameters: { client_id: "string", disc_type: "'D' | 'I' | 'S' | 'C'" },
        trigger: "Client submits all 24 assessment questions",
        importance: "Critical - Primary conversion goal"
      },
      {
        event: "assessment_invite_sent",
        description: "Triggered when assessment invitations are sent to clients",
        parameters: { count: "number" },
        trigger: "User sends single or bulk invitation emails",
        importance: "High - Track outreach volume"
      }
    ],
    aiFeatures: [
      {
        event: "ai_insights_generated",
        description: "Triggered when AI-powered DISC insights are generated",
        parameters: { client_id: "string", disc_type: "'D' | 'I' | 'S' | 'C'" },
        trigger: "User clicks 'Generate Insights' button for a client",
        importance: "High - Premium feature usage"
      }
    ],
    exports: [
      {
        event: "pdf_exported",
        description: "Triggered when a PDF document is downloaded",
        parameters: { pdf_type: "'profile' | 'insights' | 'comparison'" },
        trigger: "User exports client profile, AI insights, or comparison report",
        importance: "Medium - Premium feature engagement"
      }
    ],
    revenue: [
      {
        event: "upgrade_clicked",
        description: "Triggered when user clicks an upgrade button",
        parameters: { from_tier: "string", context: "string" },
        trigger: "User clicks upgrade prompt (dashboard, premium feature, pricing page)",
        importance: "Critical - Revenue funnel tracking"
      },
      {
        event: "checkout_started",
        description: "Triggered when user initiates Stripe checkout",
        parameters: { tier: "string" },
        trigger: "User clicks final 'Upgrade Now' button in upgrade dialog",
        importance: "Critical - Direct revenue indicator"
      }
    ],
    emailMarketing: [
      {
        event: "email_template_saved",
        description: "Triggered when user customizes email templates",
        parameters: { template_type: "string" },
        trigger: "User saves invitation or reminder email template",
        importance: "Medium - Premium feature adoption"
      },
      {
        event: "email_test_sent",
        description: "Triggered when user sends test email",
        parameters: "None",
        trigger: "User clicks 'Send Test Email' button",
        importance: "Low - Feature quality check"
      }
    ],
    engagement: [
      {
        event: "staff_matching_used",
        description: "Triggered when staff-client matching tool is accessed",
        parameters: "None",
        trigger: "User navigates to Matching tab in dashboard",
        importance: "High - Premium feature engagement"
      },
      {
        event: "onboarding_started",
        description: "Triggered when new user sees onboarding flow",
        parameters: "None",
        trigger: "First-time user opens dashboard or manually restarts onboarding",
        importance: "High - Track new user experience"
      },
      {
        event: "onboarding_completed",
        description: "Triggered when user finishes onboarding",
        parameters: "None",
        trigger: "User clicks 'Create First Client' or 'Try Demo' in onboarding",
        importance: "High - Activation metric"
      },
      {
        event: "onboarding_skipped",
        description: "Triggered when user skips onboarding",
        parameters: { step: "number" },
        trigger: "User clicks 'Skip' during onboarding flow",
        importance: "Medium - Track friction points"
      },
      {
        event: "demo_data_seeded",
        description: "Triggered when demo data is generated",
        parameters: "None",
        trigger: "User clicks 'Try Demo Mode' button",
        importance: "Medium - Feature discovery metric"
      },
      {
        event: "demo_account_accessed",
        description: "Triggered when shared demo account is accessed",
        parameters: "None",
        trigger: "User logs into public demo account or accesses from settings",
        importance: "Low - Pre-conversion engagement"
      }
    ],
    navigation: [
      {
        event: "page_view",
        description: "Triggered for custom page view tracking",
        parameters: { page_name: "string" },
        trigger: "Manual tracking for specific page views",
        importance: "Low - Supplementary to GA4 auto-tracking"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Analytics Documentation</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Google Analytics 4
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              This documentation covers all Google Analytics events tracked throughout ClientKey. 
              Events are automatically sent to GA4 and can be used for conversion tracking, funnel analysis, and user behavior insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <Activity className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Real-time Tracking</p>
                  <p className="text-sm text-muted-foreground">All events fire immediately on user action</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Conversion Ready</p>
                  <p className="text-sm text-muted-foreground">Mark critical events as conversions in GA4</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Custom Parameters</p>
                  <p className="text-sm text-muted-foreground">Rich event data for detailed analysis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Tabs defaultValue="clientManagement" className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="clientManagement">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="assessments">
              <FileText className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="aiFeatures">
              <Sparkles className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="exports">
              <FileText className="h-4 w-4 mr-2" />
              Exports
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="emailMarketing">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="engagement">
              <Activity className="h-4 w-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="navigation">
              <BarChart3 className="h-4 w-4 mr-2" />
              Navigation
            </TabsTrigger>
          </TabsList>

          {Object.entries(eventCategories).map(([category, events]) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()} Events
                  </CardTitle>
                  <CardDescription>
                    {events.length} event{events.length !== 1 ? 's' : ''} tracked in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {events.map((event, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-mono text-lg font-semibold text-primary">
                              {event.event}
                            </h3>
                            <p className="text-muted-foreground mt-1">{event.description}</p>
                          </div>
                          <Badge variant={
                            event.importance.includes('Critical') ? 'destructive' :
                            event.importance.includes('High') ? 'default' :
                            'outline'
                          }>
                            {event.importance.split(' - ')[0]}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-sm font-medium mb-1">Parameters:</p>
                            <code className="text-xs bg-muted p-2 rounded block">
                              {typeof event.parameters === 'string' 
                                ? event.parameters 
                                : JSON.stringify(event.parameters, null, 2)}
                            </code>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Trigger:</p>
                            <p className="text-sm text-muted-foreground">{event.trigger}</p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Use Case:</span> {event.importance.split(' - ')[1] || 'General tracking'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Setup Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setting Up Conversions in GA4</CardTitle>
            <CardDescription>
              Follow these steps to configure events as conversion goals in Google Analytics 4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-sm">
                <span className="font-medium">Navigate to Admin → Events</span> in your GA4 property
              </li>
              <li className="text-sm">
                <span className="font-medium">Wait for events to populate</span> (24-48 hours after first user activity)
              </li>
              <li className="text-sm">
                <span className="font-medium">Mark priority events as conversions:</span>
                <ul className="ml-6 mt-2 space-y-1 list-disc">
                  <li className="text-muted-foreground">assessment_completed (Primary goal)</li>
                  <li className="text-muted-foreground">checkout_started (Revenue tracking)</li>
                  <li className="text-muted-foreground">client_added (Activation metric)</li>
                  <li className="text-muted-foreground">onboarding_completed (User activation)</li>
                  <li className="text-muted-foreground">ai_insights_generated (Premium feature)</li>
                </ul>
              </li>
              <li className="text-sm">
                <span className="font-medium">Create custom audiences</span> based on event combinations
              </li>
              <li className="text-sm">
                <span className="font-medium">Build reports</span> in the Explore section to analyze funnels and user behavior
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Reference: Critical Events</CardTitle>
            <CardDescription>
              Most important events for business metrics and conversion tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Primary Metric</TableHead>
                  <TableHead>Mark as Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">assessment_completed</TableCell>
                  <TableCell>Assessments</TableCell>
                  <TableCell>Core product usage</TableCell>
                  <TableCell><Badge>Yes</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">checkout_started</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Purchase intent</TableCell>
                  <TableCell><Badge>Yes</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">client_added</TableCell>
                  <TableCell>Client Management</TableCell>
                  <TableCell>User activation</TableCell>
                  <TableCell><Badge>Yes</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">onboarding_completed</TableCell>
                  <TableCell>Engagement</TableCell>
                  <TableCell>First-time activation</TableCell>
                  <TableCell><Badge>Yes</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">ai_insights_generated</TableCell>
                  <TableCell>AI Features</TableCell>
                  <TableCell>Premium feature usage</TableCell>
                  <TableCell><Badge variant="outline">Optional</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
