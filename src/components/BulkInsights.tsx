import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Zap, CheckCircle2, Target } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";

export const BulkInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const { subscription, isAdmin } = useAuth();
  const isPaidUser = subscription?.pricing_tier !== 'free' || isAdmin;

  const generateBulkInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-bulk-insights', {
        body: {
          analyzeAll: true,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success("Client base analysis complete!");
    },
    onError: (error: any) => {
      console.error('Error generating bulk insights:', error);
      if (error.message?.includes('429')) {
        toast.error("Rate limit exceeded. Please try again in a few moments.");
      } else if (error.message?.includes('402')) {
        toast.error("AI usage limit reached. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate insights. Please try again.");
      }
    },
  });

  if (!isPaidUser) {
    return (
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Bulk Insights is a Pro Feature</h3>
              <p className="text-muted-foreground mb-6">
                Analyze your entire client base at once and discover patterns, trends, and strategic opportunities.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">With Pro, you get:</h4>
                <ul className="text-sm space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Analyze all clients simultaneously
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Identify personality distribution patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Team dynamics and collaboration insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Strategic growth recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Portfolio optimization strategies
                  </li>
                </ul>
              </div>
              <Button size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Client Base Analysis
              </CardTitle>
              <CardDescription>
                AI-powered insights across your entire client portfolio
              </CardDescription>
            </div>
            <Button
              onClick={() => generateBulkInsights.mutate()}
              disabled={generateBulkInsights.isPending}
            >
              {generateBulkInsights.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Client Base
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {insights && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Base Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {insights.statistics.totalClients}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">
                    {insights.statistics.discTypeCounts.D}
                  </div>
                  <div className="text-sm text-muted-foreground">Dominance (D)</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {Math.round(insights.statistics.discTypeCounts.D / insights.statistics.totalClients * 100)}%
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {insights.statistics.discTypeCounts.I}
                  </div>
                  <div className="text-sm text-muted-foreground">Influence (I)</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {Math.round(insights.statistics.discTypeCounts.I / insights.statistics.totalClients * 100)}%
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {insights.statistics.discTypeCounts.S}
                  </div>
                  <div className="text-sm text-muted-foreground">Steadiness (S)</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {Math.round(insights.statistics.discTypeCounts.S / insights.statistics.totalClients * 100)}%
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">
                    {insights.statistics.discTypeCounts.C}
                  </div>
                  <div className="text-sm text-muted-foreground">Conscientiousness (C)</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {Math.round(insights.statistics.discTypeCounts.C / insights.statistics.totalClients * 100)}%
                  </Badge>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Average Scores Across All Clients</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Dominance</div>
                    <div className="text-2xl font-bold text-red-500">{insights.statistics.avgScores.D}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Influence</div>
                    <div className="text-2xl font-bold text-yellow-500">{insights.statistics.avgScores.I}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Steadiness</div>
                    <div className="text-2xl font-bold text-green-500">{insights.statistics.avgScores.S}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Conscientiousness</div>
                    <div className="text-2xl font-bold text-blue-500">{insights.statistics.avgScores.C}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Strategic Insights & Patterns
              </CardTitle>
              <CardDescription>
                AI analysis of your client portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{insights.insights}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analyzed Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.clients.map((client: any) => (
                  <Badge key={client.id} variant="outline" className="gap-2">
                    {client.name}
                    <span className="text-xs text-muted-foreground">({client.discType})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!insights && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Click "Analyze Client Base" to generate comprehensive insights about your entire client portfolio, 
                identify patterns, and discover strategic opportunities for growth.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
                <h4 className="font-semibold mb-2">What you'll discover:</h4>
                <ul className="text-sm text-left space-y-1">
                  <li>• Client personality distribution and patterns</li>
                  <li>• Communication strategy recommendations</li>
                  <li>• Team dynamics and collaboration insights</li>
                  <li>• Portfolio balance and growth opportunities</li>
                  <li>• Actionable strategies to optimize client relationships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
