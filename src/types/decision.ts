export interface Criterion {
  id: string;
  name: string;
  weight: number; // 1 to 10
  description?: string;
  /** Whether a larger raw value is desirable, or should be inverted for ranking. */
  direction?: "maximize" | "minimize";
  /** A non-negotiable threshold. Minimize criteria must be at or below it. */
  gate?: number;
}

export interface ScoreEvidence {
  note?: string;
  confidence?: "low" | "medium" | "high";
}

export interface DecisionOption {
  id: string;
  name: string;
  description?: string;
  color?: string;
  /** criterionId -> raw score (1 to 10); null means the assessment is incomplete. */
  scores: Record<string, number | null>;
  scoreEvidence?: Record<string, ScoreEvidence>;
}

export interface DecisionSession {
  id: string;
  title: string;
  description?: string;
  criteria: Criterion[];
  options: DecisionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface OptionVectorScore {
  optionId: string;
  name: string;
  totalWeightedScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  color: string;
  isWinner: boolean;
}
