"use client";

import { Flame, Sparkles, GraduationCap } from "lucide-react";
import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isScrolled?: boolean;
}

const TABS = [
  { id: "trending", label: "Trending", Icon: Flame, colorClass: "text-[#ff5c00]", bgClass: "bg-[#ff5c00]/10" },
  { id: "new", label: "New", Icon: Sparkles, colorClass: "text-[#00e5ff]", bgClass: "bg-[#00e5ff]/10" },
  { id: "graduating", label: "Graduating soon", Icon: GraduationCap, colorClass: "text-[#b026ff]", bgClass: "bg-[#b026ff]/10" },
  { id: "graduated", label: "Graduated", Icon: GraduationCap, colorClass: "text-[#2ee890]", bgClass: "bg-[#2ee890]/10" },
  { id: "all", label: "All", Icon: null, colorClass: "text-content-primary", bgClass: "bg-surface-highlight" },
];

export function ExploreTabs({ activeTab, onTabChange, isScrolled = false }: ExploreTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full max-w-full pb-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.Icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden",
              isActive
                ? `shadow-sm ${tab.bgClass} ${tab.colorClass}`
                : isScrolled
                  ? "bg-surface border border-border/50 text-content-tertiary hover:text-content-primary hover:border-border-hover"
                  : "bg-transparent border border-transparent text-content-tertiary hover:text-content-primary hover:bg-surface-highlight/30"
            )}
          >
            {/* Active background glow */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            )}
            
            {IconComponent && (
              <IconComponent 
                className={cn(
                  "w-4 h-4 transition-transform duration-300", 
                  isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100",
                  isActive ? "" : tab.colorClass // Use the tab's specific color even when inactive (but slightly dimmed)
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
