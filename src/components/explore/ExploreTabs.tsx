"use client";

import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "graduating", label: "Graduating" },
];

export function ExploreTabs({ activeTab, onTabChange }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-6 py-2.5 rounded-pill text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === tab.id
              ? "bg-accent-primary text-white"
              : "bg-surface text-content-secondary hover:bg-surface-elevated hover:text-content-primary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
