"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
const TOKEN_TABS = new Set<ApiTokenTab>(["trending", "new", "graduating", "graduated", "all"]);

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
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="space-y-1.5">
          <div className="h-2 w-8 bg-surface-highlight rounded" />
          <div className="h-3.5 w-14 bg-surface-highlight rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-8 bg-surface-highlight rounded" />
          <div className="h-3.5 w-14 bg-surface-highlight rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-10 bg-surface-highlight rounded" />
          <div className="h-3.5 w-14 bg-surface-highlight rounded" />
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
          <div key={i} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <SkeletonCard />
          </div>
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
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Add scroll listener for sticky header background
  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        // When the sticky container hits top: 64px, it becomes sticky. 
        // We use 65 to give a 1px buffer for subpixel rendering.
        setIsSticky(stickyRef.current.getBoundingClientRect().top <= 65);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: statsData, error: statsError } = useStats();
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
    <div className="w-full relative">
      {/* Full Page Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-accent-success/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent-primary/5 rounded-full blur-[150px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Dynamic Hero Section */}
      <section className="relative w-full pb-4 pt-8 md:pt-10 px-4">
        <div className="max-w-[1260px] mx-auto flex flex-col items-start text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-highlight border border-border/50 text-[10px] font-medium text-content-secondary mb-3 opacity-0 animate-fade-in-up">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-accent-success"></span>
            </span>
            Live on XLayer
          </div>
          
          <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] leading-[1.05] font-bold tracking-tighter mb-2 text-content-primary opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The <span className="text-accent-primary italic pr-2">exponential</span>launchpad
          </h1>
          
          <p className="text-content-secondary text-[13px] md:text-sm mb-5 leading-relaxed max-w-[500px] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Permissionless token issuance powered by <span className="text-content-primary font-medium">sat1 bonding curves</span>. Create, trade, and graduate with deep liquidity.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => router.push("/create")}
              className="group relative px-4 py-2 bg-accent-primary text-surface-base font-bold rounded-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-10px] hover:shadow-accent-primary/50"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-1.5 text-[12px]">
                Launch a token
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </button>
            
            <a href="/docs" className="px-4 py-2 rounded-full text-content-secondary text-[12px] font-medium hover:text-content-primary transition-colors">
              Read the docs
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-[800px] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Card 1: 24H Volume */}
            <div className="relative overflow-hidden bg-surface-highlight/20 backdrop-blur-md rounded-xl p-2.5 md:p-3 shadow-[0_4px_20px_-4px] shadow-accent-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent"></div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent animate-[shimmer_3s_infinite]" style={{ animationDelay: '0s' }}></div>
              <div className="relative z-10">
                <div className="text-content-tertiary text-[10px] font-medium mb-0.5 flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary/80"></span>
                  </div>
                  24H Volume
                </div>
                <div className="text-sm md:text-base font-bold text-content-primary flex items-baseline gap-1">
                  {statsData ? fmtOkb(statsData.volume24hOkb) : statsError ? "--" : "--"} <span className="text-[10px] font-medium text-content-tertiary">OKB</span>
                </div>
              </div>
            </div>

            {/* Card 2: Tokens Live */}
            <div className="relative overflow-hidden bg-surface-highlight/20 backdrop-blur-md rounded-xl p-2.5 md:p-3 shadow-[0_4px_20px_-4px] shadow-accent-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent"></div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent animate-[shimmer_3s_infinite]" style={{ animationDelay: '0.75s' }}></div>
              <div className="relative z-10">
                <div className="text-content-tertiary text-[10px] font-medium mb-0.5 flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary/80"></span>
                  </div>
                  Tokens Live
                </div>
                <div className="text-sm md:text-base font-bold text-content-primary">
                  {statsData ? statsData.tokensLive : statsError ? "--" : "--"}
                </div>
              </div>
            </div>

            {/* Card 3: Graduated */}
            <div className="relative overflow-hidden bg-surface-highlight/20 backdrop-blur-md rounded-xl p-2.5 md:p-3 shadow-[0_4px_20px_-4px] shadow-accent-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent"></div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent animate-[shimmer_3s_infinite]" style={{ animationDelay: '1.5s' }}></div>
              <div className="relative z-10">
                <div className="text-content-tertiary text-[10px] font-medium mb-0.5 flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary/80"></span>
                  </div>
                  Graduated
                </div>
                <div className="text-sm md:text-base font-bold text-content-primary">
                  {statsData ? statsData.graduated : statsError ? "--" : "--"}
                </div>
              </div>
            </div>

            {/* Card 4: Total Trades */}
            <div className="relative overflow-hidden bg-surface-highlight/20 backdrop-blur-md rounded-xl p-2.5 md:p-3 shadow-[0_4px_20px_-4px] shadow-accent-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent"></div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent animate-[shimmer_3s_infinite]" style={{ animationDelay: '2.25s' }}></div>
              <div className="relative z-10">
                <div className="text-content-tertiary text-[10px] font-medium mb-0.5 flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary/80"></span>
                  </div>
                  Total Trades
                </div>
                <div className="text-sm md:text-base font-bold text-content-primary">
                  {statsData ? statsData.totalTrades.toLocaleString() : statsError ? "--" : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs and Search Section */}
      <div ref={stickyRef} className="sticky top-[64px] z-20 py-2 md:h-14 md:py-0 mb-4 transition-all">
        {/* Dynamic Blur Background that only appears when sticky */}
        <div className={cn(
          "absolute inset-0 bg-surface-base/80 backdrop-blur-xl border-y border-border/50 transition-opacity duration-300 -z-10 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]",
          isSticky ? "opacity-100" : "opacity-0"
        )}></div>
        
        <div className="max-w-[1260px] mx-auto px-4 h-full flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative z-10 pt-2">
          <div className="w-full md:w-auto overflow-hidden">
            <ExploreTabs activeTab={activeTab} onTabChange={handleTabChange} isScrolled={isSticky} />
          </div>

          <div className="hidden md:block flex-1"></div>

          <div className="flex items-center justify-between gap-3 w-full md:w-auto pb-2 md:pb-0">
            <div className="flex gap-1.5 shrink-0 transition-colors duration-300 bg-surface-highlight/20 p-1 rounded-xl border border-border/30">
              <button
                onClick={() => setViewMode("comfy")}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-bold transition-all rounded-lg relative overflow-hidden",
                  viewMode === "comfy" 
                    ? "bg-accent-primary text-surface-base shadow-[0_0_10px_-2px] shadow-accent-primary/40" 
                    : "bg-transparent text-content-tertiary hover:text-content-primary"
                )}
              >
                {viewMode === "comfy" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                )}
                <span className="relative z-10">Comfy</span>
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-bold transition-all rounded-lg relative overflow-hidden",
                  viewMode === "compact" 
                    ? "bg-accent-primary text-surface-base shadow-[0_0_10px_-2px] shadow-accent-primary/40" 
                    : "bg-transparent text-content-tertiary hover:text-content-primary"
                )}
              >
                {viewMode === "compact" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                )}
                <span className="relative z-10">Compact</span>
              </button>
            </div>

            {/* Search */}
            <div className={cn(
              "flex items-center gap-2 focus-within:border-accent-primary/50 focus-within:ring-1 focus-within:ring-accent-primary/20 transition-all rounded-[10px] px-3 h-9 w-full md:max-w-[280px]",
              isSticky ? "bg-surface border border-border/50" : "bg-surface-highlight/30 border border-transparent hover:bg-surface-highlight/50"
            )}>
              <Search className="w-3.5 h-3.5 text-content-tertiary flex-shrink-0" />
              <input
                type="text"
                placeholder="Search name, symbol, or 0x address"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-[12px] text-content-primary placeholder:text-content-tertiary min-w-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1260px] mx-auto px-4 pb-8">
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
            <TokenGrid
              tokens={paginatedTokens}
              viewMode={viewMode}
              totalCount={tokens.length}
              emptyMessage={searchQuery ? `No results for "${searchQuery}"` : undefined}
            />
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
