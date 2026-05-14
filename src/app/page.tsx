"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { TokenGrid } from "@/components/explore/TokenGrid";
import { FilterBar } from "@/components/explore/FilterBar";
import { Pagination } from "@/components/explore/Pagination";
import { Hero } from "@/components/home/Hero";
import { MOCK_TOKENS } from "@/types/token";

const PAGE_SIZE = 20;

export default function Home() {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Simple mock filtering based on tab and search query
  const filteredTokens = useMemo(() => MOCK_TOKENS.filter((token) => {
    // Search filter
    if (searchQuery && !token.name.toLowerCase().includes(searchQuery.toLowerCase()) && !token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tab filter
    if (activeTab === "graduating" && token.progress < 80) return false;
    if (activeTab === "new") return Date.now() - token.createdAt <= 1000 * 60 * 60 * 24;
    
    return true;
  }), [activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / PAGE_SIZE));

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Guard: if currentPage exceeds totalPages, clamp it
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTokens = filteredTokens.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />

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

      <FilterBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <TokenGrid tokens={paginatedTokens} />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={safePage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      )}
    </div>
  );
}
