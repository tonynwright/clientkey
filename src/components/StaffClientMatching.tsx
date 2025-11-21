import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, AlertCircle, CheckCircle2, Bug, Copy, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CompatibilityHeatmap } from "./CompatibilityHeatmap";
import type { Database } from "@/integrations/supabase/types";

type DISCScores = { D: number; I: number; S: number; C: number };

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  disc_type: string;
  disc_scores: DISCScores;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  disc_type: string;
  disc_scores: DISCScores;
}

interface CompatibilityScore {
  clientId: string;
  clientName: string;
  staffId: string;
  staffName: string;
  score: number;
  strengths: string[];
  challenges: string[];
  recommendation: string;
}

const discCompatibilityMatrix: Record<string, Record<string, { score: number; strengths: string[]; challenges: string[] }>> = {
  D: {
    D: { 
      score: 70, 
      strengths: ["Direct communication", "Fast decision-making", "Goal-oriented"],
      challenges: ["May clash over control", "Competition for dominance"]
    },
    I: { 
      score: 75, 
      strengths: ["Complementary energy", "D drives, I persuades", "Dynamic partnership"],
      challenges: ["D may find I too social", "Pace differences"]
    },
    S: { 
      score: 60, 
      strengths: ["S provides stability", "Balanced approach"],
      challenges: ["Pace mismatch", "D may seem too pushy"]
    },
    C: { 
      score: 65, 
      strengths: ["C provides data, D decides", "Complementary skills"],
      challenges: ["C needs more time", "Different communication styles"]
    }
  },
  I: {
    D: { 
      score: 75, 
      strengths: ["I energizes, D executes", "Complementary strengths"],
      challenges: ["D may rush I", "Focus vs. socializing"]
    },
    I: { 
      score: 85, 
      strengths: ["Natural rapport", "High energy collaboration", "Creative synergy"],
      challenges: ["May lack follow-through", "Too much socializing"]
    },
    S: { 
      score: 80, 
      strengths: ["S provides grounding", "I brings enthusiasm", "Harmonious relationship"],
      challenges: ["Pace differences", "I may overwhelm S"]
    },
    C: { 
      score: 55, 
      strengths: ["Balancing emotion and logic", "Diverse perspectives"],
      challenges: ["Very different styles", "Communication gaps"]
    }
  },
  S: {
    D: { 
      score: 60, 
      strengths: ["S supports D's vision", "Stability meets drive"],
      challenges: ["D may push too hard", "S needs more time"]
    },
    I: { 
      score: 80, 
      strengths: ["Warm collaboration", "S grounds I", "Mutual support"],
      challenges: ["I may be too fast-paced", "Different priorities"]
    },
    S: { 
      score: 90, 
      strengths: ["Exceptional harmony", "Deep trust", "Stable partnership"],
      challenges: ["May avoid conflict", "Slow decision-making"]
    },
    C: { 
      score: 85, 
      strengths: ["Methodical collaboration", "Quality focus", "Patient partnership"],
      challenges: ["May be too cautious", "Resistance to change"]
    }
  },
  C: {
    D: { 
      score: 65, 
      strengths: ["C provides analysis", "Quality and speed balance"],
      challenges: ["D rushes C", "Different priorities"]
    },
    I: { 
      score: 55, 
      strengths: ["Complementary perspectives", "Creativity meets precision"],
      challenges: ["Very different styles", "I too spontaneous for C"]
    },
    S: { 
      score: 85, 
      strengths: ["Patient collaboration", "Thorough approach", "Shared values"],
      challenges: ["May lack urgency", "Perfectionism"]
    },
    C: { 
      score: 80, 
      strengths: ["Analytical excellence", "High quality standards", "Detail-oriented"],
      challenges: ["Analysis paralysis", "May miss big picture"]
    }
  }
};

