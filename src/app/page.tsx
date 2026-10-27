"use client";

import { useAppStore } from "@/lib/store";
import { UrlInputBar } from "@/components/digest/UrlInputBar";
import { DigestCard } from "@/components/digest/DigestCard";
import { DigestHistory } from "@/components/digest/DigestHistory";
import { CriteriaEditor } from "@/components/decision/CriteriaEditor";
import { OptionScoreSlider } from "@/components/decision/OptionScoreSlider";
import { DecisionRadarChart } from "@/components/decision/DecisionRadarChart";
import { WinnerBanner } from "@/components/decision/WinnerBanner";
import { Sparkles, Compass, Plus, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const {
    activeTab,
    digests,
    activeDigestId,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSessionTitle,
  } = useAppStore();

  const activeDigest =
    digests.find((d) => d.id === activeDigestId) || digests[0] || null;

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Tab 1: Digest Engine */}
      {activeTab === "digest" && (
        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Digest Engine</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Automated article ingestion & high-density executive briefings via Google Gemini 2.0 Flash.
            </p>
          </div>

          <UrlInputBar />

          {activeDigest ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Latest Executive Synthesis
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Saved to local state
                </span>
              </div>
              <DigestCard digest={activeDigest} />
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-xl p-6 bg-card/20">
              <p className="text-xs text-muted-foreground">
                Enter an article URL or paste text above to generate your first briefing.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Decision Lab */}
      {activeTab === "decision" && activeSession && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <input
                  type="text"
                  value={activeSession.title}
                  onChange={(e) =>
                    updateSessionTitle(activeSession.id, e.target.value, activeSession.description)
                  }
                  className="text-xl font-bold tracking-tight text-foreground bg-transparent focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={activeSession.description || ""}
                placeholder="Add session description..."
                onChange={(e) =>
                  updateSessionTitle(activeSession.id, activeSession.title, e.target.value)
                }
                className="text-xs text-muted-foreground bg-transparent focus:outline-none w-full mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              {sessions.length > 1 && (
                <select
                  value={activeSession.id}
                  onChange={(e) => setActiveSessionId(e.target.value)}
                  className="bg-card border border-border text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => createSession("New Decision Matrix")}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </Button>
            </div>
          </div>

          {/* Winner Banner & Recommendation */}
          <WinnerBanner session={activeSession} />

          {/* Visualization & Matrix Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <CriteriaEditor session={activeSession} />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <DecisionRadarChart session={activeSession} />
              <OptionScoreSlider session={activeSession} />
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: History & Archive */}
      {activeTab === "history" && (
        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Briefing Archives
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Locally persisted historical executive digests and notes.
            </p>
          </div>
          <DigestHistory />
        </section>
      )}
    </div>
  );
}

