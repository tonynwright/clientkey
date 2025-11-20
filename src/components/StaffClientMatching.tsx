import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const baseCompatibility = discCompatibilityMatrix[staff.disc_type]?.[client.disc_type] || 
                           { score: 50, strengths: ["Neutral compatibility"], challenges: ["Unknown compatibility pattern"] };
  
  // Calculate score variance bonus/penalty
  const scoreDiff = Math.abs(
    (staff.disc_scores.D + staff.disc_scores.I + staff.disc_scores.S + staff.disc_scores.C) -
    (client.disc_scores.D + client.disc_scores.I + client.disc_scores.S + client.disc_scores.C)
  );
  const varianceAdjustment = Math.max(-10, Math.min(10, (100 - scoreDiff) / 10));
  
  const finalScore = Math.min(100, Math.max(0, baseCompatibility.score + varianceAdjustment));
  
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
  
  return {
    clientId: client.id,
    clientName: client.name,
    staffId: staff.id,
    staffName: staff.name,
    score: Math.round(finalScore),
    strengths: baseCompatibility.strengths,
    challenges: baseCompatibility.challenges,
    recommendation
  };
}

export function StaffClientMatching() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");
      
      if (error) throw error;
      return data.map(client => ({
        ...client,
        disc_scores: client.disc_scores as DISCScores
      })) as Client[];
    },
  });

  const { data: staff, isLoading: loadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .not("disc_type", "is", null)
        .order("name");
      
      if (error) throw error;
      return data.map(member => ({
        ...member,
        disc_scores: member.disc_scores as DISCScores
      })) as Staff[];
    },
  });

  const matches: CompatibilityScore[] = [];
  
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
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!clients?.length || !staff?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {!clients?.length && !staff?.length && "You need to add both clients and staff members with completed DISC assessments to see compatibility matches."}
          {!clients?.length && staff?.length && "You need to add clients with completed DISC assessments to see compatibility matches."}
          {clients?.length && !staff?.length && "You need to add staff members with completed DISC assessments to see compatibility matches."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
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
