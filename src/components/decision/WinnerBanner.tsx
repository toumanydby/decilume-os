"use client";

import { DecisionSession, OptionVectorScore } from "@/types/decision";
import { Trophy, Award, TrendingUp } from "lucide-react";

interface WinnerBannerProps {
  session: DecisionSession;
}

export function WinnerBanner({ session }: WinnerBannerProps) {
  // Compute total weights
  const totalWeight = session.criteria.reduce((sum, c) => sum + c.weight, 0);
  const maxPossible = totalWeight * 10;

  if (totalWeight === 0 || session.options.length === 0) {
    return null;
  }

  // Calculate vector score for each option
  const scores: OptionVectorScore[] = session.options.map((opt) => {
    let totalScore = 0;
    session.criteria.forEach((c) => {
      const s = opt.scores[c.id] ?? 5;
      totalScore += s * c.weight;
    });

    const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

    return {
      optionId: opt.id,
      name: opt.name,
      totalWeightedScore: totalScore,
      maxPossibleScore: maxPossible,
      percentageScore: Math.round(percentage * 10) / 10,
      color: opt.color || "#6366f1",
      isWinner: false,
    };
  });

  scores.sort((a, b) => b.percentageScore - a.percentageScore);

  if (scores.length > 0 && scores[0].percentageScore > 0) {
    scores[0].isWinner = true;
  }

  const winner = scores[0];

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-indigo-950/20 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Quantitative Vector Recommendation</h4>
            <p className="text-xs text-muted-foreground">
              Synthesized from {session.criteria.length} weighted criteria dimensions
            </p>
          </div>
        </div>

        {winner && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Optimal: {winner.name}</span>
          </div>
        )}
      </div>

      {/* Ranking Breakdown Bars */}
      <div className="space-y-3 pt-2">
        {scores.map((item, idx) => (
          <div key={item.optionId} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span className="font-mono text-muted-foreground">#{idx + 1}</span>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {item.percentageScore}% ({item.totalWeightedScore} pts)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentageScore}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

