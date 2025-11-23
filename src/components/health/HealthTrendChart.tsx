import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HealthSignal {
  composite_score: number;
  created_at: string;
}

interface HealthTrendChartProps {
  signals: HealthSignal[];
}

export function HealthTrendChart({ signals }: HealthTrendChartProps) {
  // Get last 6 months of data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const chartData = signals
    .filter((signal) => new Date(signal.created_at) >= sixMonthsAgo)
    .reverse()
    .map((signal) => ({
      date: new Date(signal.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: signal.composite_score,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data for the last 6 months
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis 
          domain={[0, 5]} 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
