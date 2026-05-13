"use client";

import { useState } from "react";
import { Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import { cn } from "@/utils/cn";

const TAGS = ["humans", "just", "意外", "animals", "games", "art"];

export function FilterBar() {
  const [isListed, setIsListed] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-surface-elevated/50 border border-border">
      {/* Left side: Toggle & Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Listed Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isListed}
              onChange={() => setIsListed(!isListed)}
            />
            <div className={cn(
              "block w-11 h-6 rounded-full transition-colors",
              isListed ? "bg-accent-primary" : "bg-surface"
            )}></div>
            <div className={cn(
              "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
              isListed ? "transform translate-x-5" : ""
            )}></div>
          </div>
          <span className="text-sm font-semibold text-content-secondary group-hover:text-content-primary transition-colors whitespace-nowrap">
            Listed on PancakeSwap
          </span>
        </label>

        <div className="w-px h-6 bg-border hidden sm:block"></div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all border",
                activeTags.includes(tag)
                  ? "bg-accent-primary/20 text-accent-primary border-accent-primary/50 shadow-[0_0_10px_rgba(0,255,102,0.1)]"
                  : "bg-surface border-border text-content-secondary hover:text-content-primary hover:border-border-hover"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Dropdowns & View toggles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filters Dropdown */}
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-content-secondary hover:text-content-primary hover:border-border-hover transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>

        {/* Featured Dropdown */}
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-content-secondary hover:text-content-primary hover:border-border-hover transition-colors">
          Featured
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border hidden sm:block"></div>

        {/* View Toggles */}
        <div className="flex items-center bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" 
                ? "bg-surface-elevated text-accent-primary shadow-sm" 
                : "text-content-tertiary hover:text-content-secondary"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list" 
                ? "bg-surface-elevated text-accent-primary shadow-sm" 
                : "text-content-tertiary hover:text-content-secondary"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
