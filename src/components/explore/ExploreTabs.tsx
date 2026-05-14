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
    <div className="flex items-center gap-1 sm:gap-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative px-2 py-2 text-sm md:text-base font-bold tracking-wide transition-colors duration-300 uppercase",
            activeTab === tab.id
              ? "text-accent-primary"
              : "text-content-secondary hover:text-white"
          )}
        >
          {tab.label}
          
          {/* Active Bottom Highlight */}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary shadow-[0_0_10px_rgba(0,255,102,0.8)]" />
          )}
          
          {/* Hover Bottom Highlight */}
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
        </button>
      ))}
    </div>
  );
}
