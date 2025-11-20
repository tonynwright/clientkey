import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users, Target, TrendingUp, Brain, Mail, FileText, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = {
    free: [
      { name: "Up to 3 clients", included: true },
      { name: "Basic DISC assessments", included: true },
      { name: "Communication playbooks", included: true },
      { name: "Client dashboard", included: true },
      { name: "Staff management", included: true },
      { name: "Public assessment links", included: true },
      { name: "Email invitations", included: true },
      { name: "Staff-client matching", included: false },
      { name: "Email analytics dashboard", included: false },
      { name: "AI-generated insights", included: false },
      { name: "Custom email templates", included: false },
      { name: "Advanced reminder settings", included: false },
      { name: "PDF exports", included: false },
      { name: "Bulk operations", included: false },
    ],
    paid: [
      { name: "Up to 300 clients", included: true },
      { name: "Up to 300 staff members", included: true },
      { name: "Unlimited DISC assessments", included: true },
      { name: "Communication playbooks", included: true },
      { name: "Client dashboard", included: true },
      { name: "Staff management", included: true },
      { name: "Public assessment links", included: true },
      { name: "Email invitations", included: true },
      { name: "Staff-client matching", included: true },
      { name: "Email analytics dashboard", included: true },
      { name: "AI-generated insights", included: true },
      { name: "Custom email templates", included: true },
      { name: "Advanced reminder settings", included: true },
      { name: "PDF exports", included: true },
      { name: "Bulk operations", included: true },
      { name: "Priority support", included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">ClientKey</h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🔥 Limited Time Offer - First 30 Signups Only
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free with 3 clients, or unlock everything with our early bird pricing
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="border-2 border-border relative">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Free Tier</CardTitle>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for trying out ClientKey
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Start Free
              </Button>

              <div className="space-y-3">
                <p className="font-semibold text-sm text-muted-foreground">What's Included:</p>
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paid Tier */}
          <Card className="border-4 border-primary relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-6 py-1 text-sm font-bold">
                BEST VALUE
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary">$19</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground line-through mt-1">
                Regular: $49/month
              </p>
              <Badge variant="outline" className="mt-2">
                Early Bird Special - Save $360/year
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                className="w-full py-6 text-lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                <Zap className="h-5 w-5 mr-2" />
                Claim Your Spot
              </Button>

              <div className="space-y-3">
                <p className="font-semibold text-sm text-muted-foreground">Everything in Free, plus:</p>
                {features.paid.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature.name}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  🔒 Rate locked for 1 year • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Detailed Feature Comparison
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-6 font-semibold">Feature</th>
                      <th className="text-center p-6 font-semibold">Free</th>
                      <th className="text-center p-6 font-semibold bg-primary/5">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4 font-medium">Client Limit</td>
                      <td className="p-4 text-center">3 clients</td>
                      <td className="p-4 text-center bg-primary/5">300 clients</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-medium">Staff Members</td>
                      <td className="p-4 text-center">Unlimited</td>
                      <td className="p-4 text-center bg-primary/5">300 staff</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-medium">DISC Assessments</td>
                      <td className="p-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-medium">Communication Playbooks</td>
                      <td className="p-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4 font-medium">Email Invitations</td>
                      <td className="p-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Staff-Client Matching
                      </td>
                      <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground/40 mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Email Analytics Dashboard
                      </td>
                      <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground/40 mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI-Generated Insights
                      </td>
                      <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground/40 mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Custom Email Templates
                      </td>
                      <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground/40 mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        PDF Exports
                      </td>
                      <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground/40 mx-auto" /></td>
                      <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ / Value Props */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Upgrade to Pro?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Scale Your Agency</h3>
                    <p className="text-sm text-muted-foreground">
                      Move from 3 to 300 clients. Profile your entire client base and never worry about hitting limits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized, AI-generated communication strategies for every client personality type.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Track Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor open rates, click rates, and completion rates to optimize your client outreach.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Perfect Pairings</h3>
                    <p className="text-sm text-muted-foreground">
                      Match staff with clients based on personality compatibility for better relationships.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Client Relationships?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the first 30 agencies to lock in the $19/month early bird rate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-12 py-6"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                <Zap className="h-5 w-5 mr-2" />
                Get Started - $19/month
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-12 py-6"
                onClick={() => navigate('/')}
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              ⏰ Price increases to $49/month after first 30 signups
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ClientKey. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
