"use client";

import { useAppStore } from "@/lib/store";
import { DecisionSession } from "@/types/decision";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OptionScoreSliderProps {
  session: DecisionSession;
}

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export function OptionScoreSlider({ session }: OptionScoreSliderProps) {
  const { addOption, updateOption, setOptionScore, removeOption } = useAppStore();
  const [newOptionName, setNewOptionName] = useState("");

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionName.trim()) return;
    const color = PALETTE[session.options.length % PALETTE.length];
    addOption(session.id, newOptionName.trim(), color);
    setNewOptionName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Options Scoring Matrix</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Rate each competing alternative from 1 (Poor) to 10 (Exceptional).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {session.options.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-border bg-card p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: option.color || "#6366f1" }}
                />
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) =>
                    updateOption(session.id, option.id, { name: e.target.value })
                  }
                  className="font-medium text-xs sm:text-sm text-foreground bg-transparent focus:outline-none"
                />
              </div>

              <button
                onClick={() => removeOption(session.id, option.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-accent transition-colors"
                title="Remove option"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Criteria Sliders for this option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {session.criteria.map((c) => {
                const score = option.scores[c.id] ?? 5;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="truncate flex-1">
                      <span className="text-xs font-medium text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                        (wt: {c.weight})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={score}
                        onChange={(e) =>
                          setOptionScore(
                            session.id,
                            option.id,
                            c.id,
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-20 sm:w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="w-5 text-right font-mono text-xs font-semibold text-foreground">
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <form onSubmit={handleAddOption} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add candidate option (e.g. Solution Delta)..."
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
          />
          <Button type="submit" size="sm" variant="secondary" className="gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

