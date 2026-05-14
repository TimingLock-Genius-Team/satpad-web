"use client";

import { useState } from "react";
import { Filter, ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { ExploreTabs } from "./ExploreTabs";

interface FilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({ activeTab, onTabChange, searchQuery, onSearchChange }: FilterBarProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
      {/* Left side: Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
        {/* Tabs */}
        <div>
          <ExploreTabs activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>

        {/* Search */}
        <div className="hidden md:flex items-center relative mr-2">
          <Search className="w-4 h-4 absolute left-0 text-content-tertiary" />
          <input 
            type="text" 
            placeholder="Search tokens..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 pr-0 py-1.5 bg-transparent border-b border-transparent focus:border-accent-primary focus:outline-none text-sm w-48 lg:w-64 transition-colors text-content-primary placeholder:text-content-tertiary"
          />
        </div>
      </div>

      {/* Right side: Dropdowns & View toggles */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Filters Dropdown */}
        <button className="flex items-center gap-2 text-sm font-bold text-content-secondary hover:text-content-primary transition-colors uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          FILTERS
        </button>

        {/* Featured Dropdown */}
        <button className="flex items-center gap-1 text-sm font-bold text-content-secondary hover:text-content-primary transition-colors uppercase tracking-wider">
          FEATURED
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-1 h-1 rounded-full bg-border hidden sm:block mx-1"></div>

        {/* View Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "transition-colors",
              viewMode === "grid" 
                ? "text-accent-primary" 
                : "text-content-tertiary hover:text-content-secondary"
            )}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "transition-colors",
              viewMode === "list" 
                ? "text-accent-primary" 
                : "text-content-tertiary hover:text-content-secondary"
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
