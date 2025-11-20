import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ClientInsightsProps {
  clientId: string;
  clientName: string;
  discType: string;
  discScores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

export const ClientInsights = ({ clientId, clientName, discType, discScores }: ClientInsightsProps) => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing insights
  const { data: savedInsights, isLoading } = useQuery({
    queryKey: ['disc-insights', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disc_insights')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Generate new insights
  const generateInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-disc-insights', {
        body: {
          clientId,
          clientName,
          discType,
          scores: discScores,
          saveToDatabase: true,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disc-insights', clientId] });
      toast.success("Insights generated successfully!");
    },
    onError: (error: any) => {
      console.error('Error generating insights:', error);
      if (error.message?.includes('429')) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes('402')) {
        toast.error("AI usage limit reached. Please add credits to continue.");
      } else {
        toast.error("Failed to generate insights. Please try again.");
      }
    },
  });

  // Delete insights
  const deleteInsights = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('disc_insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disc-insights', clientId] });
      toast.success("Insights deleted");
    },
    onError: () => {
      toast.error("Failed to delete insights");
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateInsights.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  const latestInsight = savedInsights?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
          <p className="text-sm text-muted-foreground">
            Personalized analysis based on DISC profile
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {latestInsight ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {latestInsight ? 'Regenerate' : 'Generate'} Insights
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : latestInsight ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Personality Insights
                </CardTitle>
                <CardDescription>
                  Generated {new Date(latestInsight.created_at).toLocaleDateString()} at{' '}
                  {new Date(latestInsight.created_at).toLocaleTimeString()}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteInsights.mutate(latestInsight.id)}
                disabled={deleteInsights.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{latestInsight.insights}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No insights generated yet for this client.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Generate Insights" to create a personalized analysis based on their DISC profile.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {savedInsights && savedInsights.length > 1 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Previous Insights</h4>
          <div className="space-y-2">
            {savedInsights.slice(1).map((insight) => (
              <Card key={insight.id} className="bg-muted/50">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>
                      Generated {new Date(insight.created_at).toLocaleDateString()} at{' '}
                      {new Date(insight.created_at).toLocaleTimeString()}
                    </CardDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInsights.mutate(insight.id)}
                      disabled={deleteInsights.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
