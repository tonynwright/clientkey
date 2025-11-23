import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Target, TrendingUp, MessageSquare, Mail, Brain, Clock, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DISCBackground } from "@/components/DISCBackground";
import { DISCShape } from "@/components/DISCShape";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const navigate = useNavigate();
  const heroSection = useScrollAnimation({ threshold: 0.2 });
  const problemSection = useScrollAnimation({ threshold: 0.3 });
  const stepsSection = useScrollAnimation({ threshold: 0.2 });
  const { user } = useAuth();
  const { toast } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@clientkey.com',
        password: 'demo123456',
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Demo Access Error",
        description: "Unable to access demo account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <DISCBackground />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center" aria-label="Hero section">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-fade-down">
          🔥 Limited Time Offer - First 30 Signups Only
        </Badge>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-up stagger-1">
          What Would You Pay to<br />
          <span className="text-primary">Never Lose a Client?</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-up stagger-2">
          ClientKey helps agencies understand their clients' personality types and communication styles—so you can deliver exactly what they need, every time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up stagger-3">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            onClick={() => navigate('/auth')}
          >
            Start Free - 3 Clients
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 hover:scale-105 transition-transform border-2"
            onClick={handleDemoLogin}
            disabled={demoLoading}
          >
            {demoLoading ? "Loading Demo..." : "🎯 View Live Demo"}
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8 animate-fade-up stagger-4">
          👆 Try the demo account to explore ClientKey with 25 sample clients
        </p>

        <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground animate-fade-up stagger-5">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Setup in 5 minutes
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section ref={problemSection.ref} className="container mx-auto px-4 py-16" aria-label="The problem ClientKey solves">
        <Card className={`border-2 border-destructive/20 bg-destructive/5 ${problemSection.isInView ? 'animate-scale-up' : 'opacity-0'}`}>
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              The Silent Client Killer
            </h2>
            <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
              You're not losing clients because your work is bad. You're losing them because your communication style doesn't match theirs. A detail-oriented client feels rushed when you move too fast. A big-picture client feels micromanaged when you focus on details.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section ref={stepsSection.ref} className="container mx-auto px-4 py-16" aria-label="How ClientKey works">
        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12 ${stepsSection.isInView ? 'animate-fade-up' : 'opacity-0'}`}>
          How ClientKey Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className={`border-border relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${stepsSection.isInView ? 'animate-fade-up stagger-1' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <DISCShape type="I" size="lg" />
            </div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-disc-i/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-disc-i" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Send Assessment</h3>
              <p className="text-muted-foreground">
                Invite your clients to take a quick 5-minute DISC personality assessment
              </p>
            </CardContent>
          </Card>

          <Card className={`border-border relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${stepsSection.isInView ? 'animate-fade-up stagger-2' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <DISCShape type="C" size="lg" />
            </div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-disc-c/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-disc-c" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Get Insights</h3>
              <p className="text-muted-foreground">
                Instantly understand their communication style, decision-making process, and preferences
              </p>
            </CardContent>
          </Card>

          <Card className={`border-border relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${stepsSection.isInView ? 'animate-fade-up stagger-3' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <DISCShape type="S" size="lg" />
            </div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-16 h-16 bg-disc-s/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-disc-s" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Communicate Better</h3>
              <p className="text-muted-foreground">
                Get personalized playbooks showing exactly how to communicate with each client
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-16" aria-label="Platform features">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Target,
              title: "DISC Personality Profiling",
              description: "Scientific personality assessments that reveal how each client thinks and decides"
            },
            {
              icon: MessageSquare,
              title: "Communication Playbooks",
              description: "Specific strategies for emails, meetings, and presentations tailored to each type"
            },
            {
              icon: Users,
              title: "Team Compatibility Reports",
              description: "See how different personalities work together and avoid conflicts"
            },
            {
              icon: Mail,
              title: "Automated Invitations",
              description: "Send assessment invites automatically with customizable email templates"
            },
            {
              icon: TrendingUp,
              title: "Client Dashboard",
              description: "Manage all your clients and their personality profiles in one place"
            },
            {
              icon: Clock,
              title: "Smart Reminders",
              description: "Automatic follow-ups to ensure all clients complete their assessments"
            }
          ].map((feature, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20" aria-label="Pricing information">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-destructive text-destructive-foreground">
            ⚡ Early Bird Special - Only 30 Spots Available
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Lock In Your Rate Today
          </h2>
          <p className="text-xl text-muted-foreground">
            After the first 30 signups, the price increases to $49/month
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="border-4 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-2 text-sm font-bold">
              BEST VALUE
            </div>
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Early Bird Annual</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-primary">$19</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground line-through">Regular: $49/month</p>
                <Badge variant="outline" className="mt-2">Save $360/year</Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Up to 300 clients</p>
                    <p className="text-sm text-muted-foreground">Profile unlimited clients</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Up to 300 staff members</p>
                    <p className="text-sm text-muted-foreground">Full team access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Rate locked for 1 year</p>
                    <p className="text-sm text-muted-foreground">Never pay more than $19/month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited DISC assessments</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Communication playbooks</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Compatibility reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Custom email templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>

              <Button 
                className="w-full py-6 text-lg"
                onClick={() => navigate('/dashboard')}
              >
                Claim Your Early Bird Spot
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                30-day money-back guarantee • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Secure payment processing • Your data is encrypted and protected
          </p>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="container mx-auto px-4 py-16" aria-label="Benefits and customer value">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Why Agencies Choose ClientKey
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Client Churn</h3>
              <p className="text-muted-foreground">
                Stop losing clients due to communication mismatches. Speak their language from day one.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Close Deals Faster</h3>
              <p className="text-muted-foreground">
                Understand decision-makers instantly and tailor your pitch to their style.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Increase Satisfaction</h3>
              <p className="text-muted-foreground">
                Deliver exactly what clients want by understanding how they think and communicate.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20" aria-label="Call to action">
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Don't Let Another Client Walk Away
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the first 30 agencies to lock in the $19/month rate and start building stronger client relationships today.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 py-6"
              onClick={() => navigate('/dashboard')}
            >
              Get Started Now - Only $19/Month
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ⏰ Limited to first 30 signups • Price increases to $49/month after
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 ClientKey. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors">Pricing</button>
              <button className="hover:text-primary transition-colors">Privacy Policy</button>
              <button className="hover:text-primary transition-colors">Terms of Service</button>
              <button className="hover:text-primary transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
