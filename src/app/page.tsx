"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ExploreTabs } from "@/components/explore/ExploreTabs";
import { TokenGrid } from "@/components/explore/TokenGrid";
import { MOCK_TOKENS } from "@/types/token";

export default function Home() {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Search - Visible only on small screens */}
      <div className="md:hidden mb-6 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
        <input 
          type="text" 
          placeholder="Search tokens..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-input border border-border focus:outline-none focus:border-accent-primary text-sm transition-colors text-content-primary placeholder:text-content-tertiary"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <ExploreTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <TokenGrid tokens={filteredTokens} />
    </div>
  );
}
