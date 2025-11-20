import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, Briefcase, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface SeedingProgressDialogProps {
  open: boolean;
}

const STEPS = [
  { icon: Users, label: "Creating 25 diverse clients", duration: 2000 },
  { icon: Briefcase, label: "Setting up 25 staff members", duration: 2000 },
  { icon: Sparkles, label: "Generating DISC profiles", duration: 2000 },
  { icon: CheckCircle2, label: "Finalizing demo data", duration: 1000 },
];

export function SeedingProgressDialog({ open }: SeedingProgressDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    // Animate through steps
    const stepDuration = STEPS.reduce((acc, step) => acc + step.duration, 0) / STEPS.length;
    const progressPerStep = 100 / STEPS.length;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(Math.min(currentProgress, 100));

      const newStep = Math.floor(currentProgress / progressPerStep);
      if (newStep < STEPS.length && newStep !== currentStep) {
        setCurrentStep(newStep);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Creating Demo Data
          </DialogTitle>
          <DialogDescription>
            Setting up a complete demonstration environment with sample clients and staff
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Progress value={progress} className="h-2" />

          <div className="space-y-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isComplete = index < currentStep;
              const isActive = index === currentStep;
              
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isComplete
                        ? 'text-green-600 dark:text-green-400 line-through'
                        : isActive
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              This may take up to 30 seconds to complete
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}