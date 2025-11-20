import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, ArrowLeft, Zap, Check, Shield, Users, Target, RefreshCw, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, subscription, clientCount, clientLimit, isAdmin, signOut, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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

          {/* Subscription Timeline (Paid users only) */}
          {!isFree && !isAdmin && subscription && (
            <Card className="glass animate-fade-up stagger-2">
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

          {/* Upgrade Benefits (Free users only) */}
          {isFree && (
            <Card className="glass border-primary/50 animate-fade-up stagger-2">
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
        </div>
      </main>
    </div>
  );
}
