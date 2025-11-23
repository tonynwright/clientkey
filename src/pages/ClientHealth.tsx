import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogHealthSignalForm } from "@/components/health/LogHealthSignalForm";
import { HealthTrendChart } from "@/components/health/HealthTrendChart";
import { toast } from "sonner";

interface Client {
  id: string;
  company_name: string;
  monthly_retainer: number;
  service_type: string;
  contract_end_date: string;
  account_manager: string;
}

interface HealthSignal {
  id: string;
  payment_status: number;
  responsiveness: number;
  meeting_attendance: number;
  results_delivery: number;
  last_contact_date: string;
  composite_score: number;
  created_at: string;
}

export default function ClientHealth() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [signals, setSignals] = useState<HealthSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user && clientId) {
      fetchClientData();
    }
  }, [user, clientId]);

  const fetchClientData = async () => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from("clients_health")
        .select("*")
        .eq("id", clientId)
        .eq("user_id", user?.id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      const { data: signalsData, error: signalsError } = await supabase
        .from("health_signals")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (signalsError) throw signalsError;
      setSignals(signalsData || []);
    } catch (error: any) {
      toast.error("Failed to fetch client data");
      navigate("/health");
    } finally {
      setLoading(false);
    }
  };

  const latestSignal = signals[0];

  if (loading) {
    return <div className="min-h-screen bg-background p-6">Loading...</div>;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/health")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">{client.company_name}</h1>
          <p className="text-muted-foreground mt-2">{client.service_type}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Retainer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${client.monthly_retainer.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">{client.account_manager}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contract Ends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">{new Date(client.contract_end_date).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Health Signals</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Signal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Health Signal</DialogTitle>
                  </DialogHeader>
                  <LogHealthSignalForm
                    clientId={clientId!}
                    onSuccess={() => {
                      setDialogOpen(false);
                      fetchClientData();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {latestSignal ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Composite Score</p>
                    <p className="text-3xl font-bold">{latestSignal.composite_score.toFixed(1)}/5.0</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className="text-xl font-semibold">{latestSignal.payment_status}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsiveness</p>
                      <p className="text-xl font-semibold">{latestSignal.responsiveness}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meeting Attendance</p>
                      <p className="text-xl font-semibold">{latestSignal.meeting_attendance}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Results Delivery</p>
                      <p className="text-xl font-semibold">{latestSignal.results_delivery}/5</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Contact</p>
                    <p className="text-lg">{new Date(latestSignal.last_contact_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No health signals logged yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthTrendChart signals={signals} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.map((signal) => (
                <div key={signal.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">Score: {signal.composite_score.toFixed(1)}/5.0</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(signal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p>{signal.payment_status}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p>{signal.responsiveness}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Meetings</p>
                      <p>{signal.meeting_attendance}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Results</p>
                      <p>{signal.results_delivery}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
