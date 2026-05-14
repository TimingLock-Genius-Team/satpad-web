"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ExploreTabs } from "@/components/explore/ExploreTabs";
import { TokenGrid } from "@/components/explore/TokenGrid";
import { MOCK_TOKENS } from "@/types/token";
import { cn } from "@/utils/cn";

export default function Home() {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"comfy" | "compact">("comfy");

  // Simple mock filtering based on tab and search query
  const filteredTokens = MOCK_TOKENS.filter((token) => {
    // Search filter
    if (searchQuery && !token.name.toLowerCase().includes(searchQuery.toLowerCase()) && !token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tab filter
    if (activeTab === "graduating" && token.progress < 80) return false;
    if (activeTab === "new") return Date.now() - token.createdAt <= 1000 * 60 * 60 * 24;
    
    return true;
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full  pb-14 pt-16 md:pt-14 px-4 bg-[#0A0B0E]">
        <div className="max-w-[1260px] mx-auto flex flex-col items-start justify-center text-left">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-content-primary max-w-[820px]">
            The exponential <span className="text-accent-primary italic drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]">launchpad</span>.
          </h1>
          <p className="text-content-secondary text-base md:text-[17px] mb-10 leading-relaxed max-w-[640px]">
            Permissionless token issuance on XLayer, powered by sat1 bonding curves. No admins. No backdoors. Just math.
          </p>

          {/* Stats Section moved inside Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 w-full max-w-[920px]">
            <div className="bg-[#12131A] rounded-xl p-4 md:p-5 border border-[#1E2028] h-[92px]">
              <div className="text-[#8F94A8] text-[11px] font-semibold tracking-wider mb-2 uppercase">Tokens Live</div>
              <div className="text-2xl md:text-3xl font-bold text-[#F2F4F8]">1,247</div>
            </div>
            <div className="bg-[#12131A] rounded-xl p-4 md:p-5 border border-[#1E2028] h-[92px]">
              <div className="text-[#8F94A8] text-[11px] font-semibold tracking-wider mb-2 uppercase">24H Volume</div>
              <div className="text-2xl md:text-3xl font-bold text-[#F2F4F8] flex items-baseline gap-2">
                8,432 <span className="text-base md:text-lg font-medium text-[#8F94A8]">OKB</span>
              </div>
            </div>
            <div className="bg-[#12131A] rounded-xl p-4 md:p-5 border border-[#1E2028] h-[92px]">
              <div className="text-[#8F94A8] text-[11px] font-semibold tracking-wider mb-2 uppercase">Graduated</div>
              <div className="text-2xl md:text-3xl font-bold text-[#F2F4F8]">72</div>
            </div>
            <div className="bg-[#12131A] rounded-xl p-4 md:p-5 border border-[#1E2028] h-[92px]">
              <div className="text-[#8F94A8] text-[11px] font-semibold tracking-wider mb-2 uppercase">Total Trades</div>
              <div className="text-2xl md:text-3xl font-bold text-[#F2F4F8]">18,234</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="px-6 py-3 bg-accent-primary text-surface-base font-semibold rounded-lg transition-all hover:bg-accent-primary/90 hover:-translate-y-0.5 shadow-[0_0_15px_rgb(var(--accent-primary)_/_15%)] hover:shadow-[0_0_20px_rgb(var(--accent-primary)_/_30%)]">
              Launch a token
            </button>
            <a href="/docs" className="text-content-primary hover:text-accent-primary font-medium transition-colors flex items-center gap-2 group text-sm">
              Read the docs
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-70">
                <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                <path d="m21 3-9 9"></path>
                <path d="M15 3h6v6"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Tabs and Search Section */}
      <div className="sticky top-[64px] z-10 bg-[#0A0B0E] border-b border-t border-[#1E2028] py-3 md:h-16 md:py-0 mb-8 max-w-[1260px] mx-auto">
        <div className="max-w-[1260px] mx-auto px-4 h-full flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="w-full md:w-auto overflow-hidden">
            <ExploreTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          <div className="hidden md:block flex-1"></div>

          <div className="flex items-center justify-between gap-3 w-full md:w-auto">
            <div className="flex gap-0 border border-[#1E2028] rounded-lg overflow-hidden bg-transparent shrink-0">
              <button 
                onClick={() => setViewMode("comfy")}
                className={cn(
                  "px-[10px] py-[6px] text-xs font-medium transition-colors",
                  viewMode === "comfy" ? "bg-[#1E2028] text-content-primary" : "bg-transparent text-content-tertiary hover:text-content-secondary"
                )}
              >
                Comfy
              </button>
              <button 
                onClick={() => setViewMode("compact")}
                className={cn(
                  "px-[10px] py-[6px] text-xs font-medium transition-colors",
                  viewMode === "compact" ? "bg-[#1E2028] text-content-primary" : "bg-transparent text-content-tertiary hover:text-content-secondary"
                )}
              >
                Compact
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-[#12131A] border border-[#1E2028] rounded-lg px-3 h-9 w-full md:max-w-[320px]">
              <Search className="w-4 h-4 text-content-tertiary flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search name, symbol, or 0x address" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-content-primary placeholder:text-content-tertiary min-w-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1260px] mx-auto px-4 pb-8">
        <TokenGrid tokens={filteredTokens} viewMode={viewMode} />
      </div>
    </div>
  );
}
