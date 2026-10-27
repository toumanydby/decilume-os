export interface Criterion {
  id: string;
  name: string;
  weight: number; // 1 to 10
  description?: string;
}

export interface DecisionOption {
  id: string;
  name: string;
  description?: string;
  color?: string;
  scores: Record<string, number>; // criterionId -> score (1 to 10)
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
