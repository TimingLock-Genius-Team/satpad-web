"use client";

import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isScrolled?: boolean;
}

const TABS = [
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "new", label: "New", emoji: "⚡" },
  { id: "graduating", label: "Graduating soon", emoji: "⏳" },
  { id: "graduated", label: "Graduated", emoji: "🎓" },
  { id: "all", label: "All", emoji: "🪐" },
];

export function ExploreTabs({ activeTab, onTabChange }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full max-w-full pb-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 whitespace-nowrap shrink-0 outline-none ring-0",
              isActive
                ? "bg-accent-primary/10 border border-accent-primary/50 text-accent-primary shadow-[0_0_15px_-3px] shadow-accent-primary/20"
                : "bg-transparent border border-transparent text-content-tertiary hover:text-content-secondary hover:bg-surface-highlight/20"
            )}
          >
            {/* Active background scanline effect */}
            {isActive && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent animate-[shimmer_2s_infinite]"></div>
              </div>
            )}
            
            <span className={cn(
              "text-[14px] transition-transform duration-300 relative z-10",
              isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "group-hover:scale-110 opacity-70 group-hover:opacity-100 filter-grayscale group-hover:filter-none"
            )}>
              {tab.emoji}
            </span>
            <span className="relative z-10 tracking-wide">{tab.label}</span>
            
            {/* Active bottom glow line */}
            {isActive && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-80"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}
