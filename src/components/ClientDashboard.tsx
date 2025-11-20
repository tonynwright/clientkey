import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  disc_type: string | null;
  disc_scores: any;
  created_at: string;
}

interface ClientDashboardProps {
  onSelectClient: (client: Client) => void;
}

const DISC_COLORS = {
  D: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-700",
  I: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
  S: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-300 dark:border-green-700",
  C: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-700",
};

export const ClientDashboard = ({ onSelectClient }: ClientDashboardProps) => {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profiled</p>
              <p className="text-2xl font-bold text-foreground">{stats.profiled}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
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
        <h2 className="text-xl font-semibold text-foreground mb-4">All Clients</h2>
        {clients && clients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="border border-border bg-card p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                <div className="space-y-3">
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

                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
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
    </div>
  );
};
