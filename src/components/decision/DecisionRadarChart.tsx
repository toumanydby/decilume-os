"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { DecisionSession } from "@/types/decision";

interface DecisionRadarChartProps {
  session: DecisionSession;
}

export function DecisionRadarChart({ session }: DecisionRadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-card/40 rounded-xl border border-border">
        <span className="text-xs text-muted-foreground animate-pulse">Initializing Visualization...</span>
      </div>
    );
  }

  // Format data for Recharts:
  // [{ criterion: "Impact", "Option Alpha": 9, "Option Beta": 7 }, ...]
  const chartData = session.criteria.map((c) => {
    const entry: Record<string, any> = {
      criterion: c.name,
      fullMark: 10,
    };
    session.options.forEach((opt) => {
      entry[opt.name] = opt.scores[c.id] ?? 5;
    });
    return entry;
  });

  if (session.criteria.length < 3) {
    return (
      <div className="h-80 w-full flex flex-col items-center justify-center bg-card/40 rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-xs text-muted-foreground">
          At least 3 criteria are required to render the multi-dimensional radar polygon.
        </p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-semibold text-foreground">Multi-Dimensional Trade-Offs</span>
        <span className="text-[10px] font-mono text-muted-foreground">Normalized Scale (1 - 10)</span>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="var(--border)" strokeOpacity={0.7} />
            <PolarAngleAxis
              dataKey="criterion"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
              axisLine={false}
            />
            {session.options.map((opt) => (
              <Radar
                key={opt.id}
                name={opt.name}
                dataKey={opt.name}
                stroke={opt.color || "#6366f1"}
                fill={opt.color || "#6366f1"}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "8px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

