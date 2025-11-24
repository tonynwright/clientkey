import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DemoClient {
  id: string;
  company_name: string;
  monthly_retainer: number;
  service_type: string;
  contract_end_date: string;
  account_manager: string;
  composite_score: number;
  payment_status: number;
  responsiveness: number;
  meeting_attendance: number;
  results_delivery: number;
  last_contact: string;
}

const demoClients: DemoClient[] = [
  {
    id: "1",
    company_name: "Acme Corporation",
    monthly_retainer: 8000,
    service_type: "Full Service Marketing",
    contract_end_date: "2025-12-31",
    account_manager: "Sarah Johnson",
    composite_score: 4.8,
    payment_status: 5,
    responsiveness: 5,
    meeting_attendance: 5,
    results_delivery: 4,
    last_contact: "2 days ago"
  },
  {
    id: "2",
    company_name: "Tech Solutions Ltd",
    monthly_retainer: 5500,
    service_type: "Social Media Management",
    contract_end_date: "2025-08-15",
    account_manager: "Michael Chen",
    composite_score: 3.2,
    payment_status: 3,
    responsiveness: 3,
    meeting_attendance: 4,
    results_delivery: 3,
    last_contact: "1 week ago"
  },
  {
    id: "3",
    company_name: "Digital Agency Co",
    monthly_retainer: 12000,
    service_type: "SEO & Content Strategy",
    contract_end_date: "2025-06-30",
    account_manager: "Emily Rodriguez",
    composite_score: 2.1,
    payment_status: 2,
    responsiveness: 2,
    meeting_attendance: 2,
    results_delivery: 2,
    last_contact: "3 weeks ago"
  },
  {
    id: "4",
    company_name: "StartupHub Inc",
    monthly_retainer: 4200,
    service_type: "Brand Development",
    contract_end_date: "2025-11-20",
    account_manager: "David Park",
    composite_score: 4.5,
    payment_status: 5,
    responsiveness: 4,
    meeting_attendance: 5,
    results_delivery: 4,
    last_contact: "Yesterday"
  },
  {
    id: "5",
    company_name: "GreenLeaf Ventures",
    monthly_retainer: 6800,
    service_type: "PPC Campaigns",
    contract_end_date: "2025-09-10",
    account_manager: "Lisa Martinez",
    composite_score: 3.7,
    payment_status: 4,
    responsiveness: 4,
    meeting_attendance: 3,
    results_delivery: 4,
    last_contact: "4 days ago"
  },
  {
    id: "6",
    company_name: "BlueOcean Media",
    monthly_retainer: 9500,
    service_type: "Full Service Marketing",
    contract_end_date: "2025-10-05",
    account_manager: "James Wilson",
    composite_score: 1.8,
    payment_status: 1,
    responsiveness: 2,
    meeting_attendance: 2,
    results_delivery: 2,
    last_contact: "1 month ago"
  }
];

export function InteractiveHealthDemo() {
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);

  const getHealthColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getHealthText = (score: number) => {
    if (score >= 4) return "Healthy";
    if (score >= 3) return "At Risk";
    return "Critical";
  };

  const getHealthBorderColor = (score: number) => {
    if (score >= 4) return "border-green-500/20";
    if (score >= 3) return "border-yellow-500/20";
    return "border-red-500/20";
  };

  const getMetricColor = (value: number) => {
    if (value >= 4) return "text-green-600";
    if (value >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
          Interactive Demo
        </Badge>
        <h3 className="text-2xl font-bold mb-2">Try It Yourself</h3>
        <p className="text-muted-foreground">
          Click any client to see their detailed health breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoClients.map((client) => (
          <Card
            key={client.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${getHealthBorderColor(client.composite_score)} hover:scale-105`}
            onClick={() => setSelectedClient(client)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{client.company_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{client.service_type}</p>
                </div>
                {client.composite_score < 3 && (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getHealthColor(client.composite_score)}`} />
                  <span className="font-semibold text-sm">{getHealthText(client.composite_score)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {client.composite_score.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">${client.monthly_retainer.toLocaleString()}</span>/mo
                  </p>
                  <p className="text-muted-foreground">
                    Manager: <span className="text-foreground">{client.account_manager}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Last contact: <span className="text-foreground">{client.last_contact}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedClient.company_name}</span>
                  <Badge className={getHealthColor(selectedClient.composite_score)}>
                    {getHealthText(selectedClient.composite_score)} ({selectedClient.composite_score.toFixed(1)}/5.0)
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Retainer</p>
                    <p className="text-xl font-semibold">${selectedClient.monthly_retainer.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="text-lg font-medium">{selectedClient.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Manager</p>
                    <p className="text-lg font-medium">{selectedClient.account_manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Ends</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedClient.contract_end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Health Signal Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(selectedClient.payment_status)}`}
                            style={{ width: `${(selectedClient.payment_status / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-8 ${getMetricColor(selectedClient.payment_status)}`}>
                          {selectedClient.payment_status}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Responsiveness</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(selectedClient.responsiveness)}`}
                            style={{ width: `${(selectedClient.responsiveness / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-8 ${getMetricColor(selectedClient.responsiveness)}`}>
                          {selectedClient.responsiveness}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meeting Attendance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(selectedClient.meeting_attendance)}`}
                            style={{ width: `${(selectedClient.meeting_attendance / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-8 ${getMetricColor(selectedClient.meeting_attendance)}`}>
                          {selectedClient.meeting_attendance}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Results Delivery</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(selectedClient.results_delivery)}`}
                            style={{ width: `${(selectedClient.results_delivery / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-8 ${getMetricColor(selectedClient.results_delivery)}`}>
                          {selectedClient.results_delivery}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.composite_score >= 4 && (
                      <span className="text-green-600 font-medium">
                        ✓ This client is in excellent health. Continue current engagement strategies.
                      </span>
                    )}
                    {selectedClient.composite_score >= 3 && selectedClient.composite_score < 4 && (
                      <span className="text-yellow-600 font-medium">
                        ⚠ This client shows warning signs. Schedule a check-in call to address concerns.
                      </span>
                    )}
                    {selectedClient.composite_score < 3 && (
                      <span className="text-red-600 font-medium">
                        🚨 This client is at high risk of churn. Immediate action required to save the relationship.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
