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
import { Download, Users } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ComparisonReportPDF } from "./ComparisonReportPDF";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
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

export const ClientComparison = () => {
  const { toast } = useToast();
  const [client1Id, setClient1Id] = useState<string>("");
  const [client2Id, setClient2Id] = useState<string>("");

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

  const client1 = clients?.find((c) => c.id === client1Id);
  const client2 = clients?.find((c) => c.id === client2Id);

  const getCompatibility = () => {
    if (!client1?.disc_type || !client2?.disc_type) return null;
    const key = [client1.disc_type, client2.disc_type]
      .sort()
      .join("") as keyof typeof COMPATIBILITY_MATRIX;
    return COMPATIBILITY_MATRIX[key];
  };

  const compatibility = getCompatibility();

  const handleExport = async () => {
    if (!client1 || !client2 || !client1.disc_type || !client2.disc_type) {
      toast({
        title: "Cannot export",
        description: "Please select two profiled clients",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await pdf(
        <ComparisonReportPDF
          client1={{
            name: client1.name,
            email: client1.email,
            company: client1.company,
            disc_type: client1.disc_type,
            disc_scores: client1.disc_scores as Record<string, number>,
          }}
          client2={{
            name: client2.name,
            email: client2.email,
            company: client2.company,
            disc_type: client2.disc_type,
            disc_scores: client2.disc_scores as Record<string, number>,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${client1.name.replace(/\s+/g, "_")}_vs_${client2.name.replace(
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold text-foreground">DISC Compatibility Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Compare two clients to understand their collaboration dynamics
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client1">First Client</Label>
            <Select value={client1Id} onValueChange={setClient1Id}>
              <SelectTrigger id="client1">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  ?.filter((c) => c.id !== client2Id)
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.disc_type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client2">Second Client</Label>
            <Select value={client2Id} onValueChange={setClient2Id}>
              <SelectTrigger id="client2">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  ?.filter((c) => c.id !== client1Id)
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.disc_type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {client1 && client2 && compatibility && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-border bg-muted/40 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Client 1</p>
                  <p className="text-lg font-semibold text-foreground">{client1.name}</p>
                  <p className="text-xs text-muted-foreground">{client1.email}</p>
                  {client1.company && (
                    <p className="text-xs text-muted-foreground">{client1.company}</p>
                  )}
                  <Badge
                    className={`${
                      DISC_COLORS[client1.disc_type as keyof typeof DISC_COLORS]
                    } mt-2 border font-bold`}
                  >
                    {client1.disc_type} Type
                  </Badge>
                </div>
              </Card>

              <Card className="border border-border bg-muted/40 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Client 2</p>
                  <p className="text-lg font-semibold text-foreground">{client2.name}</p>
                  <p className="text-xs text-muted-foreground">{client2.email}</p>
                  {client2.company && (
                    <p className="text-xs text-muted-foreground">{client2.company}</p>
                  )}
                  <Badge
                    className={`${
                      DISC_COLORS[client2.disc_type as keyof typeof DISC_COLORS]
                    } mt-2 border font-bold`}
                  >
                    {client2.disc_type} Type
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
                const score1 = (client1.disc_scores as Record<string, number>)?.[type] || 0;
                const score2 = (client2.disc_scores as Record<string, number>)?.[type] || 0;

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

            <Button onClick={handleExport} className="w-full gap-2" size="lg">
              <Download className="h-5 w-5" />
              Download Compatibility Report
            </Button>
          </div>
        )}

        {!client1 && !client2 && clients && clients.length > 0 && (
          <div className="mt-8 rounded-lg border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Select two clients above to analyze their DISC compatibility
            </p>
          </div>
        )}

        {clients && clients.length < 2 && (
          <div className="mt-8 rounded-lg border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              You need at least two profiled clients to use the comparison feature
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
