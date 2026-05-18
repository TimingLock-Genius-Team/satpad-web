"use client";

import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isScrolled?: boolean;
}

const TABS = [
  { id: "trending", label: "Trending", emoji: "🔥", activeBg: "bg-accent-primary", activeColor: "text-surface-base" },
  { id: "new", label: "New", emoji: "⚡", activeBg: "bg-accent-primary", activeColor: "text-surface-base" },
  { id: "graduating", label: "Graduating soon", emoji: "⏳", activeBg: "bg-accent-primary", activeColor: "text-surface-base" },
  { id: "graduated", label: "Graduated", emoji: "🎓", activeBg: "bg-accent-primary", activeColor: "text-surface-base" },
  { id: "all", label: "All", emoji: "🪐", activeBg: "bg-accent-primary", activeColor: "text-surface-base" },
];

export function ExploreTabs({ activeTab, onTabChange, isScrolled = false }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full max-w-full pb-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden outline-none ring-0",
              isActive
                ? `shadow-sm ${tab.activeBg} ${tab.activeColor}`
                : isScrolled
                  ? "bg-surface text-content-tertiary hover:text-content-primary hover:bg-surface-highlight"
                  : "bg-transparent text-content-tertiary hover:text-content-primary hover:bg-surface-highlight/30"
            )}
          >
            {/* Active background glow */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            )}
            
            <span className={cn(
              "text-base transition-transform duration-300",
              isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
            )}>
              {tab.emoji}
            </span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
