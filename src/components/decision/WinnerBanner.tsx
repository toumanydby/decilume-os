"use client";

import { getDecisionAnalysis } from "@/lib/decision-analysis";
import { DecisionSession } from "@/types/decision";
import { AlertTriangle, Award, CheckCircle2, Trophy } from "lucide-react";

interface WinnerBannerProps {
  session: DecisionSession;
}

export function WinnerBanner({ session }: WinnerBannerProps) {
  const analysis = getDecisionAnalysis(session);
  if (!session.criteria.length || !session.options.length) return null;

  const { winner, runnerUp } = analysis;
  const status =
    analysis.pendingAssessments > 0
      ? "Draft assessment"
      : !winner
        ? "No eligible option"
        : analysis.isCloseCall
          ? "Close call"
          : "Clear lead";

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-indigo-950/20 p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Decision recommendation
            </h4>
            <p className="text-xs text-muted-foreground">
              Weighted results, gates, and assessment completeness in one view.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${
            status === "Clear lead"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
          }`}
        >
          {status === "Clear lead" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {status}
        </span>
      </div>

      {analysis.pendingAssessments > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          Complete {analysis.pendingAssessments} remaining assessment
          {analysis.pendingAssessments === 1 ? "" : "s"} before the Lab
          recommends an option. Blank cells are not guessed as average scores.
        </div>
      ) : winner ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Award
                className="h-4 w-4"
                style={{ color: winner.option.color || "#6366f1" }}
              />
              {winner.option.name}
            </div>
            <div className="font-mono text-sm font-semibold text-foreground">
              {winner.percentageScore}% fit score
            </div>
          </div>
          {runnerUp && (
            <p className="text-xs text-muted-foreground">
              {analysis.isCloseCall ? "Only" : "Leads"} {runnerUp.option.name}{" "}
              by{" "}
              <span className="font-mono text-foreground">
                {analysis.gapPercentagePoints} percentage points
              </span>
              .
              {analysis.isCloseCall
                ? " Treat this as a trade-off, not a definitive result."
                : ""}
            </p>
          )}
          {analysis.decisiveCriteria.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Lead drivers:{" "}
              {analysis.decisiveCriteria
                .map(({ criterion }) => criterion.name || "Untitled criterion")
                .join(", ")}
              .
            </div>
          )}
          {analysis.sensitivity.length > 0 && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Sensitivity: the lead could reverse with roughly a{" "}
              <span className="font-mono text-foreground">
                {analysis.sensitivity[0].weightChange}
              </span>
              -point {analysis.sensitivity[0].direction} in the weight of{" "}
              <span className="text-foreground">
                {analysis.sensitivity[0].criterion.name}
              </span>
              .
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-200">
          Every completed option fails at least one non-negotiable gate. Adjust
          the gates or add a viable alternative.
        </div>
      )}

      {analysis.rankings.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {analysis.rankings.map((item, index) => (
            <div
              key={item.option.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <span className="font-mono text-muted-foreground">
                  #{index + 1}
                </span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.option.color || "#6366f1" }}
                />{" "}
                <span className="truncate">{item.option.name}</span>
                {item.gateFailures.length > 0 && (
                  <span className="text-rose-400">
                    fails {item.gateFailures.length} gate
                    {item.gateFailures.length === 1 ? "" : "s"}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono font-semibold text-foreground">
                {item.isEligible
                  ? `${item.percentageScore}%`
                  : `${item.completedCriteria}/${session.criteria.length} scored`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
