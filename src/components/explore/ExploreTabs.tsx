"use client";

import { Flame, Sparkles, GraduationCap } from "lucide-react";
import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "trending", label: "Trending", Icon: Flame },
  { id: "new", label: "New", Icon: Sparkles },
  { id: "graduating", label: "Graduating soon", Icon: GraduationCap },
  { id: "graduated", label: "Graduated", Icon: GraduationCap },
  { id: "all", label: "All", Icon: null },
];

export function ExploreTabs({ activeTab, onTabChange }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide w-full max-w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.Icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] leading-[1.4] font-medium transition-all duration-200 whitespace-nowrap shrink-0",
              isActive
                ? "bg-surface-highlight text-accent-primary ring-1 ring-accent-primary/25"
                : "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-highlight/50"
            )}
          >
            {IconComponent && (
              <IconComponent className="w-3.5 h-3.5" />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
