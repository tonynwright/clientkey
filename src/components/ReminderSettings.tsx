import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ReminderSettingsType {
  id: string;
  reminder_delay_days: number;
  max_reminders: number;
}

export const ReminderSettings = () => {
  const queryClient = useQueryClient();
  const [delayDays, setDelayDays] = useState<number>(3);
  const [maxReminders, setMaxReminders] = useState<number>(3);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as ReminderSettingsType;
    },
  });

  useEffect(() => {
    if (settings) {
      setDelayDays(settings.reminder_delay_days);
      setMaxReminders(settings.max_reminders);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reminder_settings")
        .update({
          reminder_delay_days: delayDays,
          max_reminders: maxReminders,
        })
        .eq("id", settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast({
        title: "Settings updated",
        description: "Reminder settings have been saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Failed to update settings",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Reminder Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Reminder Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delay-days">Send reminder after</Label>
          <Select
            value={delayDays.toString()}
            onValueChange={(value) => setDelayDays(parseInt(value))}
          >
            <SelectTrigger id="delay-days">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="2">2 days</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="5">5 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Time to wait after a client opens the email before sending a reminder
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-reminders">Maximum reminders</Label>
          <Select
            value={maxReminders.toString()}
            onValueChange={(value) => setMaxReminders(parseInt(value))}
          >
            <SelectTrigger id="max-reminders">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 reminder</SelectItem>
              <SelectItem value="2">2 reminders</SelectItem>
              <SelectItem value="3">3 reminders</SelectItem>
              <SelectItem value="4">4 reminders</SelectItem>
              <SelectItem value="5">5 reminders</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Number of reminder emails to send before stopping
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="w-full"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );
};
