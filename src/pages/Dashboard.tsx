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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DISCAssessment } from "@/components/DISCAssessment";
import { ClientDashboard } from "@/components/ClientDashboard";
import { CommunicationPlaybook } from "@/components/CommunicationPlaybook";
import { ClientProfilePDF } from "@/components/ClientProfilePDF";
import { ClientComparison } from "@/components/ClientComparison";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { StripeWebhookSetup } from "@/components/StripeWebhookSetup";
import { AdminSetup } from "@/components/AdminSetup";
import { ClientInsights } from "@/components/ClientInsights";
import { UserPlus, LayoutDashboard, FileText, Target, Download, GitCompare, Zap, Settings, Shield } from "lucide-react";
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

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, clientLimit, clientCount, subscription, refreshSubscription, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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

  const createClient = useMutation({
    mutationFn: async (client: z.infer<typeof clientSchema>) => {
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
      // Save assessment
      const { error: assessmentError } = await supabase.from("assessments").insert({
        client_id: clientId,
        responses: responses,
        scores: scores,
        dominant_type: dominantType,
      });

      if (assessmentError) throw assessmentError;

      // Update client with DISC type
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          disc_type: dominantType,
          disc_scores: scores,
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
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {subscription?.pricing_tier === 'free' && !isAdmin && (
          <Alert className="mb-6 border-primary">
            <Zap className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You're on the free plan. <strong>Upgrade to add up to 300 clients!</strong>
              </span>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowUpgradeDialog(true)}
              >
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="add-client" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Client
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ClientDashboard onSelectClient={handleSelectClient} />
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
            <ClientComparison />
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-3xl mx-auto space-y-6">
              {!isAdmin && <AdminSetup />}
              <StripeWebhookSetup />
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
    </div>
  );
};

export default Dashboard;
