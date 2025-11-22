import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Target, TrendingUp, Award, Download, Mail, MailOpen, MousePointerClick, CheckCircle2, Zap, Trash2, ArrowUpDown, Search, FileDown, Filter, Tag, Edit, List, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pdf } from "@react-pdf/renderer";
import { ClientProfilePDF } from "./ClientProfilePDF";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ReminderSettings } from "./ReminderSettings";
import { EmailTemplates } from "./EmailTemplates";
import { DISCShape } from "./DISCShape";
import { ClientTagInput } from "./ClientTagInput";
import { TagPresetsManagement } from "./TagPresetsManagement";
import { TagAnalytics } from "./TagAnalytics";
import { TagGroupedView } from "./TagGroupedView";
import { analytics } from "@/lib/analytics";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  tags: string[] | null;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [discTypeFilter, setDiscTypeFilter] = useState<'all' | 'D' | 'I' | 'S' | 'C'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>('');
  const [editingClientTags, setEditingClientTags] = useState<{ id: string; tags: string[] } | null>(null);
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [bulkTagOperation, setBulkTagOperation] = useState<'add' | 'remove'>('add');
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [showTagAnalytics, setShowTagAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tags">("list");

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
      
      analytics.clientDeleted();

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

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return;

    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to delete clients",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .in("id", Array.from(selectedClients));

      if (error) throw error;

      toast({
        title: "Clients deleted",
        description: `${selectedClients.size} client(s) have been removed`,
      });
      
      analytics.clientDeleted();

      setSelectedClients(new Set());
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast({
        title: "Failed to delete clients",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleBulkSendInvites = async () => {
    if (selectedClients.size === 0) return;

    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to send invitations",
        variant: "destructive",
      });
      return;
    }

    const clientsToInvite = clients?.filter(c => selectedClients.has(c.id) && !c.disc_type) || [];
    
    if (clientsToInvite.length === 0) {
      toast({
        title: "No clients to invite",
        description: "Selected clients have already completed assessments",
        variant: "destructive",
      });
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const client of clientsToInvite) {
        try {
          await supabase.functions.invoke("send-assessment-invite", {
            body: {
              clientId: client.id,
              clientName: client.name,
              clientEmail: client.email,
            },
          });
          successCount++;
        } catch (error) {
          console.error(`Error sending invite to ${client.email}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Invitations sent",
        description: `Successfully sent ${successCount} invitation(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
      
      analytics.assessmentInviteSent(successCount);

      setSelectedClients(new Set());
    } catch (error) {
      console.error("Error sending bulk invites:", error);
      toast({
        title: "Failed to send invitations",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedClients.size === sortedClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(sortedClients.map(c => c.id)));
    }
  };

  const handleExportCSV = () => {
    if (selectedClients.size === 0) {
      toast({
        title: "No clients selected",
        description: "Please select clients to export",
        variant: "destructive",
      });
      return;
    }

    const clientsToExport = clients?.filter(c => selectedClients.has(c.id)) || [];
    
    // CSV header
    const headers = ["Name", "Email", "Company", "DISC Type", "D Score", "I Score", "S Score", "C Score", "Tags", "Created Date"];
    
    // CSV rows
    const rows = clientsToExport.map(client => {
      const scores = client.disc_scores as Record<string, number> | null;
      const tags = client.tags?.join('; ') || 'N/A';
      return [
        `"${client.name}"`,
        `"${client.email}"`,
        `"${client.company || 'N/A'}"`,
        `"${client.disc_type || 'Not assessed'}"`,
        scores?.D || 'N/A',
        scores?.I || 'N/A',
        scores?.S || 'N/A',
        scores?.C || 'N/A',
        `"${tags}"`,
        `"${new Date(client.created_at).toLocaleDateString()}"`,
      ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clientkey_clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `Exported ${clientsToExport.length} client(s) to CSV`,
    });
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
      
      analytics.pdfExported('profile');
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTags = async (clientId: string, tags: string[]) => {
    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to edit tags",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .update({ tags })
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Tags updated",
        description: "Client tags have been updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditingClientTags(null);
    } catch (error) {
      console.error("Error updating tags:", error);
      toast({
        title: "Failed to update tags",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleBulkTagOperation = async () => {
    if (selectedClients.size === 0 || bulkTags.length === 0) return;

    if (isDemoAccount) {
      toast({
        title: "Demo account is read-only",
        description: "Sign up for your own account to edit tags",
        variant: "destructive",
      });
      return;
    }

    try {
      const clientsToUpdate = clients?.filter(c => selectedClients.has(c.id)) || [];
      
      for (const client of clientsToUpdate) {
        const currentTags = client.tags || [];
        let updatedTags: string[];

        if (bulkTagOperation === 'add') {
          // Add tags that don't already exist
          const newTags = bulkTags.filter(tag => !currentTags.includes(tag));
          updatedTags = [...currentTags, ...newTags];
        } else {
          // Remove specified tags
          updatedTags = currentTags.filter(tag => !bulkTags.includes(tag));
        }

        await supabase
          .from("clients")
          .update({ tags: updatedTags })
          .eq("id", client.id);
      }

      toast({
        title: "Tags updated",
        description: `Successfully ${bulkTagOperation === 'add' ? 'added' : 'removed'} tags for ${selectedClients.size} client(s)`,
      });

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowBulkTagDialog(false);
      setBulkTags([]);
      setSelectedClients(new Set());
    } catch (error) {
      console.error("Error updating tags:", error);
      toast({
        title: "Failed to update tags",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Get all unique tags from clients
  const allTags = Array.from(
    new Set(
      clients?.flatMap((c) => c.tags || []) || []
    )
  ).sort();

  const sortedClients = clients ? [...clients]
    .filter((client) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.company && client.company.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // DISC type filter
      if (discTypeFilter !== 'all') {
        if (client.disc_type !== discTypeFilter) return false;
      }

      // Completion status filter
      if (completionFilter !== 'all') {
        const hasCompleted = !!client.disc_type;
        if (completionFilter === 'completed' && !hasCompleted) return false;
        if (completionFilter === 'pending' && hasCompleted) return false;
      }

      // Date range filter
      if (dateRangeStart) {
        const clientDate = new Date(client.created_at);
        const startDate = new Date(dateRangeStart);
        if (clientDate < startDate) return false;
      }
      if (dateRangeEnd) {
        const clientDate = new Date(client.created_at);
        const endDate = new Date(dateRangeEnd);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        if (clientDate > endDate) return false;
      }

      // Tag filter
      if (tagFilter) {
        const clientTags = client.tags || [];
        if (!clientTags.includes(tagFilter.toLowerCase())) return false;
      }

      return true;
    })
    .sort((a, b) => {
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
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">All Clients</h2>
            {sortedClients.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedClients.size === sortedClients.length && sortedClients.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
                  Select All
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-md p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "tags" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tags")}
              >
                <FolderKanban className="h-4 w-4 mr-2" />
                Tags
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagAnalytics(!showTagAnalytics)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Tag Analytics
            </Button>
          </div>
        </div>

        {showTagAnalytics && (
          <div className="mb-6 animate-fade-up">
            <TagAnalytics />
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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

          {showAdvancedFilters && (
            <Card className="p-4 border border-border bg-muted/30">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">DISC Type</label>
                  <Select value={discTypeFilter} onValueChange={(value: any) => setDiscTypeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="D">Dominance (D)</SelectItem>
                      <SelectItem value="I">Influence (I)</SelectItem>
                      <SelectItem value="S">Steadiness (S)</SelectItem>
                      <SelectItem value="C">Conscientiousness (C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={completionFilter} onValueChange={(value: any) => setCompletionFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">From Date</label>
                  <Input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">To Date</label>
                  <Input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tag</label>
                  <Select value={tagFilter} onValueChange={(value: any) => setTagFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(discTypeFilter !== 'all' || completionFilter !== 'all' || dateRangeStart || dateRangeEnd || tagFilter) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sortedClients.length} client(s) match your filters
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDiscTypeFilter('all');
                      setCompletionFilter('all');
                      setDateRangeStart('');
                      setDateRangeEnd('');
                      setTagFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
        
        {selectedClients.size > 0 && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedClients.size} client(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkTagDialog(true)}
              >
                <Tag className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkSendInvites}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invites
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClients(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {clients && clients.length > 0 ? (
          viewMode === "tags" ? (
            <TagGroupedView
              clients={sortedClients}
              onDelete={(clientId) => setDeleteClientId(clientId)}
              onSendInvite={(clientId) => {
                const client = clients.find((c) => c.id === clientId);
                if (client) handleSendInvite(client);
              }}
              onViewInsights={(clientId) => {
                const client = clients.find((c) => c.id === clientId);
                if (client) onSelectClient(client);
              }}
              isReadOnly={isDemoAccount}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedClients.map((client) => (
              <Card
                key={client.id}
                className="border border-border bg-card p-5 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {client.disc_type && (
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DISCShape type={client.disc_type as 'D' | 'I' | 'S' | 'C'} size="md" />
                  </div>
                )}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedClients.has(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => onSelectClient(client)}>
                        <h3 className="font-semibold text-foreground">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.company || "No company"}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
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

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
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
                        setEditingClientTags({ id: client.id, tags: client.tags || [] });
                      }}
                      title="Edit tags"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
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
          )
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

      <Dialog open={!!editingClientTags} onOpenChange={(open) => !open && setEditingClientTags(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClientTagInput
              tags={editingClientTags?.tags || []}
              onTagsChange={(tags) => 
                setEditingClientTags(editingClientTags ? { ...editingClientTags, tags } : null)
              }
              placeholder="Type a tag and press Enter..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClientTags(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingClientTags) {
                  handleUpdateTags(editingClientTags.id, editingClientTags.tags);
                }
              }}
            >
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkTagDialog} onOpenChange={setShowBulkTagDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Tag Operations</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <TagPresetsManagement 
              onSelectPreset={setBulkTags} 
              showQuickSelect 
            />
            
            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Operation</label>
                <Select value={bulkTagOperation} onValueChange={(value: 'add' | 'remove') => setBulkTagOperation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Tags</SelectItem>
                    <SelectItem value="remove">Remove Tags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {bulkTagOperation === 'add' ? 'Tags to Add' : 'Tags to Remove'}
                </label>
                <ClientTagInput
                  tags={bulkTags}
                  onTagsChange={setBulkTags}
                  placeholder={bulkTagOperation === 'add' ? "Type and press Enter to add..." : "Type and press Enter to remove..."}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will {bulkTagOperation} tags {bulkTagOperation === 'add' ? 'to' : 'from'} {selectedClients.size} selected client(s)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBulkTagDialog(false);
              setBulkTags([]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleBulkTagOperation} disabled={bulkTags.length === 0}>
              Apply Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
