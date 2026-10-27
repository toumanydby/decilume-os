"use client";

import { useAppStore } from "@/lib/store";
import { DigestCard } from "./DigestCard";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DigestHistory() {
  const { digests, clearDigests } = useAppStore();

  if (digests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl p-8 bg-card/20">
        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1">No Briefings Archived Yet</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          Articles and texts you synthesize in the Digest Engine will automatically be saved here
          in your local storage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Archived Executive Briefings ({digests.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Are you sure you want to clear all archived briefings?")) {
              clearDigests();
            }
          }}
          className="text-rose-500 hover:text-rose-600 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Archive</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {digests.map((item) => (
          <DigestCard key={item.id} digest={item} />
        ))}
      </div>
    </div>
  );
}

