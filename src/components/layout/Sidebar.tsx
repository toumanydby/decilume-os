"use client";

import { useAppStore, ActiveTab } from "@/lib/store";
import { Compass, BookOpen, Sliders, History } from "lucide-react";

export function Sidebar() {
  const { activeTab, setActiveTab, digests, sessions } = useAppStore();

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

  return (
    <aside className="w-64 border-r border-border bg-card/40 flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)]">
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