function calculateCompatibility(client: Client, staff: Staff): CompatibilityScore {
  console.log(`[MATCHING] Calculating compatibility for ${staff.name} → ${client.name}`);
  console.log(`[MATCHING] Staff DISC: ${staff.disc_type}`, staff.disc_scores);
  console.log(`[MATCHING] Client DISC: ${client.disc_type}`, client.disc_scores);
  
  const baseCompatibility = discCompatibilityMatrix[staff.disc_type]?.[client.disc_type] || 
                           { score: 50, strengths: ["Neutral compatibility"], challenges: ["Unknown compatibility pattern"] };
  
  console.log(`[MATCHING] Base compatibility score: ${baseCompatibility.score}`);
  
  // Calculate score variance bonus/penalty
  const staffTotal = staff.disc_scores.D + staff.disc_scores.I + staff.disc_scores.S + staff.disc_scores.C;
  const clientTotal = client.disc_scores.D + client.disc_scores.I + client.disc_scores.S + client.disc_scores.C;
  const scoreDiff = Math.abs(staffTotal - clientTotal);
  const varianceAdjustment = Math.max(-10, Math.min(10, (100 - scoreDiff) / 10));
  
  console.log(`[MATCHING] Staff total: ${staffTotal}, Client total: ${clientTotal}`);
  console.log(`[MATCHING] Score difference: ${scoreDiff}, Variance adjustment: ${varianceAdjustment}`);
  
  const finalScore = Math.min(100, Math.max(0, baseCompatibility.score + varianceAdjustment));
  console.log(`[MATCHING] Final score: ${finalScore}`);
  
  let recommendation = "";
  if (finalScore >= 80) {
    recommendation = "Excellent match - highly compatible working styles";
  } else if (finalScore >= 70) {
    recommendation = "Good match - complementary strengths outweigh challenges";
  } else if (finalScore >= 60) {
    recommendation = "Moderate match - requires conscious effort and communication";
  } else {
    recommendation = "Challenging match - significant differences to manage";
  }
  
  const result = {
    clientId: client.id,
    clientName: client.name,
    staffId: staff.id,
    staffName: staff.name,
    score: Math.round(finalScore),
    strengths: baseCompatibility.strengths,
    challenges: baseCompatibility.challenges,
    recommendation
  };
  
  console.log(`[MATCHING] Result:`, result);
  return result;
}

