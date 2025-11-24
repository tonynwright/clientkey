import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, X, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface ClientHealthTutorialProps {
  open: boolean;
  onClose: () => void;
}

export function ClientHealthTutorial({ open, onClose }: ClientHealthTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Client Health Tracking",
      description: "Monitor and maintain strong client relationships with data-driven health scoring",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Client Health Tracking helps marketing agencies proactively identify at-risk clients before they churn. 
            By monitoring multiple health signals, you can take action early and maintain strong relationships.
          </p>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                What You'll Learn
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• How to add and track clients</li>
                <li>• Understanding health signals and composite scores</li>
                <li>• Reading health trends over time</li>
                <li>• Identifying at-risk clients early</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Understanding Health Scores",
      description: "Learn how composite health scores are calculated",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Each client receives a <strong>composite health score</strong> from 1-5, calculated as a weighted 
            average of five key signals:
          </p>
          <div className="grid gap-3">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">1. Payment Status (1-5)</h4>
                <p className="text-sm text-muted-foreground">
                  Are payments on time? Any delays or disputes?
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">2. Responsiveness (1-5)</h4>
                <p className="text-sm text-muted-foreground">
                  How quickly does the client respond to emails and calls?
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">3. Meeting Attendance (1-5)</h4>
                <p className="text-sm text-muted-foreground">
                  Are they showing up for scheduled meetings?
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">4. Results Delivery (1-5)</h4>
                <p className="text-sm text-muted-foreground">
                  How satisfied are they with your service delivery?
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">5. Last Contact Date</h4>
                <p className="text-sm text-muted-foreground">
                  When did you last communicate with them?
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Health Status Colors",
      description: "Quickly identify client health at a glance",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Clients are color-coded based on their composite health score:
          </p>
          <div className="space-y-3">
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400">Healthy (4.0 - 5.0)</h4>
                  <p className="text-sm text-muted-foreground">
                    Client relationship is strong. Continue regular touchpoints.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">At Risk (3.0 - 3.9)</h4>
                  <p className="text-sm text-muted-foreground">
                    Warning signs detected. Schedule a check-in call soon.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">Critical (&lt; 3.0)</h4>
                  <p className="text-sm text-muted-foreground">
                    Immediate attention required. Client may churn soon.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-500/50 bg-orange-500/10">
              <CardContent className="p-4 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400">Stale Data Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows if a client hasn't been updated in 14+ days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Adding Clients",
      description: "Start tracking your client relationships",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            To begin tracking client health, you'll need to add your clients to the system:
          </p>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Required Client Information:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Company Name</strong> - The client's business name</li>
                <li><strong>Monthly Retainer</strong> - Recurring revenue from this client</li>
                <li><strong>Service Type</strong> - What services you provide (SEO, PPC, etc.)</li>
                <li><strong>Contract End Date</strong> - When the current contract expires</li>
                <li><strong>Account Manager</strong> - Who owns this client relationship</li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Click the <strong>"Add Client"</strong> button on the dashboard to get started. You can add 
            as many clients as you need to track.
          </p>
        </div>
      ),
    },
    {
      title: "Logging Health Signals",
      description: "Update client health status regularly",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Regular health signal updates ensure accurate tracking. Here's how to log them:
          </p>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Best Practices
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Log weekly or bi-weekly</strong> - Keep data fresh and actionable</li>
                <li>• <strong>Be honest with ratings</strong> - Accurate data leads to better insights</li>
                <li>• <strong>Update after key interactions</strong> - Log after meetings or major events</li>
                <li>• <strong>Watch for trends</strong> - Declining scores over time signal problems</li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Click on any client card to view their details and log new health signals. The system 
            automatically calculates the composite score based on your ratings.
          </p>
        </div>
      ),
    },
    {
      title: "Reading Health Trends",
      description: "Spot problems before they become critical",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Each client detail page shows a 6-month health trend chart that visualizes score changes over time.
          </p>
          <div className="grid gap-3">
            <Card className="border-green-500/50">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">Improving Trend</h4>
                  <p className="text-xs text-muted-foreground">
                    Scores consistently rising - relationship strengthening
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/50">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-yellow-500" />
                <div>
                  <h4 className="font-semibold text-sm">Declining Trend</h4>
                  <p className="text-xs text-muted-foreground">
                    Scores dropping - intervention needed soon
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h4 className="font-semibold text-sm">Sudden Drop</h4>
                  <p className="text-xs text-muted-foreground">
                    Sharp score decrease - requires immediate attention
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pro tip:</strong> Review your client health dashboard weekly. Set calendar reminders 
                to check in with at-risk clients and schedule proactive touchpoints with healthy ones.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Taking Action",
      description: "Turn insights into retention strategies",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Client health data is only valuable if you act on it. Here's what to do at each level:
          </p>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500">Healthy</Badge>
                  <h4 className="font-semibold">4.0 - 5.0</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Continue regular check-ins</li>
                  <li>✓ Share wins and success metrics</li>
                  <li>✓ Ask for referrals or testimonials</li>
                  <li>✓ Explore upsell opportunities</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-500">At Risk</Badge>
                  <h4 className="font-semibold">3.0 - 3.9</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>⚠ Schedule a strategy call within 1 week</li>
                  <li>⚠ Review satisfaction and concerns</li>
                  <li>⚠ Adjust communication frequency</li>
                  <li>⚠ Share quick wins to rebuild confidence</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">Critical</Badge>
                  <h4 className="font-semibold">&lt; 3.0</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>🚨 Immediate account manager intervention</li>
                  <li>🚨 Executive-level call within 48 hours</li>
                  <li>🚨 Identify and resolve pain points</li>
                  <li>🚨 Consider service adjustments or concessions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "You're Ready to Track Client Health!",
      description: "Start monitoring your clients today",
      content: (
        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Tutorial Complete!</h3>
              <p className="text-muted-foreground mb-4">
                You now understand how to track and improve client health using data-driven insights.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Quick Start Checklist:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>□ Add your first 3-5 clients</li>
                  <li>□ Log initial health signals for each</li>
                  <li>□ Set a weekly calendar reminder to review health</li>
                  <li>□ Schedule check-ins with at-risk clients</li>
                  <li>□ Review health trends after 2-3 weeks</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Remember: Consistent tracking leads to proactive client retention. Start logging today!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">{steps[currentStep].title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="flex gap-1 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="min-h-[400px]">{steps[currentStep].content}</div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleClose}>
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}