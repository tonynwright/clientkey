import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DISCAssessment } from "@/components/DISCAssessment";
import { ClientDashboard } from "@/components/ClientDashboard";
import { StaffManagement } from "@/components/StaffManagement";
import { StaffClientMatching } from "@/components/StaffClientMatching";
import { EmailTemplates } from "@/components/EmailTemplates";
import { EmailAnalytics } from "@/components/EmailAnalytics";
import { ReminderSettings } from "@/components/ReminderSettings";
import { CommunicationPlaybook } from "@/components/CommunicationPlaybook";
import { ClientProfilePDF } from "@/components/ClientProfilePDF";
import { ClientComparison } from "@/components/ClientComparison";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { OnboardingSequences } from "@/components/OnboardingSequences";

import { AdminSetup } from "@/components/AdminSetup";
import { ClientInsights } from "@/components/ClientInsights";
import { Onboarding } from "@/components/Onboarding";
import { SeedingProgressDialog } from "@/components/SeedingProgressDialog";
import { CouponManagement } from "@/components/CouponManagement";
import { BulkInsights } from "@/components/BulkInsights";
import { UserPlus, LayoutDashboard, FileText, Target, Download, GitCompare, Zap, Settings, Shield, Sparkles, Users, CheckCircle2, Mail, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { pdf } from "@react-pdf/renderer";

const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  company: z
    .string()
    .trim()
    .max(150, { message: "Company must be less than 150 characters" })
    .optional()
    .or(z.literal("")),
});

