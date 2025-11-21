import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  disc_type: string;
}

interface Staff {
  id: string;
  name: string;
  disc_type: string;
}

interface HeatmapProps {
  clients: Client[];
  staff: Staff[];
  compatibilityMatrix: Record<string, Record<string, { score: number }>>;
}

export function CompatibilityHeatmap({ clients, staff, compatibilityMatrix }: HeatmapProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 hover:bg-green-500/30 border-green-500/40";
    if (score >= 70) return "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40";
    if (score >= 60) return "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40";
    return "bg-red-500/20 hover:bg-red-500/30 border-red-500/40";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-700 dark:text-green-400";
    if (score >= 70) return "text-blue-700 dark:text-blue-400";
    if (score >= 60) return "text-yellow-700 dark:text-yellow-400";
    return "text-red-700 dark:text-red-400";
  };

  if (!clients.length || !staff.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compatibility Matrix</CardTitle>
        <CardDescription>
          Quick overview of staff-to-client compatibility scores. Hover over cells for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: `140px repeat(${clients.length}, minmax(80px, 1fr))` }}>
              {/* Header row with client names */}
              <div className="sticky left-0 bg-background z-10" />
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="p-2 text-xs font-semibold text-center bg-muted/50 rounded-t border border-border"
                >
                  <div className="truncate" title={client.name}>
                    {client.name}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {client.disc_type}
                  </Badge>
                </div>
              ))}

              {/* Staff rows */}
              {staff.map((staffMember) => (
                <>
                  {/* Staff name cell (sticky) */}
                  <div 
                    key={`${staffMember.id}-label`}
                    className="sticky left-0 bg-background z-10 p-2 text-xs font-semibold bg-muted/50 rounded-l border border-border flex flex-col justify-center"
                  >
                    <div className="truncate" title={staffMember.name}>
                      {staffMember.name}
                    </div>
                    <Badge variant="outline" className="text-[10px] mt-1 w-fit">
                      {staffMember.disc_type}
                    </Badge>
                  </div>
                  
                  {/* Score cells */}
                  {clients.map((client) => {
                    const compatibility = compatibilityMatrix[staffMember.disc_type]?.[client.disc_type];
                    const score = compatibility?.score || 50;
                    
                    return (
                      <div
                        key={`${staffMember.id}-${client.id}`}
                        className={`p-2 text-center border transition-colors cursor-help ${getScoreColor(score)}`}
                        title={`${staffMember.name} → ${client.name}: ${score}%`}
                      >
                        <div className={`text-sm font-bold ${getScoreTextColor(score)}`}>
                          {score}%
                        </div>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
            <span className="text-muted-foreground">Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/40" />
            <span className="text-muted-foreground">Good (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/40" />
            <span className="text-muted-foreground">Moderate (60-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40" />
            <span className="text-muted-foreground">Challenging (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
