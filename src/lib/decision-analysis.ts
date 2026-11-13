import { Criterion, DecisionOption, DecisionSession } from "@/types/decision";

export type GateFailure = { criterion: Criterion; score: number };

export type AnalyzedOption = {
  option: DecisionOption;
  totalWeightedScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  completedCriteria: number;
  gateFailures: GateFailure[];
  isEligible: boolean;
};

export type DecisionAnalysis = {
  rankings: AnalyzedOption[];
  pendingAssessments: number;
  totalAssessments: number;
  winner: AnalyzedOption | null;
  runnerUp: AnalyzedOption | null;
  gapPercentagePoints: number | null;
  isCloseCall: boolean;
  decisiveCriteria: Array<{
    criterion: Criterion;
    contributionDifference: number;
  }>;
  sensitivity: Array<{
    criterion: Criterion;
    weightChange: number;
    direction: "increase" | "decrease";
  }>;
};

const directionOf = (criterion: Criterion) => criterion.direction ?? "maximize";

export function effectiveScore(score: number, criterion: Criterion) {
  return directionOf(criterion) === "minimize" ? 11 - score : score;
}

export function getDecisionAnalysis(
  session: DecisionSession,
): DecisionAnalysis {
  const totalWeight = session.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0,
  );
  const maxPossibleScore = totalWeight * 10;
  const totalAssessments = session.criteria.length * session.options.length;
  let pendingAssessments = 0;

  const rankings = session.options.map((option) => {
    let totalWeightedScore = 0;
    let completedCriteria = 0;
    const gateFailures: GateFailure[] = [];

    for (const criterion of session.criteria) {
      const score = option.scores[criterion.id];
      if (typeof score !== "number") {
        pendingAssessments += 1;
        continue;
      }
      completedCriteria += 1;
      totalWeightedScore += effectiveScore(score, criterion) * criterion.weight;
      if (
        typeof criterion.gate === "number" &&
        (directionOf(criterion) === "maximize"
          ? score < criterion.gate
          : score > criterion.gate)
      ) {
        gateFailures.push({ criterion, score });
      }
    }

    return {
      option,
      totalWeightedScore,
      maxPossibleScore,
      percentageScore:
        maxPossibleScore > 0 && completedCriteria === session.criteria.length
          ? Math.round((totalWeightedScore / maxPossibleScore) * 1000) / 10
          : 0,
      completedCriteria,
      gateFailures,
      isEligible:
        completedCriteria === session.criteria.length &&
        gateFailures.length === 0,
    };
  });

  rankings.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    return b.percentageScore - a.percentageScore;
  });

  const eligible = rankings.filter((option) => option.isEligible);
  const winner = eligible[0] ?? null;
  const runnerUp = eligible[1] ?? null;
  const gapPercentagePoints =
    winner && runnerUp
      ? winner.percentageScore - runnerUp.percentageScore
      : null;
  const scoreGap =
    winner && runnerUp
      ? winner.totalWeightedScore - runnerUp.totalWeightedScore
      : 0;
  const comparativeCriteria =
    winner && runnerUp
      ? session.criteria.map((criterion) => ({
          criterion,
          contributionDifference:
            (effectiveScore(winner.option.scores[criterion.id]!, criterion) -
              effectiveScore(
                runnerUp.option.scores[criterion.id]!,
                criterion,
              )) *
            criterion.weight,
        }))
      : [];

  const sensitivity = comparativeCriteria
    .filter(
      ({ contributionDifference, criterion }) =>
        contributionDifference !== 0 && scoreGap > 0,
    )
    .map(({ criterion, contributionDifference }) => ({
      criterion,
      weightChange:
        Math.round(
          (scoreGap / Math.abs(contributionDifference / criterion.weight)) * 10,
        ) / 10,
      direction:
        contributionDifference < 0
          ? ("increase" as const)
          : ("decrease" as const),
    }))
    .sort((a, b) => a.weightChange - b.weightChange)
    .slice(0, 2);

  return {
    rankings,
    pendingAssessments,
    totalAssessments,
    winner,
    runnerUp,
    gapPercentagePoints,
    isCloseCall: gapPercentagePoints !== null && gapPercentagePoints <= 2,
    decisiveCriteria: comparativeCriteria
      .filter((item) => item.contributionDifference > 0)
      .sort((a, b) => b.contributionDifference - a.contributionDifference)
      .slice(0, 3),
    sensitivity,
  };
}