const assessmentResultSchema = z.object({
  responses: z.array(z.string()).length(24, "Assessment must have exactly 24 responses"),
  scores: z.object({
    D: z.number().min(0).max(48),
    I: z.number().min(0).max(48),
    S: z.number().min(0).max(48),
    C: z.number().min(0).max(48),
  }),
  dominantType: z.enum(['D', 'I', 'S', 'C']),
});

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, clientLimit, clientCount, subscription, refreshSubscription, signOut, isAdmin, isDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Demo account inactivity timeout (30 minutes)
  useEffect(() => {
    if (user?.email !== 'demo@clientkey.com') return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        toast({
          title: "Demo Session Expired",
          description: "You've been logged out due to inactivity. Sign up for your own account!",
        });
        signOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activities.forEach(activity => {
      document.addEventListener(activity, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      activities.forEach(activity => {
        document.removeEventListener(activity, resetTimer);
      });
    };
  }, [user, signOut, toast]);

  // Handle successful checkout
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      // Verify subscription
      setTimeout(async () => {
        await supabase.functions.invoke('verify-subscription');
        await refreshSubscription();
        toast({
          title: "Subscription activated!",
          description: "Your account has been upgraded successfully.",
        });
      }, 1000);
      
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, refreshSubscription, toast]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "" });
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(false);

  // Check if user is new (no clients) and hasn't seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && clientCount === 0) {
      setShowOnboarding(true);
    }
  }, [clientCount]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    toast({
      title: "Onboarding skipped",
      description: "You can restart the tour anytime from Settings.",
    });
  };

  const handleOnboardingCreateClient = () => {
    setActiveTab("add-client");
  };

  const handleOnboardingTryDemo = async () => {
    try {
      setSeedingProgress(true);

      const { data, error } = await supabase.functions.invoke('seed-demo-data');

      if (error) throw error;

      toast({
        title: "Demo data created!",
        description: data.message || "Successfully created demo clients and staff members.",
      });

      setShowOnboarding(false);
      setActiveTab("matching");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    } catch (error) {
      console.error("Error creating demo data:", error);
      toast({
        title: "Error",
        description: "Failed to create demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSeedingProgress(false);
    }
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setShowOnboarding(true);
  };

  const handleResetDemoData = async () => {
    try {
      setSeedingProgress(true);

      const { data, error } = await supabase.functions.invoke('seed-demo-data');

      if (error) throw error;

      toast({
        title: "Demo data reset!",
        description: data.message || "Successfully reset demo environment with fresh sample data.",
      });

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    } catch (error) {
      console.error("Error resetting demo data:", error);
      toast({
        title: "Error",
        description: "Failed to reset demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSeedingProgress(false);
    }
  };

  const createClient = useMutation({
    mutationFn: async (client: z.infer<typeof clientSchema>) => {
      // Block demo account mutations
      if (isDemoAccount) {
        throw new Error("Demo account is read-only. Sign up for your own account to add clients!");
      }
      
      // Check client limit
      if (clientCount >= clientLimit) {
        throw new Error(`You've reached your limit of ${clientLimit} clients. Upgrade to add more.`);
      }

      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          email: client.email,
          company: client.company || null,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Client created",
        description: "Now complete their DISC assessment",
      });
      setCurrentClientId(data.id);
      setShowAssessment(true);
      setClientForm({ name: "", email: "", company: "" });
      refreshSubscription();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async ({
      clientId,
      responses,
      scores,
      dominantType,
    }: {
      clientId: string;
      responses: string[];
      scores: Record<string, number>;
      dominantType: string;
    }) => {
      // Block demo account mutations
      if (isDemoAccount) {
        throw new Error("Demo account is read-only. Sign up for your own account to save assessments!");
      }
      
      // Validate assessment data
      const validationResult = assessmentResultSchema.safeParse({
        responses,
        scores,
        dominantType,
      });

      if (!validationResult.success) {
        throw new Error("Invalid assessment data: " + validationResult.error.message);
      }

      const validatedData = validationResult.data;

      // Save assessment
      const { error: assessmentError } = await supabase.from("assessments").insert({
        client_id: clientId,
        responses: validatedData.responses,
        scores: validatedData.scores,
        dominant_type: validatedData.dominantType,
      });

      if (assessmentError) throw assessmentError;

      // Update client with DISC type
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          disc_type: validatedData.dominantType,
          disc_scores: validatedData.scores,
        })
        .eq("id", clientId);

      if (clientError) throw clientError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Assessment saved",
        description: "Client profile updated with DISC type",
      });
      setShowAssessment(false);
      setCurrentClientId(null);
      setActiveTab("dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to save assessment",
        variant: "destructive",
      });
    },
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();

    const result = clientSchema.safeParse(clientForm);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.errors[0]?.message || "Please check your input",
        variant: "destructive",
      });
      return;
    }

    createClient.mutate(result.data);
  };

  const handleAssessmentComplete = (
    responses: string[],
    scores: Record<string, number>,
    dominantType: string
  ) => {
    if (!currentClientId) return;
    saveAssessment.mutate({ clientId: currentClientId, responses, scores, dominantType });
  };

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    if (client.disc_type) {
      setShowPlaybook(true);
    } else {
      toast({
        title: "Assessment incomplete",
        description: "This client hasn't completed their DISC assessment yet",
      });
    }
  };

  const handleExportPlaybook = async () => {
    // Check if user is paid
    const isPaidUser = subscription?.pricing_tier !== 'free' || isAdmin;
    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "PDF exports are available on the Pro plan. Upgrade to download client profiles.",
        variant: "destructive",
      });
      setShowUpgradeDialog(true);
      return;
    }

    if (!selectedClient?.disc_type || !selectedClient?.disc_scores) {
      toast({
        title: "Cannot export",
        description: "Client profile is incomplete",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await pdf(
        <ClientProfilePDF
          client={{
            name: selectedClient.name,
            email: selectedClient.email,
            company: selectedClient.company,
            disc_type: selectedClient.disc_type,
            disc_scores: selectedClient.disc_scores,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedClient.name.replace(/\s+/g, "_")}_ClientKey_Profile.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF exported",
        description: "Client profile downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                ClientKey
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin 
                  ? `Admin Account - Unlimited clients (${clientCount})` 
                  : `${subscription?.pricing_tier === 'free' ? 'Free Tier' : subscription?.pricing_tier === 'early_bird' ? 'Early Bird' : 'Regular'} - ${clientCount}/${clientLimit} clients`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                My Account
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user?.email === 'demo@clientkey.com' && (
          <Alert className="mb-6 border-muted">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-sm text-muted-foreground">
              Demo mode - Changes won't be saved. 
              <Button 
                variant="link" 
                size="sm"
                onClick={() => {
                  signOut();
                  navigate('/auth');
                }}
                className="px-2 h-auto"
              >
                Sign up for your own account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isAdmin && clientCount / clientLimit >= 0.8 && clientCount < clientLimit && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-sm">
              <span className="font-semibold">Approaching client limit:</span> You're using {clientCount} of {clientLimit} client slots ({Math.round((clientCount / clientLimit) * 100)}%). 
              {subscription?.pricing_tier === 'free' ? (
                <>
                  {' '}<Button 
                    variant="link" 
                    size="sm"
                    onClick={() => setShowUpgradeDialog(true)}
                    className="px-2 h-auto underline"
                  >
                    Upgrade to add more clients
                  </Button>
                </>
              ) : (
                <>
                  {' '}<Button 
                    variant="link" 
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="px-2 h-auto underline"
                  >
                    Add more client slots
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {subscription?.status === 'incomplete' || subscription?.status === 'past_due' ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Issue:</strong> Your subscription payment {subscription.status === 'incomplete' ? 'is incomplete' : 'is past due'}. 
              Please update your payment method to continue using premium features.
              <Button 
                variant="link" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="px-2 h-auto text-destructive-foreground hover:text-destructive-foreground/80"
              >
                Update payment method
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-7 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="add-client" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Client
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger 
              value="matching" 
              className="gap-2"
              disabled={subscription?.pricing_tier === 'free' && !isAdmin}
            >
              <Target className="h-4 w-4" />
              Matching
              {subscription?.pricing_tier === 'free' && !isAdmin && (
                <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="gap-2"
              disabled={subscription?.pricing_tier === 'free' && !isAdmin}
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
              {subscription?.pricing_tier === 'free' && !isAdmin && (
                <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="bulk-insights" 
              className="gap-2"
              disabled={subscription?.pricing_tier === 'free' && !isAdmin}
            >
              <Target className="h-4 w-4" />
              Bulk Insights
              {subscription?.pricing_tier === 'free' && !isAdmin && (
                <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ClientDashboard 
              onSelectClient={handleSelectClient} 
              onUpgrade={() => setShowUpgradeDialog(true)}
            />
          </TabsContent>

          <TabsContent value="add-client">
            <div className="mx-auto max-w-2xl">
              <Card className="border border-border bg-card p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Add New Client</h2>
                  <p className="text-sm text-muted-foreground">
                    Create a client profile to start their DISC assessment
                  </p>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={clientForm.name}
                      onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={clientForm.company}
                      onChange={(e) => setClientForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Create Client & Start Assessment
                  </Button>
                </form>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <ClientComparison onUpgrade={() => setShowUpgradeDialog(true)} />
          </TabsContent>

          <TabsContent value="staff">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="matching">
            {subscription?.pricing_tier === 'free' && !isAdmin ? (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Staff-Client Matching is a Pro Feature</h3>
                      <p className="text-muted-foreground mb-6">
                        Unlock AI-powered compatibility analysis to find the perfect staff-client pairings based on DISC personality profiles.
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2">With Pro, you get:</h4>
                        <ul className="text-sm space-y-2 text-left max-w-md mx-auto">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            AI-powered compatibility scoring
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Detailed strengths & challenges analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Optimal staff assignment recommendations
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Up to 300 clients and 300 staff members
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          size="lg"
                          onClick={() => setShowUpgradeDialog(true)}
                          className="w-full"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await refreshSubscription();
                            toast({
                              title: "Subscription refreshed",
                              description: "Your subscription status has been updated",
                            });
                          }}
                          className="w-full"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Already upgraded? Refresh status
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <StaffClientMatching />
            )}
          </TabsContent>

          <TabsContent value="emails">
            <div className="max-w-6xl mx-auto space-y-6">
              <EmailTemplates onUpgrade={() => setShowUpgradeDialog(true)} />
              <ReminderSettings />
              <OnboardingSequences />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {subscription?.pricing_tier === 'free' && !isAdmin ? (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Email Analytics is a Pro Feature</h3>
                      <p className="text-muted-foreground mb-6">
                        Unlock advanced email analytics to track open rates, click rates, and completion rates for your assessment invitations.
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2">With Pro, you get:</h4>
                        <ul className="text-sm space-y-2 text-left max-w-md mx-auto">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Real-time email engagement tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Visual engagement funnel charts
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Actionable insights and recommendations
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Track performance over time
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Up to 300 clients and 300 staff members
                          </li>
                        </ul>
                      </div>
                      <Button 
                        size="lg"
                        onClick={() => setShowUpgradeDialog(true)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="max-w-6xl mx-auto">
                <EmailAnalytics />
              </div>
            )}
          </TabsContent>

          <TabsContent value="bulk-insights">
            <BulkInsights />
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">Demo Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Access the demo account to explore ClientKey with sample data
                      </p>
                    </div>
                    <Button 
                      onClick={async () => {
                        try {
                          await signOut();
                          const { error } = await supabase.auth.signInWithPassword({
                            email: 'demo@clientkey.com',
                            password: 'demo123456',
                          });
                          if (error) throw error;
                          navigate('/dashboard');
                          toast({
                            title: "Switched to demo account",
                            description: "You're now viewing the demo environment",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to access demo account",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="outline"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Access Demo
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">Reset Demo Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Clear and reseed your demo environment with fresh sample data (25 clients and 25 staff)
                      </p>
                    </div>
                    <Button 
                      onClick={handleResetDemoData}
                      variant="outline"
                      disabled={seedingProgress}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${seedingProgress ? 'animate-spin' : ''}`} />
                      {seedingProgress ? 'Resetting...' : 'Reset Demo Data'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">Getting Started Tour</h3>
                      <p className="text-sm text-muted-foreground">
                        Restart the onboarding tour to learn about DISC types and platform features
                      </p>
                    </div>
                    <Button onClick={handleRestartOnboarding} variant="outline">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Restart Tour
                    </Button>
                  </div>
                </div>
              </Card>
              {isAdmin && <CouponManagement />}
              {!isAdmin && <AdminSetup />}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">DISC Personality Assessment</DialogTitle>
          </DialogHeader>
          <DISCAssessment onComplete={handleAssessmentComplete} />
        </DialogContent>
      </Dialog>

      <Dialog open={showPlaybook} onOpenChange={setShowPlaybook}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {selectedClient?.name} - Profile & Insights
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPlaybook}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            {selectedClient?.disc_type && selectedClient?.disc_scores && (
              <>
                <ClientInsights
                  clientId={selectedClient.id}
                  clientName={selectedClient.name}
                  discType={selectedClient.disc_type}
                  discScores={selectedClient.disc_scores}
                  onUpgrade={() => setShowUpgradeDialog(true)}
                />
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Communication Playbook</h3>
                  <CommunicationPlaybook type={selectedClient.disc_type} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeDialog 
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentTier={subscription?.pricing_tier || 'free'}
      />

      <Onboarding
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onCreateClient={handleOnboardingCreateClient}
        onTryDemo={handleOnboardingTryDemo}
        onSkip={handleOnboardingSkip}
      />

      <SeedingProgressDialog open={seedingProgress} />
    </div>
  );
};

export default Dashboard;
