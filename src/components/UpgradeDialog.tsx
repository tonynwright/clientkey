import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
}

export function UpgradeDialog({ open, onOpenChange, currentTier }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Unlock unlimited potential with ClientKey Premium
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Current Plan</CardDescription>
              <div className="text-3xl font-bold mt-2">$0/mo</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">Up to 3 clients</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">DISC assessments</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm">Basic communication playbooks</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Premium
                <Zap className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>
                Limited Early Bird Pricing
              </CardDescription>
              <div className="text-3xl font-bold mt-2">
                $19/mo
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (then $49/mo)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                10 clients included + $10/mo per 5 additional clients
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">10 clients included (add more anytime)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Unlimited staff members</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">DISC assessments</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Advanced communication playbooks</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Client comparison reports</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Email tracking & automation</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </div>
              <Button 
                className="w-full mt-4" 
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? "Loading..." : "Upgrade Now"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          * Early bird pricing locked for first 30 signups for 1 year
        </p>
      </DialogContent>
    </Dialog>
  );
}
