import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Target, Mail, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
  onCreateClient: () => void;
  onSkip?: () => void;
}

const DISC_TYPES = [
  {
    type: "D",
    name: "Dominance",
    color: "bg-red-500",
    description: "Direct, decisive, and results-oriented. They value efficiency and getting things done.",
    traits: ["Fast-paced", "Goal-driven", "Competitive", "Direct communication"]
  },
  {
    type: "I",
    name: "Influence",
    color: "bg-yellow-500",
    description: "Enthusiastic, optimistic, and people-oriented. They love collaboration and social interaction.",
    traits: ["Outgoing", "Enthusiastic", "Persuasive", "Relationship-focused"]
  },
  {
    type: "S",
    name: "Steadiness",
    color: "bg-green-500",
    description: "Steady, supportive, and loyal. They value stability and harmonious relationships.",
    traits: ["Patient", "Supportive", "Consistent", "Team-oriented"]
  },
  {
    type: "C",
    name: "Conscientiousness",
    color: "bg-blue-500",
    description: "Analytical, detail-oriented, and systematic. They value accuracy and quality.",
    traits: ["Precise", "Analytical", "Quality-focused", "Methodical"]
  }
];

export function Onboarding({ open, onComplete, onCreateClient, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  // Reset to first step when dialog opens
  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleCreateClientClick = () => {
    onComplete();
    onCreateClient();
  };

  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle className="text-2xl">Welcome to ClientKey</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
              Skip Tour
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <DialogDescription className="text-muted-foreground pt-2">
            Step {step + 1} of {totalSteps + 1}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Understand Your Clients Like Never Before
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  ClientKey helps agencies profile clients using DISC personality assessment 
                  to improve communication and strengthen relationships.
                </p>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Profile Your Clients</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Send DISC assessments and get detailed personality profiles for each client
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Personalized Communication</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Get tailored communication playbooks for each personality type
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Build Stronger Relationships</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Understand compatibility and optimize team dynamics with AI-powered insights
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Understanding DISC Personality Types
                </h3>
                <p className="text-muted-foreground">
                  DISC is a proven framework for understanding communication styles and behaviors
                </p>
              </div>

              <div className="grid gap-4">
                {DISC_TYPES.map((type) => (
                  <Card key={type.type} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${type.color.split('-')[1]}-500))` }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                          {type.type}
                        </div>
                        <div>
                          <CardTitle className="text-base">{type.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {type.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {type.traits.map((trait) => (
                          <span
                            key={trait}
                            className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Create Your First Client
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Start by adding a client to your dashboard. You'll be able to send them 
                  a DISC assessment and get personalized communication insights.
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Add client details</p>
                      <p className="text-sm text-muted-foreground">Name, email, and company information</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Send assessment invitation</p>
                      <p className="text-sm text-muted-foreground">Your client receives a 24-question DISC assessment via email</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Get insights</p>
                      <p className="text-sm text-muted-foreground">View personality profiles, communication playbooks, and AI-generated insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  You're All Set!
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  You're ready to start profiling your clients and improving your communication strategies.
                </p>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Pro Tip: Email Templates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Customize your assessment invitation emails in Settings to match your brand
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Track Engagement</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Monitor when clients open and click your assessment invitations
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div>
            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreateClientClick}>
                Create Your First Client
                <Users className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
