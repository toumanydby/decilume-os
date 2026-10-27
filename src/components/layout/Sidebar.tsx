"use client";

import { useAppStore, ActiveTab } from "@/lib/store";
import {
  Compass,
  BookOpen,
  History,
  FileText,
  ListTree,
  Target,
  Tag,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const { activeTab, setActiveTab, digests, sessions, activeDigestId, setActiveDigestId } = useAppStore();
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("briefing-overview");
  const activeDigest = digests.find((digest) => digest.id === activeDigestId) || digests[0];
  const briefingSections = [
    { id: "briefing-overview", label: "Overview", icon: FileText },
    { id: "executive-briefing", label: "Executive briefing", icon: BookOpen },
    { id: "strategic-takeaways", label: "Key takeaways", icon: Target },
    { id: "categorization-tags", label: "Tags & context", icon: Tag },
  ];

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    {
      id: "digest",
      label: "Digest Engine",
      icon: BookOpen,
      count: digests.length > 0 ? digests.length : undefined,
    },
    {
      id: "decision",
      label: "Decision Lab",
      icon: Compass,
      count: sessions.length > 0 ? sessions.length : undefined,
    },
    {
      id: "history",
      label: "Archive & History",
      icon: History,
    },
  ];

  useEffect(() => {
    const scrollContainer = document.getElementById("workspace-scroll");
    if (!scrollContainer || activeTab !== "digest" || !activeDigest) {
      setReadingProgress(0);
      return;
    }

    const updateProgress = () => {
      const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      setReadingProgress(scrollableHeight > 0 ? Math.min(100, Math.round((scrollContainer.scrollTop / scrollableHeight) * 100)) : 0);

      const containerTop = scrollContainer.getBoundingClientRect().top;
      const visibleSection = briefingSections.reduce((current, section) => {
        const element = document.getElementById(section.id);
        return element && element.getBoundingClientRect().top - containerTop <= 112 ? section.id : current;
      }, "briefing-overview");
      setActiveSection(visibleSection);
    };

    const frame = window.requestAnimationFrame(updateProgress);
    scrollContainer.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      scrollContainer.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.cancelAnimationFrame(frame);
    };
  }, [activeDigest, activeTab]);

  const showBriefingSection = (sectionId: string) => {
    if (activeTab !== "digest") setActiveTab("digest");
    setActiveSection(sectionId);
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const selectDigest = (digestId: string) => {
    setActiveDigestId(digestId);
    setActiveTab("digest");
    document.getElementById("workspace-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-64 flex-col justify-between overflow-y-auto border-r border-border bg-card/95 backdrop-blur-md lg:flex">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-3 mb-2 font-medium">
            Command Center
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === "digest" && activeDigest && (
          <div className="space-y-3 border-t border-border/70 pt-5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-indigo-300">
                <ListTree className="h-3.5 w-3.5" />
                Briefing navigator
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{readingProgress}%</span>
            </div>

            <div className="px-1">
              <p className="line-clamp-2 text-xs font-semibold leading-5 text-foreground">{activeDigest.title}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300" style={{ width: `${readingProgress}%` }} />
              </div>
            </div>

            <nav className="space-y-0.5" aria-label="Briefing sections">
              {briefingSections.map((section) => {
                const Icon = section.icon;
                const isCurrent = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => showBriefingSection(section.id)}
                    aria-current={isCurrent ? "location" : undefined}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isCurrent ? "bg-indigo-500/12 text-indigo-200 shadow-sm shadow-indigo-500/5" : "text-muted-foreground hover:bg-indigo-500/8 hover:text-foreground"}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isCurrent ? "text-indigo-300" : "text-indigo-400/80"}`} />
                    <span className="flex-1">{section.label}</span>
                    <ChevronRight className={`h-3 w-3 transition-opacity ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`} />
                  </button>
                );
              })}
            </nav>

            {digests.length > 1 && (
              <div className="space-y-1 border-t border-border/70 pt-3">
                <div className="flex items-center gap-2 px-1 pb-1 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Recent briefings
                </div>
                {digests.filter((digest) => digest.id !== activeDigest.id).slice(0, 3).map((digest) => (
                  <button
                    key={digest.id}
                    onClick={() => selectDigest(digest.id)}
                    className="w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="line-clamp-2 block text-[11px] leading-4 text-muted-foreground hover:text-foreground">{digest.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/80">
        <div className="rounded-xl p-3 bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-foreground">Local-First Storage</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Data is stored in browser memory & local storage with zero cloud latency.
          </p>
        </div>
      </div>
    </aside>
  );
}
