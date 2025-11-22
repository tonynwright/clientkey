import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, TrendingUp, Users, BarChart3, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Client {
  id: string;
  name: string;
  tags: string[] | null;
  created_at: string;
}

interface TagStats {
  tag: string;
  count: number;
  percentage: number;
  clients: string[];
  recentAdditions: number; // clients added with this tag in last 30 days
}

export const TagAnalytics = () => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, tags, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No client data available for tag analytics</p>
      </Card>
    );
  }

  // Calculate tag statistics
  const tagMap = new Map<string, { count: number; clients: string[]; recentCount: number }>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  clients.forEach((client) => {
    const clientTags = client.tags || [];
    const isRecent = new Date(client.created_at) >= thirtyDaysAgo;

    clientTags.forEach((tag) => {
      const existing = tagMap.get(tag) || { count: 0, clients: [], recentCount: 0 };
      existing.count++;
      existing.clients.push(client.name);
      if (isRecent) {
        existing.recentCount++;
      }
      tagMap.set(tag, existing);
    });
  });

  const totalTaggedClients = clients.filter((c) => c.tags && c.tags.length > 0).length;
  const totalClients = clients.length;
  const averageTagsPerClient = totalTaggedClients > 0 
    ? (Array.from(tagMap.values()).reduce((sum, stat) => sum + stat.count, 0) / totalTaggedClients).toFixed(1)
    : 0;

  const tagStats: TagStats[] = Array.from(tagMap.entries())
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      percentage: (data.count / totalClients) * 100,
      clients: data.clients,
      recentAdditions: data.recentCount,
    }))
    .sort((a, b) => b.count - a.count);

  const trendingTags = tagStats
    .filter((stat) => stat.recentAdditions > 0)
    .sort((a, b) => b.recentAdditions - a.recentAdditions)
    .slice(0, 5);

  const topTags = tagStats.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tags</p>
              <p className="text-2xl font-bold">{tagStats.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tagged Clients</p>
              <p className="text-2xl font-bold">{totalTaggedClients}</p>
              <p className="text-xs text-muted-foreground">
                {((totalTaggedClients / totalClients) * 100).toFixed(0)}% of total
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Tags/Client</p>
              <p className="text-2xl font-bold">{averageTagsPerClient}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trending Tags</p>
              <p className="text-2xl font-bold">{trendingTags.length}</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Used Tags */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Most Used Tags</h3>
          </div>
          {topTags.length > 0 ? (
            <div className="space-y-4">
              {topTags.map((stat, index) => (
                <div key={stat.tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <Badge variant="secondary" className="font-medium">
                        {stat.tag}
                      </Badge>
                    </div>
                    <div className="text-sm text-right">
                      <span className="font-semibold">{stat.count}</span>
                      <span className="text-muted-foreground ml-1">
                        ({stat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={stat.percentage} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tags in use yet
            </p>
          )}
        </Card>

        {/* Trending Tags */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Trending Tags</h3>
            <span className="text-xs text-muted-foreground">(Last 30 days)</span>
          </div>
          {trendingTags.length > 0 ? (
            <div className="space-y-4">
              {trendingTags.map((stat) => (
                <div key={stat.tag} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-medium">
                      {stat.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {stat.count} total clients
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      +{stat.recentAdditions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No new tags added in the last 30 days
            </p>
          )}
        </Card>
      </div>

      {/* Tag Distribution Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Tag Distribution</h3>
        </div>
        {tagStats.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tagStats.map((stat) => (
              <div
                key={stat.tag}
                className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-medium">
                    {stat.tag}
                  </Badge>
                  <span className="text-sm font-semibold">{stat.count}</span>
                </div>
                <Progress value={stat.percentage} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {stat.percentage.toFixed(1)}% of all clients
                </p>
                {stat.recentAdditions > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.recentAdditions} new (30d)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Start tagging clients to see distribution analytics
          </p>
        )}
      </Card>
    </div>
  );
};
