"use client";

import { useAppStore } from "@/lib/store";
import { DecisionSession } from "@/types/decision";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface OptionScoreSliderProps {
  session: DecisionSession;
}

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

export function OptionScoreSlider({ session }: OptionScoreSliderProps) {
  const {
    addOption,
    updateOption,
    setOptionScore,
    setOptionScoreEvidence,
    removeOption,
  } = useAppStore();
  const [newOptionName, setNewOptionName] = useState("");
  const [selectedCell, setSelectedCell] = useState<{
    optionId: string;
    criterionId: string;
  } | null>(null);
  const selected = useMemo(() => {
    if (!selectedCell) return null;
    const option = session.options.find(
      (item) => item.id === selectedCell.optionId,
    );
    const criterion = session.criteria.find(
      (item) => item.id === selectedCell.criterionId,
    );
    return option && criterion ? { option, criterion } : null;
  }, [selectedCell, session.criteria, session.options]);

  useEffect(() => {
    if (!selected && session.options[0] && session.criteria[0]) {
      setSelectedCell({
        optionId: session.options[0].id,
        criterionId: session.criteria[0].id,
      });
    }
  }, [selected, session.options, session.criteria]);

  const handleAddOption = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newOptionName.trim();
    if (
      !name ||
      session.options.some(
        (option) => option.name.trim().toLowerCase() === name.toLowerCase(),
      )
    )
      return;
    addOption(
      session.id,
      name,
      PALETTE[session.options.length % PALETTE.length],
    );
    setNewOptionName("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Options Scoring Matrix</span>
        </h4>
        <p className="text-xs text-muted-foreground">
          Score raw performance from 1 to 10. Blank cells stay excluded until
          assessed.
        </p>
      </div>

      {session.options.length > 0 && session.criteria.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="min-w-44 px-3 py-3 font-medium text-muted-foreground">
                  Criterion
                </th>
                {session.options.map((option) => (
                  <th
                    key={option.id}
                    className="min-w-36 px-3 py-2 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: option.color || "#6366f1" }}
                      />
                      <input
                        aria-label="Option name"
                        value={option.name}
                        onChange={(event) =>
                          updateOption(session.id, option.id, {
                            name: event.target.value,
                          })
                        }
                        className="min-w-0 flex-1 bg-transparent font-medium text-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(session.id, option.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-rose-500"
                        aria-label={`Remove ${option.name || "option"}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {session.criteria.map((criterion) => (
                <tr
                  key={criterion.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <th className="px-3 py-3 font-medium text-foreground">
                    <div>{criterion.name || "Untitled criterion"}</div>
                    <div className="mt-0.5 font-mono text-[10px] font-normal text-muted-foreground">
                      {criterion.weight}× ·{" "}
                      {criterion.direction === "minimize"
                        ? "lower wins"
                        : "higher wins"}
                      {criterion.gate
                        ? ` · ${criterion.direction === "minimize" ? "max" : "min"} ${criterion.gate}`
                        : ""}
                    </div>
                  </th>
                  {session.options.map((option) => {
                    const score = option.scores[criterion.id];
                    const isSelected =
                      selectedCell?.optionId === option.id &&
                      selectedCell.criterionId === criterion.id;
                    return (
                      <td key={option.id} className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          inputMode="numeric"
                          value={typeof score === "number" ? score : ""}
                          placeholder="—"
                          onFocus={() =>
                            setSelectedCell({
                              optionId: option.id,
                              criterionId: criterion.id,
                            })
                          }
                          onChange={(event) =>
                            setOptionScore(
                              session.id,
                              option.id,
                              criterion.id,
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                          className={`w-full rounded-md border px-2 py-1.5 text-center font-mono font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isSelected ? "border-indigo-500 bg-indigo-500/10" : "border-border bg-muted/30"}`}
                          aria-label={`${option.name || "Option"}, ${criterion.name || "criterion"} score`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="mb-2 text-xs font-medium text-foreground">
            Assessment evidence · {selected.option.name || "Untitled option"} /{" "}
            {selected.criterion.name || "Untitled criterion"}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_132px]">
            <textarea
              value={
                selected.option.scoreEvidence?.[selected.criterion.id]?.note ??
                ""
              }
              onChange={(event) =>
                setOptionScoreEvidence(
                  session.id,
                  selected.option.id,
                  selected.criterion.id,
                  {
                    ...selected.option.scoreEvidence?.[selected.criterion.id],
                    note: event.target.value,
                  },
                )
              }
              placeholder="Why this score? Capture a source, assumption, or observation."
              rows={2}
              className="resize-none rounded-md border border-border bg-card px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <label className="text-[10px] text-muted-foreground">
              Confidence
              <select
                value={
                  selected.option.scoreEvidence?.[selected.criterion.id]
                    ?.confidence ?? "medium"
                }
                onChange={(event) =>
                  setOptionScoreEvidence(
                    session.id,
                    selected.option.id,
                    selected.criterion.id,
                    {
                      ...selected.option.scoreEvidence?.[selected.criterion.id],
                      confidence: event.target.value as
                        | "low"
                        | "medium"
                        | "high",
                    },
                  )
                }
                className="mt-1 block w-full rounded-md border border-border bg-card px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low confidence</option>
                <option value="medium">Medium confidence</option>
                <option value="high">High confidence</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleAddOption} className="flex gap-2 pt-1">
        <input
          type="text"
          placeholder="Add a candidate option..."
          value={newOptionName}
          onChange={(event) => setNewOptionName(event.target.value)}
          className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          className="gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add option</span>
        </Button>
      </form>
    </div>
  );
}
