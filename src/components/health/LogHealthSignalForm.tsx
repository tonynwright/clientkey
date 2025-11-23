import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface LogHealthSignalFormProps {
  clientId: string;
  onSuccess: () => void;
}

export function LogHealthSignalForm({ clientId, onSuccess }: LogHealthSignalFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_status: 3,
    responsiveness: 3,
    meeting_attendance: 3,
    results_delivery: 3,
    last_contact_date: new Date().toISOString().split("T")[0],
  });

  const calculateCompositeScore = () => {
    // Weighted average: payment (30%), responsiveness (25%), meetings (20%), results (25%)
    return (
      formData.payment_status * 0.3 +
      formData.responsiveness * 0.25 +
      formData.meeting_attendance * 0.2 +
      formData.results_delivery * 0.25
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("health_signals").insert({
        client_id: clientId,
        payment_status: formData.payment_status,
        responsiveness: formData.responsiveness,
        meeting_attendance: formData.meeting_attendance,
        results_delivery: formData.results_delivery,
        last_contact_date: formData.last_contact_date,
        composite_score: calculateCompositeScore(),
      });

      if (error) throw error;

      toast.success("Health signal logged successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to log health signal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Payment Status: {formData.payment_status}</Label>
        <Slider
          value={[formData.payment_status]}
          onValueChange={([value]) => setFormData({ ...formData, payment_status: value })}
          min={1}
          max={5}
          step={1}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">1 = Late/Issues, 5 = On-time/Excellent</p>
      </div>

      <div>
        <Label>Responsiveness: {formData.responsiveness}</Label>
        <Slider
          value={[formData.responsiveness]}
          onValueChange={([value]) => setFormData({ ...formData, responsiveness: value })}
          min={1}
          max={5}
          step={1}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">1 = Unresponsive, 5 = Very Responsive</p>
      </div>

      <div>
        <Label>Meeting Attendance: {formData.meeting_attendance}</Label>
        <Slider
          value={[formData.meeting_attendance]}
          onValueChange={([value]) => setFormData({ ...formData, meeting_attendance: value })}
          min={1}
          max={5}
          step={1}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">1 = Rarely Attends, 5 = Always Attends</p>
      </div>

      <div>
        <Label>Results Delivery: {formData.results_delivery}</Label>
        <Slider
          value={[formData.results_delivery]}
          onValueChange={([value]) => setFormData({ ...formData, results_delivery: value })}
          min={1}
          max={5}
          step={1}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">1 = Poor Results, 5 = Excellent Results</p>
      </div>

      <div>
        <Label htmlFor="last_contact_date">Last Contact Date</Label>
        <Input
          id="last_contact_date"
          type="date"
          value={formData.last_contact_date}
          onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
          required
        />
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">Composite Score</p>
        <p className="text-2xl font-bold">{calculateCompositeScore().toFixed(1)}/5.0</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Logging..." : "Log Health Signal"}
      </Button>
    </form>
  );
}
