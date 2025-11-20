import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Users, Zap } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ComparisonReportPDF } from "./ComparisonReportPDF";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface ClientComparisonProps {
  onUpgrade?: () => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  disc_type: string | null;
  disc_scores: any;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string | null;
  disc_type: string | null;
  disc_scores: any;
}

const DISC_COLORS = {
  D: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300",
  I: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-300",
  S: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-300",
  C: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300",
};

const COMPATIBILITY_MATRIX = {
  DD: { score: 70, level: "Moderate", color: "text-yellow-600" },
  DI: { score: 75, level: "Good", color: "text-green-600" },
  DS: { score: 60, level: "Challenging", color: "text-orange-600" },
  DC: { score: 65, level: "Moderate", color: "text-yellow-600" },
  II: { score: 85, level: "Excellent", color: "text-green-600" },
  IS: { score: 80, level: "Good", color: "text-green-600" },
  IC: { score: 55, level: "Challenging", color: "text-orange-600" },
  SS: { score: 90, level: "Excellent", color: "text-green-600" },
  SC: { score: 75, level: "Good", color: "text-green-600" },
  CC: { score: 80, level: "Good", color: "text-green-600" },
};

export const ClientComparison = ({ onUpgrade }: ClientComparisonProps = {}) => {
  const { toast } = useToast();
  const [staffId, setStaffId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const { subscription, isAdmin } = useAuth();
  const isPaidUser = subscription?.pricing_tier !== 'free' || isAdmin;

  const { data: clients } = useQuery({
    queryKey: ["profiled-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");

      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: staff } = useQuery({
    queryKey: ["profiled-staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");

      if (error) throw error;
      return data as Staff[];
    },
  });

  const selectedStaff = staff?.find((s) => s.id === staffId);
  const selectedClient = clients?.find((c) => c.id === clientId);

  const getCompatibility = () => {
    if (!selectedStaff?.disc_type || !selectedClient?.disc_type) return null;
    const key = [selectedStaff.disc_type, selectedClient.disc_type]
      .sort()
      .join("") as keyof typeof COMPATIBILITY_MATRIX;
    return COMPATIBILITY_MATRIX[key];
  };

  const compatibility = getCompatibility();

  const handleExport = async () => {
    // Check if user is paid
    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "PDF exports are available on the Pro plan. Upgrade to download compatibility reports.",
        variant: "destructive",
      });
      if (onUpgrade) {
        onUpgrade();
      }
      return;
    }

    if (!selectedStaff || !selectedClient || !selectedStaff.disc_type || !selectedClient.disc_type) {
      toast({
        title: "Cannot export",
        description: "Please select a staff member and a client",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await pdf(
        <ComparisonReportPDF
          client1={{
            name: selectedStaff.name,
            email: selectedStaff.email,
            company: selectedStaff.role || "Staff Member",
            disc_type: selectedStaff.disc_type,
            disc_scores: selectedStaff.disc_scores as Record<string, number>,
          }}
          client2={{
            name: selectedClient.name,
            email: selectedClient.email,
            company: selectedClient.company,
            disc_type: selectedClient.disc_type,
            disc_scores: selectedClient.disc_scores as Record<string, number>,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedStaff.name.replace(/\s+/g, "_")}_vs_${selectedClient.name.replace(
        /\s+/g,
        "_"
      )}_Compatibility_Report.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF exported",
        description: "Compatibility report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!staff || staff.length === 0 || !clients || clients.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card p-8">
          <div className="text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>You need at least 1 profiled staff member and 1 profiled client to use this feature.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Staff-Client Compatibility Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Compare a staff member with a client to understand their working dynamics
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="staff">Staff Member</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger id="staff">
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.disc_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.disc_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedStaff && selectedClient && compatibility && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-border bg-muted/40 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Staff Member</p>
                  <p className="text-lg font-semibold text-foreground">{selectedStaff.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStaff.email}</p>
                  {selectedStaff.role && (
                    <p className="text-xs text-muted-foreground">{selectedStaff.role}</p>
                  )}
                  <Badge
                    className={`${
                      DISC_COLORS[selectedStaff.disc_type as keyof typeof DISC_COLORS]
                    } mt-2 border font-bold`}
                  >
                    {selectedStaff.disc_type} Type
                  </Badge>
                </div>
              </Card>

              <Card className="border border-border bg-muted/40 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-lg font-semibold text-foreground">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                  {selectedClient.company && (
                    <p className="text-xs text-muted-foreground">{selectedClient.company}</p>
                  )}
                  <Badge
                    className={`${
                      DISC_COLORS[selectedClient.disc_type as keyof typeof DISC_COLORS]
                    } mt-2 border font-bold`}
                  >
                    {selectedClient.disc_type} Type
                  </Badge>
                </div>
              </Card>
            </div>

            <Card className="border-2 border-primary bg-primary/5 p-6">
              <div className="text-center">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Compatibility Score
                </p>
                <p className={`mb-1 text-5xl font-bold ${compatibility.color}`}>
                  {compatibility.score}%
                </p>
                <p className={`text-lg font-semibold ${compatibility.color}`}>
                  {compatibility.level}
                </p>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-4">
              {["D", "I", "S", "C"].map((type) => {
                const score1 = (selectedStaff.disc_scores as Record<string, number>)?.[type] || 0;
                const score2 = (selectedClient.disc_scores as Record<string, number>)?.[type] || 0;

                return (
                  <Card key={type} className="border border-border bg-card p-4">
                    <div className="text-center">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{type} Score</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold text-foreground">{score1}</span>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <span className="text-lg font-bold text-foreground">{score2}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button 
              onClick={handleExport} 
              className="w-full gap-2" 
              size="lg"
              disabled={!isPaidUser}
              title={isPaidUser ? "Download Compatibility Report" : "Upgrade to download reports"}
            >
              <Download className="h-5 w-5" />
              Download Compatibility Report
              {!isPaidUser && <Zap className="h-4 w-4 ml-2 text-primary-foreground" />}
            </Button>
          </div>
        )}

        {!selectedStaff && !selectedClient && staff && staff.length > 0 && clients && clients.length > 0 && (
          <div className="mt-8 rounded-lg border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Select a staff member and a client above to analyze their DISC compatibility
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
