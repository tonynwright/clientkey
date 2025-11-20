import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DISCAssessment } from "@/components/DISCAssessment";
import { CheckCircle2 } from "lucide-react";

export default function PublicAssessment() {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        toast({
          title: "Invalid Link",
          description: "This assessment link is invalid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Unable to load assessment. Please check your link.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if already assessed
      if (data.disc_type) {
        setIsComplete(true);
      }

      setClient(data);
      setLoading(false);
    };

    fetchClient();
  }, [clientId, toast]);

  const handleAssessmentComplete = async (results: any) => {
    if (!clientId) return;

    try {
      // Update client with DISC results
      const { error: updateError } = await supabase
        .from("clients")
        .update({
          disc_type: results.dominantType,
          disc_scores: results.scores,
        })
        .eq("id", clientId);

      if (updateError) throw updateError;

      // Save assessment
      const { error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          client_id: clientId,
          responses: results.responses,
          scores: results.scores,
          dominant_type: results.dominantType,
        });

      if (assessmentError) throw assessmentError;

      // Track completion
      await supabase.from("email_tracking").insert({
        client_id: clientId,
        event_type: "completed",
      });

      setIsComplete(true);
      toast({
        title: "Assessment Complete!",
        description: "Thank you for completing the DISC assessment.",
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>
              Thank you for completing the DISC personality assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Your results have been saved and shared with your agency. They'll use this information to communicate with you more effectively.
            </p>
            {client?.disc_type && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your DISC Type</p>
                <p className="text-2xl font-bold text-primary">{client.disc_type}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>
              This assessment link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">DISC Personality Assessment</h1>
            <p className="text-muted-foreground">
              Hi {client.name}, please complete this assessment to help us understand your communication style.
            </p>
          </div>
          
          <DISCAssessment
            onComplete={handleAssessmentComplete}
          />
        </div>
      </div>
    </div>
  );
}
