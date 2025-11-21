import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface OnboardingSequence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface OnboardingStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  email_subject: string;
  email_content: string;
}

export const OnboardingSequences = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<OnboardingSequence | null>(null);
  const [sequenceName, setSequenceName] = useState("");
  const [sequenceDescription, setSequenceDescription] = useState("");
  const [steps, setSteps] = useState<Array<{
    step_order: number;
    delay_days: number;
    email_subject: string;
    email_content: string;
  }>>([
    { step_order: 1, delay_days: 0, email_subject: "", email_content: "" }
  ]);

  const queryClient = useQueryClient();

  const { data: sequences, isLoading } = useQuery({
    queryKey: ["onboarding-sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_sequences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OnboardingSequence[];
    },
  });

  const createSequenceMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create sequence
      const { data: sequence, error: sequenceError } = await supabase
        .from("onboarding_sequences")
        .insert({
          user_id: user.id,
          name: sequenceName,
          description: sequenceDescription,
          is_active: true,
        })
        .select()
        .single();

      if (sequenceError) throw sequenceError;

      // Create steps
      const stepsToInsert = steps.map(step => ({
        sequence_id: sequence.id,
        ...step,
      }));

      const { error: stepsError } = await supabase
        .from("onboarding_sequence_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      return sequence;
    },
    onSuccess: () => {
      toast.success("Onboarding sequence created successfully!");
      queryClient.invalidateQueries({ queryKey: ["onboarding-sequences"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create sequence: " + error.message);
    },
  });

  const toggleSequenceMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("onboarding_sequences")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-sequences"] });
      toast.success("Sequence status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update sequence: " + error.message);
    },
  });

  const deleteSequenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("onboarding_sequences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-sequences"] });
      toast.success("Sequence deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete sequence: " + error.message);
    },
  });

  const resetForm = () => {
    setSequenceName("");
    setSequenceDescription("");
    setSteps([{ step_order: 1, delay_days: 0, email_subject: "", email_content: "" }]);
  };

  const addStep = () => {
    setSteps([...steps, { 
      step_order: steps.length + 1, 
      delay_days: 0, 
      email_subject: "", 
      email_content: "" 
    }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.map((step, i) => ({ ...step, step_order: i + 1 })));
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Onboarding Sequences</h2>
          <p className="text-muted-foreground">Automate multi-step email campaigns for new clients</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Onboarding Sequence</DialogTitle>
              <DialogDescription>
                Set up a multi-step email sequence for new client onboarding
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name</Label>
                <Input
                  id="name"
                  value={sequenceName}
                  onChange={(e) => setSequenceName(e.target.value)}
                  placeholder="Welcome Sequence"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sequenceDescription}
                  onChange={(e) => setSequenceDescription(e.target.value)}
                  placeholder="Brief description of this sequence..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Email Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {steps.map((step, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Step {step.step_order}</CardTitle>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Delay (days after previous step)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={step.delay_days}
                          onChange={(e) => updateStep(index, "delay_days", parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Subject</Label>
                        <Input
                          value={step.email_subject}
                          onChange={(e) => updateStep(index, "email_subject", e.target.value)}
                          placeholder="Welcome to our platform!"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Content</Label>
                        <Textarea
                          value={step.email_content}
                          onChange={(e) => updateStep(index, "email_content", e.target.value)}
                          placeholder="Hi {{client_name}}, welcome aboard!..."
                          rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Available variables: {"{{client_name}}"}, {"{{client_company}}"}, {"{{client_email}}"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => createSequenceMutation.mutate()}
                disabled={createSequenceMutation.isPending || !sequenceName || steps.some(s => !s.email_subject || !s.email_content)}
                className="w-full"
              >
                {createSequenceMutation.isPending ? "Creating..." : "Create Sequence"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading sequences...</div>
      ) : sequences && sequences.length > 0 ? (
        <div className="grid gap-4">
          {sequences.map((sequence) => (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sequence.name}</CardTitle>
                    {sequence.description && (
                      <CardDescription>{sequence.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSequenceMutation.mutate({
                        id: sequence.id,
                        is_active: !sequence.is_active,
                      })}
                    >
                      {sequence.is_active ? (
                        <><Pause className="w-4 h-4 mr-2" /> Pause</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" /> Activate</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this sequence?")) {
                          deleteSequenceMutation.mutate(sequence.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    sequence.is_active 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}>
                    {sequence.is_active ? "Active" : "Paused"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(sequence.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No onboarding sequences yet</p>
            <p className="text-sm text-muted-foreground">
              Create automated email sequences to guide new clients through onboarding
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};