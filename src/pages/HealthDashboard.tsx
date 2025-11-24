import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, AlertCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddClientForm } from "@/components/health/AddClientForm";
import { toast } from "sonner";

interface Client {
  id: string;
  company_name: string;
  monthly_retainer: number;
  service_type: string;
  contract_end_date: string;
  account_manager: string;
  updated_at: string;
}

interface LatestSignal {
  composite_score: number;
  created_at: string;
}

export default function HealthDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [signals, setSignals] = useState<Record<string, LatestSignal>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients_health")
        .select("*")
        .eq("user_id", user?.id)
        .order("company_name");

      if (clientsError) throw clientsError;

      setClients(clientsData || []);

      // Fetch latest signals for each client
      const signalsMap: Record<string, LatestSignal> = {};
      for (const client of clientsData || []) {
        const { data: signalData } = await supabase
          .from("health_signals")
          .select("composite_score, created_at")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (signalData) {
          signalsMap[client.id] = signalData;
        }
      }
      setSignals(signalsMap);
    } catch (error: any) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score?: number) => {
    if (!score) return "bg-muted";
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getHealthText = (score?: number) => {
    if (!score) return "No Data";
    if (score >= 4) return "Healthy";
    if (score >= 3) return "At Risk";
    return "Critical";
  };

  const isStale = (updatedAt: string) => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= 14;
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 gap-2"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-foreground">Client Health Dashboard</h1>
            <p className="text-muted-foreground mt-2">Monitor and track client health scores</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <AddClientForm 
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchClients();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading clients...</div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No clients yet. Add your first client to get started.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const signal = signals[client.id];
              const stale = isStale(signal?.created_at || client.updated_at);
              
              return (
                <Card
                  key={client.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/health/client/${client.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{client.company_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{client.service_type}</p>
                      </div>
                      {stale && (
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getHealthColor(signal?.composite_score)}`} />
                        <span className="font-semibold">{getHealthText(signal?.composite_score)}</span>
                        {signal?.composite_score && (
                          <span className="text-sm text-muted-foreground">
                            {signal.composite_score.toFixed(1)}/5.0
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          Retainer: <span className="text-foreground font-medium">${client.monthly_retainer.toLocaleString()}/mo</span>
                        </p>
                        <p className="text-muted-foreground">
                          Manager: <span className="text-foreground">{client.account_manager}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Contract Ends: <span className="text-foreground">
                            {new Date(client.contract_end_date).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      {stale && (
                        <p className="text-xs text-orange-500 flex items-center gap-1 mt-2">
                          <AlertCircle className="w-3 h-3" />
                          Not updated in 14+ days
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
