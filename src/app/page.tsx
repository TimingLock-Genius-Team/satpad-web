"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ExploreTabs } from "@/components/explore/ExploreTabs";
import { TokenGrid } from "@/components/explore/TokenGrid";
import { Pagination } from "@/components/explore/Pagination";
import { cn } from "@/utils/cn";
import { useTokens, useStats } from "@/lib/api-hooks";
import { mapApiTokenToToken } from "@/lib/token-display";
import type { ApiTokenTab } from "@/lib/api-types";
import type { Token } from "@/types/token";

const PAGE_SIZE = 12;
const TOKEN_TABS = new Set<ApiTokenTab>(["trending", "new", "graduating", "all"]);

function isTokenTab(tab: string): tab is ApiTokenTab {
  return TOKEN_TABS.has(tab as ApiTokenTab);
}

function fmtOkb(weiString: string): string {
  const n = Number(weiString) / 1e18;
  if (isNaN(n)) return "0";
  return n.toFixed(2);
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 h-[220px] flex flex-col gap-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-highlight shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-surface-highlight rounded" />
          <div className="h-3 w-40 bg-surface-highlight rounded" />
        </div>
        <div className="h-[22px] w-14 bg-surface-highlight rounded-full shrink-0" />
      </div>
      <div className="mt-1">
        <div className="w-full h-1.5 bg-surface-highlight rounded-full" />
        <div className="flex justify-between mt-2">
          <div className="h-3 w-16 bg-surface-highlight rounded" />
          <div className="h-3 w-20 bg-surface-highlight rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-auto">
        <div className="space-y-1.5">
          <div className="h-2.5 w-8 bg-surface-highlight rounded" />
          <div className="h-4 w-14 bg-surface-highlight rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-8 bg-surface-highlight rounded" />
          <div className="h-4 w-14 bg-surface-highlight rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-10 bg-surface-highlight rounded" />
          <div className="h-4 w-14 bg-surface-highlight rounded" />
        </div>
      </div>
      <div className="h-5 w-full bg-surface-highlight rounded" />
    </div>
  );
}

function TokenGridSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-20 bg-surface-highlight rounded animate-pulse" />
        <div className="h-3 w-10 bg-surface-highlight rounded animate-pulse" />
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ApiTokenTab>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"comfy" | "compact">("comfy");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: statsData } = useStats();
  const { data: tokensData, isLoading, error } = useTokens({
    tab: activeTab,
    limit: 100,
    q: searchQuery || undefined,
  });

  const tokens: Token[] = useMemo(
    () => (tokensData?.items ?? []).map(mapApiTokenToToken),
    [tokensData]
  );

  const totalPages = Math.max(1, Math.ceil(tokens.length / PAGE_SIZE));
  const paginatedTokens = useMemo(
    () => tokens.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [tokens, currentPage]
  );

  const handleTabChange = (tab: string) => {
    if (isTokenTab(tab)) setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full pb-16 pt-20 md:pt-24 px-4">
        <div className="max-w-[1260px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div className="max-w-[680px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[11px] font-semibold tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-brand-pulse" />
                live on XLayer
              </div>
              <h1 className="text-[42px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.05] text-content-primary mb-6">
                The exponential<br />
                <span className="text-accent-primary italic">launchpad</span>.
              </h1>
              <p className="text-content-secondary text-base md:text-lg leading-relaxed max-w-[560px]">
                Permissionless token issuance on XLayer, powered by sat1 bonding curves. No admins. No backdoors. Just math.
              </p>
            </div>

            <div className="flex items-center gap-3 lg:pb-1">
              <button
                onClick={() => router.push("/create")}
                className="px-6 py-3 bg-accent-primary text-surface-base font-semibold rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
              >
                Launch a token
              </button>
              <a
                href="/docs"
                className="px-6 py-3 border border-border text-content-primary font-medium rounded-lg hover:bg-surface-highlight transition-colors inline-flex items-center gap-2 text-sm"
              >
                Read the docs
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Stats Bar — inline data, no card grid */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 py-5 px-6 bg-surface border border-border rounded-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase">Tokens live</span>
              <span className="text-2xl font-bold text-content-primary font-mono tabular-nums">
                {statsData ? statsData.tokensLive : "--"}
              </span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase">24h volume</span>
              <span className="text-2xl font-bold text-content-primary font-mono tabular-nums">
                {statsData ? fmtOkb(statsData.volume24hOkb) : "--"}
              </span>
              <span className="text-content-tertiary text-sm font-medium">OKB</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase">Graduated</span>
              <span className="text-2xl font-bold text-content-primary font-mono tabular-nums">
                {statsData ? statsData.graduated : "--"}
              </span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase">Total trades</span>
              <span className="text-2xl font-bold text-content-primary font-mono tabular-nums">
                {statsData ? statsData.totalTrades.toLocaleString() : "--"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs and Search */}
      <div className="sticky top-[64px] z-10 bg-surface-base/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1260px] mx-auto px-4 h-14 flex items-center gap-6">
          <div className="overflow-x-auto">
            <ExploreTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <div className="flex-1 hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("comfy")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "comfy" ? "bg-surface-highlight text-content-primary" : "text-content-tertiary hover:text-content-secondary"
                )}
              >
                Comfy
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                  viewMode === "compact" ? "bg-surface-highlight text-content-primary" : "text-content-tertiary hover:text-content-secondary"
                )}
              >
                Compact
              </button>
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 h-9 w-[240px]">
              <Search className="w-4 h-4 text-content-tertiary flex-shrink-0" />
              <input
                type="text"
                placeholder="Search name, symbol, or 0x..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-content-primary placeholder:text-content-tertiary min-w-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1260px] mx-auto px-4 py-8">
        {isLoading && <TokenGridSkeleton />}
        {error && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-danger/10 border border-accent-danger/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-danger"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <p className="text-content-primary text-sm font-medium mb-1">Failed to load tokens</p>
              <p className="text-content-tertiary text-xs">Please check your connection and try again.</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <>
            <TokenGrid tokens={paginatedTokens} viewMode={viewMode} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
