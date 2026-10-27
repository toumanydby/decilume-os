import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DigestItem } from "@/types/digest";
import { DecisionSession, Criterion, DecisionOption } from "@/types/decision";

export type ActiveTab = "digest" | "decision" | "history" | "settings";

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Digest Engine State
  digests: DigestItem[];
  activeDigestId: string | null;
  addDigest: (digest: DigestItem) => void;
  removeDigest: (id: string) => void;
  setActiveDigestId: (id: string | null) => void;
  clearDigests: () => void;

  // Decision Lab State
  sessions: DecisionSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (title: string, description?: string) => string;
  updateSessionTitle: (id: string, title: string, description?: string) => void;
  removeSession: (id: string) => void;
  
  // Criteria Actions
  addCriterion: (sessionId: string, name: string, weight?: number) => void;
  updateCriterion: (sessionId: string, criterionId: string, updates: Partial<Criterion>) => void;
  removeCriterion: (sessionId: string, criterionId: string) => void;

  // Options Actions
  addOption: (sessionId: string, name: string, color?: string) => void;
  updateOption: (sessionId: string, optionId: string, updates: Partial<DecisionOption>) => void;
  setOptionScore: (sessionId: string, optionId: string, criterionId: string, score: number) => void;
  removeOption: (sessionId: string, optionId: string) => void;

  // Data Management
  exportStateJson: () => string;
  importStateJson: (jsonString: string) => boolean;
}

const defaultCriteria: Criterion[] = [
  { id: "c-1", name: "Impact / ROI", weight: 9, description: "Expected long-term value" },
  { id: "c-2", name: "Execution Speed", weight: 8, description: "Time required to deliver" },
  { id: "c-3", name: "Capital Cost", weight: 6, description: "Budget and infrastructure expenses" },
  { id: "c-4", name: "Risk & Complexity", weight: 7, description: "Technical uncertainty and downside" },
  { id: "c-5", name: "Strategic Alignment", weight: 9, description: "Fit with core objectives" },
];

const defaultOptions: DecisionOption[] = [
  {
    id: "opt-1",
    name: "Option Alpha: In-House Build",
    color: "#6366f1",
    scores: {
      "c-1": 9,
      "c-2": 5,
      "c-3": 4,
      "c-4": 5,
      "c-5": 9,
    },
  },
  {
    id: "opt-2",
    name: "Option Beta: Off-the-Shelf SaaS",
    color: "#10b981",
    scores: {
      "c-1": 7,
      "c-2": 9,
      "c-3": 7,
      "c-4": 8,
      "c-5": 6,
    },
  },
  {
    id: "opt-3",
    name: "Option Gamma: Hybrid Modular",
    color: "#f59e0b",
    scores: {
      "c-1": 8,
      "c-2": 7,
      "c-3": 6,
      "c-4": 7,
      "c-5": 8,
    },
  },
];

const initialSession: DecisionSession = {
  id: "session-default",
  title: "Architecture Strategy Evaluation",
  description: "Comparing In-House, SaaS, and Hybrid architectures across strategic criteria.",
  criteria: defaultCriteria,
  options: defaultOptions,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: "digest",
      setActiveTab: (tab) => set({ activeTab: tab }),

      digests: [],
      activeDigestId: null,
      addDigest: (digest) =>
        set((state) => ({
          digests: [digest, ...state.digests],
          activeDigestId: digest.id,
        })),
      removeDigest: (id) =>
        set((state) => ({
          digests: state.digests.filter((d) => d.id !== id),
          activeDigestId: state.activeDigestId === id ? null : state.activeDigestId,
        })),
      setActiveDigestId: (id) => set({ activeDigestId: id }),
      clearDigests: () => set({ digests: [], activeDigestId: null }),

      sessions: [initialSession],
      activeSessionId: "session-default",
      setActiveSessionId: (id) => set({ activeSessionId: id }),

      createSession: (title, description) => {
        const id = `session-${Date.now()}`;
        const newSession: DecisionSession = {
          id,
          title,
          description,
          criteria: [...defaultCriteria],
          options: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      updateSessionTitle: (id, title, description) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, title, description, updatedAt: new Date().toISOString() } : s
          ),
        })),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activeSessionId: state.activeSessionId === id ? (state.sessions[0]?.id ?? null) : state.activeSessionId,
        })),

      addCriterion: (sessionId, name, weight = 5) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const newCriterion: Criterion = {
              id: `c-${Date.now()}`,
              name,
              weight,
            };
            return {
              ...s,
              criteria: [...s.criteria, newCriterion],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updateCriterion: (sessionId, criterionId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              criteria: s.criteria.map((c) => (c.id === criterionId ? { ...c, ...updates } : c)),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      removeCriterion: (sessionId, criterionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              criteria: s.criteria.filter((c) => c.id !== criterionId),
              options: s.options.map((opt) => {
                const newScores = { ...opt.scores };
                delete newScores[criterionId];
                return { ...opt, scores: newScores };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      addOption: (sessionId, name, color = "#6366f1") =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const defaultScores: Record<string, number> = {};
            s.criteria.forEach((c) => {
              defaultScores[c.id] = 5;
            });
            const newOption: DecisionOption = {
              id: `opt-${Date.now()}`,
              name,
              color,
              scores: defaultScores,
            };
            return {
              ...s,
              options: [...s.options, newOption],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updateOption: (sessionId, optionId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              options: s.options.map((opt) => (opt.id === optionId ? { ...opt, ...updates } : opt)),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      setOptionScore: (sessionId, optionId, criterionId, score) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              options: s.options.map((opt) => {
                if (opt.id !== optionId) return opt;
                return {
                  ...opt,
                  scores: {
                    ...opt.scores,
                    [criterionId]: Math.max(1, Math.min(10, score)),
                  },
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      removeOption: (sessionId, optionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              options: s.options.filter((opt) => opt.id !== optionId),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      exportStateJson: () => {
        const { digests, sessions } = get();
        return JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), digests, sessions }, null, 2);
      },

      importStateJson: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && Array.isArray(parsed.sessions)) {
            set({
              sessions: parsed.sessions,
              activeSessionId: parsed.sessions[0]?.id ?? null,
              digests: Array.isArray(parsed.digests) ? parsed.digests : [],
            });
            return true;
          }
          return false;
        } catch (err) {
          console.error("Failed to import state JSON:", err);
          return false;
        }
      },
    }),
    {
      name: "decilume-os-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
