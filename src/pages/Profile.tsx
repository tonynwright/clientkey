import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, ArrowLeft, Zap, Check, Shield, Users, Target } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, subscription, clientCount, clientLimit, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleManageSubscription = () => {
    window.open('https://billing.stripe.com/p/login/28EeVdg045s40cf70CbV600', '_blank');
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
                  <CardTitle className="text-xl">Subscription</CardTitle>
                  <CardDescription>Manage your ClientKey subscription</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {tierName}
                </Badge>
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
                    Manage Subscription
                  </Button>
                )}
              </div>

              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  {subscription.cancel_at_period_end 
                    ? `Subscription ends on ${format(new Date(subscription.current_period_end), 'PPP')}`
                    : `Next billing date: ${format(new Date(subscription.current_period_end), 'PPP')}`
                  }
                </p>
              )}
            </CardContent>
          </Card>

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
