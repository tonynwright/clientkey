import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus,
  Target,
  Mail,
  TrendingUp,
  FileText,
  Users,
  Sparkles,
  GitCompare,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Crown,
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  isPro?: boolean;
  benefits: string[];
  actionText?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to ClientKey",
    description: "ClientKey helps agencies understand clients through DISC personality profiling and provides personalized communication strategies. Let's walk through the key features.",
    icon: Target,
    benefits: [
      "Profile unlimited clients with DISC assessment",
      "Get AI-powered communication insights",
      "Match staff with ideal client personalities",
      "Automate client onboarding workflows",
    ],
  },
  {
    title: "Add Your First Client",
    description: "Start by adding a client to your dashboard. You'll enter their basic information and then complete their DISC personality assessment.",
    icon: UserPlus,
    benefits: [
      "Store client contact information",
      "Track personality types (D, I, S, C)",
      "View detailed DISC scores",
      "Free tier: Up to 3 clients",
      "Pro tier: Up to 300 clients + add-ons",
    ],
    actionText: "Go to Add Client tab",
  },
  {
    title: "DISC Personality Assessment",
    description: "The 24-question DISC assessment reveals client personality traits across four dimensions: Dominance, Influence, Steadiness, and Conscientiousness.",
    icon: Target,
    benefits: [
      "24 forced-choice questions",
      "Scientifically validated assessment",
      "Instant personality type results",
      "Visual score breakdown by dimension",
    ],
  },
  {
    title: "Communication Playbooks",
    description: "Get personalized communication strategies based on each client's DISC type. Learn exactly how to approach, motivate, and communicate with each personality.",
    icon: FileText,
    benefits: [
      "Tailored communication do's and don'ts",
      "Email and meeting best practices",
      "Conflict resolution strategies",
      "Motivation and decision-making insights",
    ],
  },
  {
    title: "Staff Management",
    description: "Add your team members and complete DISC assessments for staff. Understanding your team's personalities helps with internal collaboration.",
    icon: Users,
    benefits: [
      "Profile unlimited staff members",
      "Complete DISC assessments for team",
      "Track staff personality distributions",
      "Build well-balanced teams",
    ],
    actionText: "Go to Staff tab",
  },
  {
    title: "Staff-Client Matching",
    description: "Discover which team members work best with which clients based on DISC compatibility scoring. Optimize assignments for better outcomes.",
    icon: GitCompare,
    isPro: true,
    benefits: [
      "AI-powered compatibility analysis",
      "Visual compatibility heatmap",
      "Detailed pairing recommendations",
      "Avoid personality conflicts",
      "Maximize team effectiveness",
    ],
  },
  {
    title: "Email Invitations",
    description: "Send professional DISC assessment invitations to clients via email. Track opens, clicks, and completions automatically.",
    icon: Mail,
    benefits: [
      "Branded email templates",
      "Public assessment links",
      "Automatic email tracking",
      "Multiple reminder options",
    ],
  },
  {
    title: "Custom Email Templates",
    description: "Personalize invitation and reminder emails with your branding, colors, and messaging. Make every touchpoint reflect your agency.",
    icon: Sparkles,
    isPro: true,
    benefits: [
      "Customize email subject lines",
      "Edit email content and branding",
      "Add company logo and colors",
      "Use dynamic variables",
      "A/B test different approaches",
    ],
  },
  {
    title: "Automated Onboarding Sequences",
    description: "Create multi-step email campaigns that automatically guide new clients through your onboarding process over days or weeks.",
    icon: Zap,
    benefits: [
      "Build multi-step email sequences",
      "Set delays between each step",
      "Use template variables",
      "Pause or resume sequences",
      "Perfect for client nurturing",
    ],
    actionText: "View in Emails tab",
  },
  {
    title: "Email Analytics Dashboard",
    description: "Track email campaign performance with detailed analytics. See open rates, click rates, and assessment completion rates.",
    icon: TrendingUp,
    isPro: true,
    benefits: [
      "Real-time engagement tracking",
      "Visual funnel charts",
      "Completion rate insights",
      "Performance over time",
      "Optimize your outreach",
    ],
  },
  {
    title: "AI-Generated Insights",
    description: "Get personalized, AI-powered DISC insights for each client. Deep-dive analysis beyond basic personality typing.",
    icon: Sparkles,
    isPro: true,
    benefits: [
      "Comprehensive personality analysis",
      "Communication recommendations",
      "Working style preferences",
      "Conflict management strategies",
      "Tailored to each client",
    ],
  },
  {
    title: "PDF Exports & Reports",
    description: "Generate professional PDF reports for client profiles, compatibility analyses, and AI insights. Perfect for client deliverables.",
    icon: FileText,
    isPro: true,
    benefits: [
      "Client profile PDFs",
      "Compatibility comparison reports",
      "AI insights documents",
      "Branded and professional",
      "Share with clients or team",
    ],
  },
  {
    title: "You're All Set!",
    description: "You now know all the key features of ClientKey. Start adding clients, complete assessments, and unlock deeper insights into client communication.",
    icon: CheckCircle2,
    benefits: [
      "Free tier: 3 clients included",
      "Upgrade anytime for more clients",
      "Access premium features with Pro",
      "Cancel anytime, no commitments",
    ],
    actionText: "Start using ClientKey",
  },
];

interface ComprehensiveTutorialProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const ComprehensiveTutorial = ({ open, onComplete, onSkip }: ComprehensiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.isPro ? "bg-gradient-to-br from-primary to-purple-600" : "bg-primary/10"
              }`}>
                <StepIcon className={`h-6 w-6 ${step.isPro ? "text-white" : "text-primary"}`} />
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {step.title}
                  {step.isPro && (
                    <Badge className="bg-gradient-to-r from-primary to-purple-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Step {currentStep + 1} of {tutorialSteps.length}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Progress value={progress} className="h-2" />

          <Card className={step.isPro ? "border-primary/50 bg-gradient-to-br from-primary/5 to-purple-600/5" : ""}>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  {step.isPro ? (
                    <>
                      <Crown className="h-4 w-4 text-primary" />
                      Pro Features:
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Key Benefits:
                    </>
                  )}
                </h4>
                <ul className="space-y-2">
                  {step.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {step.isPro && (
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Upgrade to unlock:</strong> This feature is available on the Pro plan starting at $19/month (early bird) or $49/month (regular pricing).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              {isFirstStep && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                >
                  Skip Tutorial
                </Button>
              )}
            </div>

            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {step.actionText && !isLastStep && (
            <p className="text-sm text-center text-muted-foreground">
              After this tutorial, {step.actionText.toLowerCase()} to try this feature.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};