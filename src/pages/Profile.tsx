import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, ArrowLeft, Zap, Check, Shield, Users, Target, RefreshCw, Calendar, CheckCircle2, TrendingUp, Bug, Copy } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function Profile() {
  const { user, subscription, clientCount, clientLimit, isAdmin, signOut, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!user) return;

      const { data: clients, error } = await supabase
        .from('clients')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error || !clients) return;

      // Generate last 6 months
      const now = new Date();
      const months = eachMonthOfInterval({
        start: subMonths(now, 5),
        end: now
      });

      // Count clients per month
      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const count = clients.filter(client => {
          const clientDate = new Date(client.created_at);
          return clientDate >= monthStart && clientDate <= monthEnd;
        }).length;

        return {
          month: format(month, 'MMM yyyy'),
          clients: count,
          cumulative: clients.filter(c => new Date(c.created_at) <= monthEnd).length
        };
      });

      setGrowthData(monthlyData);
    };

    fetchGrowthData();
  }, [user]);

  const handleManageSubscription = () => {
    window.open('https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600', '_blank');
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('verify-subscription');
      
      if (error) throw error;

      await refreshSubscription();
      
      toast({
        title: "Subscription synced!",
        description: "Your subscription has been updated from Stripe.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sync subscription",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyDebugInfo = async () => {
    if (!subscription) return;

    const debugData = {
      pricing_tier: subscription.pricing_tier,
      status: subscription.status,
      monthly_price: subscription.monthly_price,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
      client_count: clientCount,
      client_limit: clientLimit,
      user_email: user?.email,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
      toast({
        title: "Copied to clipboard!",
        description: "Subscription data copied as JSON.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const tierName = isAdmin ? "Admin" : subscription?.pricing_tier === 'free' ? 'Free' : subscription?.pricing_tier === 'early_bird' ? 'Early Bird' : 'Regular';
  const tierPrice = isAdmin ? "Unlimited" : subscription?.pricing_tier === 'free' ? '$0' : subscription?.pricing_tier === 'early_bird' ? '$19' : '$49';
  const isFree = subscription?.pricing_tier === 'free' && !isAdmin;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-fade-up">
          {/* Profile Section */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Your Profile</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <Badge variant="default" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Account
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Subscription Section */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Subscription Status</CardTitle>
                  <CardDescription>Manage your ClientKey subscription</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleRefreshSubscription}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Badge 
                    variant={isAdmin ? "default" : isFree ? "secondary" : "default"} 
                    className={`text-lg px-4 py-2 ${
                      isAdmin ? "bg-primary" : 
                      subscription?.pricing_tier === 'early_bird' ? "bg-green-500 hover:bg-green-600" : 
                      subscription?.pricing_tier === 'regular' ? "bg-blue-500 hover:bg-blue-600" : 
                      "bg-muted"
                    }`}
                  >
                    {isAdmin ? (
                      <><Shield className="h-4 w-4 mr-2" />Admin</>
                    ) : subscription?.pricing_tier === 'early_bird' ? (
                      <><Zap className="h-4 w-4 mr-2" />Early Bird - $19/mo</>
                    ) : subscription?.pricing_tier === 'regular' ? (
                      <><Check className="h-4 w-4 mr-2" />Pro - $49/mo</>
                    ) : (
                      'Free Plan'
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Price</p>
                  <p className="text-3xl font-bold">{tierPrice}<span className="text-base font-normal text-muted-foreground">/month</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client Usage</p>
                  <p className="text-3xl font-bold">{clientCount}<span className="text-base font-normal text-muted-foreground">/{isAdmin ? '∞' : clientLimit}</span></p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="font-semibold">Plan includes:</p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm">{isAdmin ? 'Unlimited' : isFree ? 'Up to 3' : 'Up to 300'} client profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm">DISC personality assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm">Communication playbooks</span>
                  </div>
                  {!isFree && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-sm">Staff-client compatibility matching</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-sm">AI-powered insights</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {subscription?.current_period_end && !isFree && !isAdmin && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Subscription Status</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.cancel_at_period_end 
                          ? `Ends on ${format(new Date(subscription.current_period_end), 'PPP')}`
                          : `Renews ${format(new Date(subscription.current_period_end), 'PPP')}`
                        }
                      </p>
                    </div>
                    <Badge variant={subscription.cancel_at_period_end ? "destructive" : "default"}>
                      {subscription.cancel_at_period_end ? "Canceling" : "Active"}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {isFree ? (
                  <Button 
                    onClick={handleUpgrade} 
                    disabled={loading}
                    className="gradient-primary"
                    size="lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro - {subscription?.pricing_tier === 'early_bird' ? '$19' : '$49'}/month
                  </Button>
                ) : !isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription in Stripe
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Benefits (Free users only) - Show early to encourage upgrade */}
          {isFree && (
            <Card className="glass border-primary/50 animate-fade-up stagger-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Unlock Premium Features
                </CardTitle>
                <CardDescription>Upgrade to access powerful tools for client management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">300 Client Profiles</p>
                    <p className="text-sm text-muted-foreground">Scale your agency with unlimited client assessments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Staff-Client Matching</p>
                    <p className="text-sm text-muted-foreground">Match the right team members with clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">AI-Powered Insights</p>
                    <p className="text-sm text-muted-foreground">Get personalized communication recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Growth Chart - Show for all non-admin users with data */}
          {!isAdmin && growthData.length > 0 && (
            <Card className="glass animate-fade-up stagger-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Client Growth Trends
                </CardTitle>
                <CardDescription>Monthly client additions over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    clients: {
                      label: "New Clients",
                      color: "hsl(var(--primary))",
                    },
                    cumulative: {
                      label: "Total Clients",
                      color: "hsl(var(--accent))",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="clients"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClients)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-2xl font-bold text-primary">{growthData[growthData.length - 1]?.cumulative || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/5">
                    <p className="text-2xl font-bold text-accent">{growthData[growthData.length - 1]?.clients || 0}</p>
                    <p className="text-sm text-muted-foreground">Added This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Timeline (Paid users only) - Historical context */}
          {!isFree && !isAdmin && subscription && (
            <Card className="glass animate-fade-up stagger-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Subscription Timeline
                </CardTitle>
                <CardDescription>Your subscription milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-8">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-border" />
                  
                  {/* Account Created */}
                  <div className="relative flex gap-4 items-start">
                    <div className="relative z-10 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold text-sm">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(subscription.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>

                  {/* Upgraded to Paid */}
                  {subscription.current_period_start && (
                    <div className="relative flex gap-4 items-start">
                      <div className="relative z-10 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-sm">Upgraded to {tierName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(subscription.current_period_start), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next Renewal or Cancellation */}
                  {subscription.current_period_end && (
                    <div className="relative flex gap-4 items-start">
                      <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center ${
                        subscription.cancel_at_period_end ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <Calendar className={`h-4 w-4 ${
                          subscription.cancel_at_period_end ? 'text-destructive' : 'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-sm">
                          {subscription.cancel_at_period_end ? 'Subscription Ends' : 'Next Renewal'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(subscription.current_period_end), 'PPP')}
                        </p>
                        {!subscription.cancel_at_period_end && (
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll be charged {tierPrice} on this date
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Panel - Technical troubleshooting (last priority) */}
          {!isAdmin && subscription && (
            <Card className="glass animate-fade-up stagger-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Subscription Debug Info</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyDebugInfo}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                    >
                      {showDebug ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                <CardDescription>Raw subscription data for troubleshooting</CardDescription>
              </CardHeader>
              {showDebug && (
                <CardContent>
                  <div className="rounded-lg bg-muted/30 p-4 font-mono text-xs space-y-3">
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Pricing Tier:</span>
                      <span className="font-semibold">{subscription.pricing_tier || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold">{subscription.status || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Monthly Price:</span>
                      <span className="font-semibold">${(subscription.monthly_price / 100).toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Stripe Customer ID:</span>
                      <span className="break-all">{subscription.stripe_customer_id || 'Not set'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Stripe Sub ID:</span>
                      <span className="break-all">{subscription.stripe_subscription_id || 'Not set'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Period Start:</span>
                      <span>{subscription.current_period_start ? format(new Date(subscription.current_period_start), 'PPpp') : 'Not set'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Period End:</span>
                      <span>{subscription.current_period_end ? format(new Date(subscription.current_period_end), 'PPpp') : 'Not set'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Cancel at End:</span>
                      <span className="font-semibold">{subscription.cancel_at_period_end ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Created At:</span>
                      <span>{format(new Date(subscription.created_at), 'PPpp')}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Updated At:</span>
                      <span>{format(new Date(subscription.updated_at), 'PPpp')}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Client Count:</span>
                      <span className="font-semibold">{clientCount} / {clientLimit}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
