import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Award, Download, Mail, MailOpen, MousePointerClick, CheckCircle2, Zap, Trash2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pdf } from "@react-pdf/renderer";
import { ClientProfilePDF } from "./ClientProfilePDF";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ReminderSettings } from "./ReminderSettings";
import { EmailTemplates } from "./EmailTemplates";
import { DISCShape } from "./DISCShape";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  disc_type: string | null;
  disc_scores: any;
  created_at: string;
}

interface EmailTracking {
  client_id: string;
  event_type: "sent" | "opened" | "clicked" | "completed";
  created_at: string;
}


interface ClientDashboardProps {
  onSelectClient: (client: Client) => void;
  onUpgrade?: () => void;
}

const DISC_COLORS = {
  D: "bg-disc-d/10 text-disc-d border-disc-d/30",
  I: "bg-disc-i/10 text-disc-i border-disc-i/30",
  S: "bg-disc-s/10 text-disc-s border-disc-s/30",
  C: "bg-disc-c/10 text-disc-c border-disc-c/30",
};

export const ClientDashboard = ({ onSelectClient, onUpgrade }: ClientDashboardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDemoAccount, subscription, isAdmin } = useAuth();
  const isPaidUser = subscription?.pricing_tier !== 'free' || isAdmin;
  
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: trackingData } = useQuery({
    queryKey: ["email_tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmailTracking[];
    },
  });

  const getClientTracking = (clientId: string) => {
    if (!trackingData) return null;
    const events = trackingData.filter((t) => t.client_id === clientId);
    return {
      sent: events.some((e) => e.event_type === "sent"),
      opened: events.some((e) => e.event_type === "opened"),
      clicked: events.some((e) => e.event_type === "clicked"),
      completed: events.some((e) => e.event_type === "completed"),
    };
  };

  const handleSendInvite = async (client: Client) => {
    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to send invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("send-assessment-invite", {
        body: {
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Assessment invitation sent to ${client.email}`,
      });
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Failed to send invitation",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleSendReminders = async () => {
    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to send reminders",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Checking for reminders...",
        description: "This may take a moment",
      });

      const { data, error } = await supabase.functions.invoke("send-reminder-emails", {
        body: { manual: true },
      });

      if (error) throw error;

      const result = data as { sent: number; checked: number; needingReminders: number };
      
      toast({
        title: "Reminders sent",
        description: `Sent ${result.sent} reminder emails out of ${result.needingReminders} clients needing reminders`,
      });
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast({
        title: "Failed to send reminders",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;
    
    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to delete clients",
        variant: "destructive",
      });
      setDeleteClientId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", deleteClientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: "Client has been removed from your dashboard",
      });

      queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Failed to delete client",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setDeleteClientId(null);
    }
  };

  const handleExportPDF = async (client: Client) => {
    // Check if user is paid
    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "PDF exports are available on the Pro plan. Upgrade to download client profiles.",
        variant: "destructive",
      });
      if (onUpgrade) {
        onUpgrade();
      }
      return;
    }

    if (!client.disc_type || !client.disc_scores) {
      toast({
        title: "Cannot export",
        description: "This client needs to complete their DISC assessment first",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await pdf(
        <ClientProfilePDF
          client={{
            name: client.name,
            email: client.email,
            company: client.company,
            disc_type: client.disc_type,
            disc_scores: client.disc_scores as Record<string, number>,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${client.name.replace(/\s+/g, "_")}_ClientKey_Profile.pdf`;
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

  const sortedClients = clients ? [...clients].sort((a, b) => {
    let compareValue = 0;
    
    if (sortBy === 'name') {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortBy === 'company') {
      const companyA = a.company || '';
      const companyB = b.company || '';
      compareValue = companyA.localeCompare(companyB);
    } else {
      compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  }) : [];

  const stats = {
    total: clients?.length || 0,
    profiled: clients?.filter((c) => c.disc_type).length || 0,
    D: clients?.filter((c) => c.disc_type === "D").length || 0,
    I: clients?.filter((c) => c.disc_type === "I").length || 0,
    S: clients?.filter((c) => c.disc_type === "S").length || 0,
    C: clients?.filter((c) => c.disc_type === "C").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Dashboard Overview</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSendReminders}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Reminders
        </Button>
      </div>

      <div className="mb-8 space-y-6">
        <ReminderSettings />
        <EmailTemplates />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 animate-fade-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 transition-transform hover:scale-110">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 animate-fade-up stagger-2">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-3 transition-transform hover:scale-110">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profiled</p>
              <p className="text-2xl font-bold text-foreground">{stats.profiled}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 animate-fade-up stagger-3">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 transition-transform hover:scale-110">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.total > 0 ? Math.round((stats.profiled / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DISC Types</p>
              <div className="flex gap-1 mt-1">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  D:{stats.D}
                </span>
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                  I:{stats.I}
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  S:{stats.S}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  C:{stats.C}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">All Clients</h2>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="name">Client Name</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {clients && clients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedClients.map((client) => (
              <Card
                key={client.id}
                className="border border-border bg-card p-5 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => onSelectClient(client)}
              >
                {client.disc_type && (
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DISCShape type={client.disc_type as 'D' | 'I' | 'S' | 'C'} size="md" />
                  </div>
                )}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.company || "No company"}</p>
                    </div>
                    {client.disc_type && (
                      <Badge
                        className={`${
                          DISC_COLORS[client.disc_type as keyof typeof DISC_COLORS]
                        } border font-bold`}
                      >
                        {client.disc_type}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">{client.email}</p>

                  {(() => {
                    const tracking = getClientTracking(client.id);
                    if (tracking && tracking.sent && !client.disc_type) {
                      return (
                        <div className="flex gap-2 text-xs">
                          {tracking.opened && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <MailOpen className="h-3 w-3" />
                              Opened
                            </span>
                          )}
                          {tracking.clicked && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <MousePointerClick className="h-3 w-3" />
                              Clicked
                            </span>
                          )}
                          {!tracking.opened && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              Sent
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {client.disc_scores && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
                      {Object.entries(client.disc_scores as Record<string, number>).map(([type, score]) => (
                        <div key={type} className="text-center">
                          <p className="text-xs font-medium text-muted-foreground">{type}</p>
                          <p className="text-sm font-bold text-foreground">{score}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!client.disc_type && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendInvite(client);
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invite
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(client);
                      }}
                    >
                      View Profile
                    </Button>
                    {client.disc_type && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(client);
                        }}
                        title={isPaidUser ? "Export PDF" : "Upgrade to export PDF"}
                        className={!isPaidUser ? "opacity-60" : ""}
                      >
                        <Download className="h-4 w-4" />
                        {!isPaidUser && <Zap className="h-3 w-3 ml-1 text-primary" />}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteClientId(client.id);
                      }}
                      title="Delete client"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No clients yet. Add your first client to get started.
            </p>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone and will remove all associated data including assessments and insights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
