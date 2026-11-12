"use client";

import { useAppStore } from "@/lib/store";
import { DecisionSession } from "@/types/decision";
import { Plus, Trash2, Sliders } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CriteriaEditorProps {
  session: DecisionSession;
}

export function CriteriaEditor({ session }: CriteriaEditorProps) {
  const { addCriterion, updateCriterion, removeCriterion } = useAppStore();
  const [newCriterionName, setNewCriterionName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionName.trim()) return;
    addCriterion(session.id, newCriterionName.trim(), 5);
    setNewCriterionName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Decision Criteria & Weights</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Set importance, direction, and any non-negotiable threshold.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {session.criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="space-y-3 p-3 rounded-lg border border-border bg-card/60"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) =>
                    updateCriterion(session.id, criterion.id, {
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-transparent font-medium text-xs text-foreground focus:outline-none"
                />
                {criterion.description && (
                  <p className="text-[11px] text-muted-foreground">
                    {criterion.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={criterion.weight}
                    onChange={(e) =>
                      updateCriterion(session.id, criterion.id, {
                        weight: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="w-6 text-right font-mono text-xs font-semibold text-indigo-400">
                    {criterion.weight}x
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeCriterion(session.id, criterion.id)}
                  className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-accent transition-colors"
                  title="Remove criterion"
                  aria-label={`Remove ${criterion.name || "criterion"}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="text-[10px] text-muted-foreground">
                Scoring direction
                <select
                  value={criterion.direction ?? "maximize"}
                  onChange={(e) =>
                    updateCriterion(session.id, criterion.id, {
                      direction: e.target.value as "maximize" | "minimize",
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="maximize">Higher is better</option>
                  <option value="minimize">Lower is better</option>
                </select>
              </label>
              <label className="text-[10px] text-muted-foreground">
                {criterion.direction === "minimize"
                  ? "Maximum allowed (optional)"
                  : "Minimum required (optional)"}
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={criterion.gate ?? ""}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    updateCriterion(session.id, criterion.id, {
                      gate:
                        rawValue === ""
                          ? undefined
                          : Math.max(1, Math.min(10, Number(rawValue))),
                    });
                  }}
                  placeholder="No gate"
                  className="mt-1 block w-full rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        ))}

        <form onSubmit={handleAdd} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add new criterion (e.g. Scalability, Latency)..."
            value={newCriterionName}
            onChange={(e) => setNewCriterionName(e.target.value)}
            className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
          />
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
