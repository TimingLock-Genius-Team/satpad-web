"use client";

import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "trending", label: "Trending", icon: "🔥" },
  { id: "new", label: "New", icon: "✨" },
  { id: "graduating", label: "Graduating soon", icon: "🎓" },
  { id: "all", label: "All", icon: null },
];

export function ExploreTabs({ activeTab, onTabChange }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-[6px] px-[14px] py-2 rounded-[8px] text-[14px] leading-[1.4] font-medium transition-all whitespace-nowrap",
              isActive
                ? "bg-[#00FF88]/12 text-[#1AFF88]"
                : "bg-transparent text-content-secondary hover:text-content-primary"
            )}
          >
            {tab.icon && (
              <span>
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