export function StaffClientMatching() {
  const { subscription, isAdmin } = useAuth();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const copyLogsToClipboard = async () => {
    try {
      const logsText = debugLogs.join('\n');
      await navigator.clipboard.writeText(logsText);
      toast({ title: "Debug logs copied to clipboard" });
    } catch (error) {
      toast({ title: "Failed to copy logs", variant: "destructive" });
    }
  };
  
  const exportDebugReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemState: {
        clientsLoaded: clients?.length || 0,
        staffLoaded: staff?.length || 0,
        matchesGenerated: matches.length,
        selectedClient: selectedClient || "All",
        loadingClients,
        loadingStaff,
        hasClientsError: !!clientsError,
        hasStaffError: !!staffError,
      },
      clients: clients?.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        disc_type: c.disc_type,
        disc_scores: c.disc_scores,
      })),
      staff: staff?.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        disc_type: s.disc_type,
        disc_scores: s.disc_scores,
      })),
      matches: matches.map(m => ({
        clientName: m.clientName,
        staffName: m.staffName,
        score: m.score,
        recommendation: m.recommendation,
      })),
      debugLogs,
      errors: {
        clientsError: clientsError ? (clientsError as Error).message : null,
        staffError: staffError ? (staffError as Error).message : null,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-report-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Debug report exported successfully" });
  };
  
  useEffect(() => {
    addDebugLog("[INIT] StaffClientMatching component mounted");
  }, []);
  
  const { data: clients, isLoading: loadingClients, error: clientsError } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      addDebugLog("[FETCH] Starting clients query...");
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");
      
      if (error) {
        addDebugLog(`[ERROR] Clients query failed: ${error.message}`);
        throw error;
      }
      
      const clients = data.map(client => ({
        ...client,
        disc_scores: client.disc_scores as DISCScores
      })) as Client[];
      
      addDebugLog(`[SUCCESS] Loaded ${clients.length} clients with DISC profiles`);
      clients.forEach(c => {
        addDebugLog(`  - ${c.name} (${c.disc_type}): D=${c.disc_scores.D} I=${c.disc_scores.I} S=${c.disc_scores.S} C=${c.disc_scores.C}`);
      });
      
      return clients;
    },
  });

  const { data: staff, isLoading: loadingStaff, error: staffError } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      addDebugLog("[FETCH] Starting staff query...");
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");
      
      if (error) {
        addDebugLog(`[ERROR] Staff query failed: ${error.message}`);
        throw error;
      }
      
      const staff = data.map(member => ({
        ...member,
        disc_scores: member.disc_scores as DISCScores
      })) as Staff[];
      
      addDebugLog(`[SUCCESS] Loaded ${staff.length} staff with DISC profiles`);
      staff.forEach(s => {
        addDebugLog(`  - ${s.name} (${s.disc_type}): D=${s.disc_scores.D} I=${s.disc_scores.I} S=${s.disc_scores.S} C=${s.disc_scores.C}`);
      });
      
      return staff;
    },
  });

  const matches: CompatibilityScore[] = [];
  
  useEffect(() => {
    if (clients && staff) {
      addDebugLog(`[CALCULATE] Starting compatibility calculations with ${clients.length} clients and ${staff.length} staff`);
      addDebugLog(`[CALCULATE] Selected client filter: ${selectedClient || "All clients"}`);
    }
  }, [clients, staff, selectedClient]);
  
  if (clients && staff) {
    const targetClients = selectedClient 
      ? clients.filter(c => c.id === selectedClient)
      : clients;
    
    targetClients.forEach(client => {
      staff.forEach(staffMember => {
        matches.push(calculateCompatibility(client, staffMember));
      });
    });
    
    matches.sort((a, b) => b.score - a.score);
    console.log(`[MATCHING] Generated ${matches.length} compatibility matches, sorted by score`);
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <TrendingUp className="h-5 w-5 text-blue-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  if (loadingClients || loadingStaff) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loading {loadingClients ? "clients" : ""} {loadingClients && loadingStaff ? "and " : ""} {loadingStaff ? "staff" : ""}...
          </AlertDescription>
        </Alert>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (clientsError || staffError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">Error loading data:</p>
            {clientsError && <p>Clients: {(clientsError as Error).message}</p>}
            {staffError && <p>Staff: {(staffError as Error).message}</p>}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!clients?.length || !staff?.length) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!clients?.length && !staff?.length && "You need to add both clients and staff members with completed DISC assessments to see compatibility matches."}
            {!clients?.length && staff?.length && "You need to add clients with completed DISC assessments to see compatibility matches."}
            {clients?.length && !staff?.length && "You need to add staff members with completed DISC assessments to see compatibility matches."}
          </AlertDescription>
        </Alert>
        
        <Collapsible open={showDebug} onOpenChange={setShowDebug}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Bug className="h-4 w-4 mr-2" />
              {showDebug ? "Hide" : "Show"} Debug Info
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardHeader>
                <CardTitle className="text-sm">Debug Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono space-y-1 max-h-60 overflow-y-auto">
                  {debugLogs.map((log, i) => (
                    <div key={i} className="text-muted-foreground">{log}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clients && staff && clients.length > 0 && staff.length > 0 && (
        <CompatibilityHeatmap 
          clients={clients}
          staff={staff}
          compatibilityMatrix={discCompatibilityMatrix}
        />
      )}
      
      <Collapsible open={showDebug} onOpenChange={setShowDebug}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <Bug className="h-4 w-4 mr-2" />
            {showDebug ? "Hide" : "Show"} Debug Panel
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Debug Information</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyLogsToClipboard}
                    disabled={debugLogs.length === 0}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Logs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportDebugReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Subscription Status:</h4>
                <div className="text-xs space-y-1 bg-muted/50 p-3 rounded">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <Badge variant={subscription?.pricing_tier === 'free' ? 'secondary' : 'default'} className="text-xs">
                      {subscription?.pricing_tier === 'free' ? 'Free' : 
                       subscription?.pricing_tier === 'early_bird' ? 'Early Bird ($19/mo)' : 
                       subscription?.pricing_tier === 'pro' ? 'Pro ($49/mo)' : 
                       'Unknown'}
                    </Badge>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Client Limit:</span>
                    <span className="font-mono">{isAdmin ? '∞' : subscription?.pricing_tier === 'free' ? '3' : '300'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Pro Features:</span>
                    <Badge variant={subscription?.pricing_tier === 'free' && !isAdmin ? 'destructive' : 'default'} className="text-xs">
                      {subscription?.pricing_tier === 'free' && !isAdmin ? 'Locked' : 'Accessible'}
                    </Badge>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Admin:</span>
                    <span className="font-mono">{isAdmin ? 'Yes' : 'No'}</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Current State:</h4>
                <div className="text-xs space-y-1">
                  <p>Clients loaded: {clients?.length || 0}</p>
                  <p>Staff loaded: {staff?.length || 0}</p>
                  <p>Matches generated: {matches.length}</p>
                  <p>Selected client: {selectedClient || "All"}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Debug Logs:</h4>
                <div className="text-xs font-mono space-y-1 max-h-60 overflow-y-auto bg-muted p-2 rounded">
                  {debugLogs.length === 0 ? (
                    <p className="text-muted-foreground">No logs yet...</p>
                  ) : (
                    debugLogs.map((log, i) => (
                      <div key={i} className="text-muted-foreground">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff-Client Compatibility</h2>
          <p className="text-muted-foreground">
            Find the best staff member matches for your clients based on DISC profiles
          </p>
        </div>
        <Badge variant="secondary" className="text-lg">
          <Users className="h-4 w-4 mr-2" />
          {matches.length} Matches
        </Badge>
      </div>

      {clients && clients.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedClient ? "default" : "outline"}
            onClick={() => setSelectedClient(null)}
            size="sm"
          >
            All Clients
          </Button>
          {clients.map(client => (
            <Button
              key={client.id}
              variant={selectedClient === client.id ? "default" : "outline"}
              onClick={() => setSelectedClient(client.id)}
              size="sm"
            >
              {client.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {matches.map((match, index) => (
          <Card key={`${match.clientId}-${match.staffId}`} className={getScoreColor(match.score)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getScoreIcon(match.score)}
                    {match.staffName} → {match.clientName}
                  </CardTitle>
                  <CardDescription>
                    Compatibility Score: <strong>{match.score}%</strong>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-base">
                  #{index + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium">{match.recommendation}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="text-sm space-y-1">
                    {match.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Considerations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {match.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
