import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, MousePointerClick, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalCompleted: number;
  openRate: number;
  clickRate: number;
  completionRate: number;
}

export function EmailAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all clients for this user
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id);

      if (clientsError) throw clientsError;

      const clientIds = clients?.map(c => c.id) || [];

      if (clientIds.length === 0) {
        setAnalytics({
          totalSent: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalCompleted: 0,
          openRate: 0,
          clickRate: 0,
          completionRate: 0,
        });
        setLoading(false);
        return;
      }

      // Get email tracking data
      const { data: trackingData, error: trackingError } = await supabase
        .from("email_tracking")
        .select("event_type, client_id")
        .in("client_id", clientIds);

      if (trackingError) throw trackingError;

      // Get completed assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from("assessments")
        .select("client_id")
        .in("client_id", clientIds);

      if (assessmentsError) throw assessmentsError;

      // Calculate metrics
      const sentEvents = trackingData?.filter(t => t.event_type === "sent") || [];
      const openedEvents = trackingData?.filter(t => t.event_type === "opened") || [];
      const clickedEvents = trackingData?.filter(t => t.event_type === "clicked") || [];

      // Get unique clients for each event type
      const uniqueSent = new Set(sentEvents.map(e => e.client_id)).size;
      const uniqueOpened = new Set(openedEvents.map(e => e.client_id)).size;
      const uniqueClicked = new Set(clickedEvents.map(e => e.client_id)).size;
      const uniqueCompleted = new Set(assessments?.map(a => a.client_id) || []).size;

      const openRate = uniqueSent > 0 ? (uniqueOpened / uniqueSent) * 100 : 0;
      const clickRate = uniqueSent > 0 ? (uniqueClicked / uniqueSent) * 100 : 0;
      const completionRate = uniqueSent > 0 ? (uniqueCompleted / uniqueSent) * 100 : 0;

      setAnalytics({
        totalSent: uniqueSent,
        totalOpened: uniqueOpened,
        totalClicked: uniqueClicked,
        totalCompleted: uniqueCompleted,
        openRate,
        clickRate,
        completionRate,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const chartData = [
    { name: "Sent", value: 100, count: analytics.totalSent, color: "hsl(var(--primary))" },
    { name: "Opened", value: analytics.openRate, count: analytics.totalOpened, color: "hsl(var(--chart-2))" },
    { name: "Clicked", value: analytics.clickRate, count: analytics.totalClicked, color: "hsl(var(--chart-3))" },
    { name: "Completed", value: analytics.completionRate, count: analytics.totalCompleted, color: "hsl(var(--chart-4))" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Analytics</h2>
        <p className="text-muted-foreground">
          Track the effectiveness of your assessment invitations
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total assessment invitations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalOpened} of {analytics.totalSent} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalClicked} of {analytics.totalSent} clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalCompleted} of {analytics.totalSent} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Funnel</CardTitle>
          <CardDescription>
            Visual representation of client engagement through the assessment process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} clients ({data.value.toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      {analytics.totalSent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.openRate < 50 && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="mt-0.5">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Low Open Rate</p>
                  <p className="text-sm text-muted-foreground">
                    Your open rate is below 50%. Consider improving your email subject lines or sending at different times.
                  </p>
                </div>
              </div>
            )}
            {analytics.clickRate > 0 && analytics.clickRate < analytics.openRate * 0.5 && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="mt-0.5">
                  <MousePointerClick className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Click-Through Opportunity</p>
                  <p className="text-sm text-muted-foreground">
                    Many clients open emails but don't click. Try making your call-to-action more prominent or compelling.
                  </p>
                </div>
              </div>
            )}
            {analytics.completionRate > 70 && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Excellent Completion Rate!</p>
                  <p className="text-sm text-muted-foreground">
                    Your completion rate is above 70%. You're doing a great job engaging clients!
                  </p>
                </div>
              </div>
            )}
            {analytics.totalSent < 10 && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="mt-0.5">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Build Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Send more invitations to get more reliable analytics insights.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
