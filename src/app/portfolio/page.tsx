"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, Wallet } from "lucide-react";
import { Pagination } from "@/components/explore/Pagination";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePortfolio, usePortfolioHistory } from "@/lib/api-hooks";
import { resolveIpfsUrl } from "@/lib/ipfs";

import { timeAgo } from "@/lib/time-display";
import { toTradeSide, formatSmallNumber } from "@/lib/trade-display";

function fmtOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return isNaN(n) ? 0 : n;
}

function fmtOkbCompact(wei: string): string {
  const n = fmtOkb(wei);
  if (n < 0.0001) return formatSmallNumber(n);
  return n.toFixed(4);
}

function fmtTokenBalance(wei: string): string {
  const n = Number(wei) / 1e18;
  if (isNaN(n)) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

const getBgColor = (sym: string) => {
  let hash = 0;
  for (let i = 0; i < sym.length; i++) {
    hash = sym.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  return `rgb(${(r % 150) + 40}, ${(g % 150) + 40}, ${(b % 150) + 40})`;
};

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse border-b border-border/10">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-[#111] rounded-[4px]" />
        </td>
      ))}
    </tr>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="opacity-0 animate-fade-in-up">
      {/* Stats card skeleton */}
      <div className="bg-surface/60 backdrop-blur-xl rounded-[12px] border border-border/50 p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="mb-8 space-y-3">
          <div className="h-3 w-20 bg-[#111] rounded-[4px] animate-pulse" />
          <div className="h-12 w-56 bg-[#111] rounded-[8px] animate-pulse" />
        </div>
        <div className="border-t border-border/30 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-border/50 rounded-[12px] p-5 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] space-y-3">
              <div className="h-3 w-20 bg-[#111] rounded-[4px] animate-pulse" />
              <div className="h-7 w-24 bg-[#111] rounded-[6px] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="flex items-center gap-8 border-b border-border/30 mb-8">
        <div className="h-6 w-20 bg-[#111] rounded-[4px] animate-pulse mb-2" />
        <div className="h-6 w-20 bg-[#111] rounded-[4px] animate-pulse mb-2" />
      </div>
      {/* Table skeleton */}
      <div className="bg-surface/40 backdrop-blur-md rounded-[12px] border border-border/50 overflow-x-auto shadow-xl">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border/30 bg-[#0A0A0A]/50">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-3 w-14 bg-[#111] rounded-[4px] animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={7} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABLE_PAGE_SIZE = 10;

export default function PortfolioPage() {
  const { address: walletAddress, isConnected, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [activeTab, setActiveTab] = useState<"holdings" | "history">("holdings");
  const [holdingsPage, setHoldingsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = usePortfolio(
    isConnected ? walletAddress : undefined
  );
  const { data: historyData, isLoading: historyLoading, error: historyError } = usePortfolioHistory(
    isConnected ? walletAddress : undefined,
    { limit: 50 }
  );
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  if (isReconnecting) {
    return (
      <div className="flex-1 w-full max-w-[1260px] mx-auto px-4 py-8 flex flex-col">
        <PortfolioSkeleton />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 relative z-10">
        {/* Full Page Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-accent-success/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="flex flex-col items-center gap-6 text-center px-4 bg-surface/60 backdrop-blur-xl border border-border/50 rounded-[12px] p-10 md:p-16 shadow-2xl relative overflow-hidden group max-w-md w-full opacity-0 animate-fade-in-up">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border border-accent-primary/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(46,232,144,0.15)] group-hover:shadow-[0_0_30px_rgba(46,232,144,0.3)] transition-shadow duration-500">
            <div className="absolute inset-0 rounded-full border border-accent-primary animate-ping opacity-20 [animation-duration:3s]" />
            <Wallet className="w-6 h-6 text-accent-primary relative z-10" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[12px] bg-accent-warning/10 border border-accent-warning/30 text-[10px] font-mono font-bold tracking-widest text-accent-warning mb-4 uppercase">
              <span className="w-1.5 h-1.5 bg-accent-warning rounded-full animate-pulse" />
              Auth_Required
            </div>
            <p className="text-content-primary text-xl font-bold mb-2 tracking-tight">Access Restricted</p>
            <p className="text-content-tertiary text-sm font-mono leading-relaxed">Establish a secure connection to view portfolio metrics and transaction history.</p>
          </div>
          <button
            onClick={openConnectModal}
            className="mt-2 inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-surface-base font-mono font-bold text-[12px] uppercase tracking-widest rounded-[8px] hover:bg-accent-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_15px_rgba(46,232,144,0.3)] hover:shadow-[0_0_25px_rgba(46,232,144,0.5)]"
          >
            Connect_Wallet
          </button>
        </div>
      </div>
    );
  }

  const holdings = portfolio?.holdings ?? [];
  const totalValueOkb = holdings.reduce((sum, h) => sum + fmtOkb(h.currentValueOkb), 0);
  const realizedPnlOkb = holdings.reduce((sum, h) => sum + fmtOkb(h.realizedPnlOkb), 0);
  const history = historyData?.items ?? [];

  const isLoading = portfolioLoading || historyLoading;
  const loadError = portfolioError || historyError;

  const holdingsTotalPages = Math.max(1, Math.ceil(holdings.length / TABLE_PAGE_SIZE));
  const paginatedHoldings = holdings.slice(
    (holdingsPage - 1) * TABLE_PAGE_SIZE,
    holdingsPage * TABLE_PAGE_SIZE
  );
  const historyTotalPages = Math.max(1, Math.ceil(history.length / TABLE_PAGE_SIZE));
  const paginatedHistory = history.slice(
    (historyPage - 1) * TABLE_PAGE_SIZE,
    historyPage * TABLE_PAGE_SIZE
  );

  return (
    <div className="flex-1 w-full max-w-[1260px] mx-auto px-4 py-8 md:py-12 flex flex-col min-h-0 relative z-10 font-sans">
      {/* Full Page Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-accent-success/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent-primary/5 rounded-full blur-[150px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-[#0A0A0A] border border-border/50 text-[10px] font-mono font-bold tracking-widest text-content-secondary mb-4 opacity-0 animate-fade-in-up uppercase shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            USER_PORTFOLIO // INDEX
          </div>
          <h1 className="text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-bold tracking-tighter text-content-primary opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Port<span className="text-accent-primary italic pr-1">folio</span>
          </h1>
          <p className="text-content-secondary text-base md:text-lg font-mono tracking-tight opacity-0 animate-fade-in-up mt-2" style={{ animationDelay: '0.2s' }}>
            Your holdings and transaction history.
          </p>
        </div>
        
        <div 
          className="flex items-center gap-3 px-5 py-3 bg-[#0A0A0A] rounded-[12px] border border-border/50 text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] cursor-pointer hover:border-accent-primary/50 hover:shadow-[0_0_15px_rgba(46,232,144,0.15)] transition-all duration-300 group opacity-0 animate-fade-in-up" 
          style={{ animationDelay: '0.3s' }}
          onClick={handleCopyAddress}
        >
          <div className="w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(46,232,144,0.8)]" />
          <span className="text-content-primary font-mono font-bold tracking-wider">{walletAddress ? shortAddr(walletAddress) : "..."}</span>
          {copied ? (
            <Check className="w-4 h-4 text-accent-primary" />
          ) : (
            <Copy className="w-4 h-4 text-content-tertiary group-hover:text-accent-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && <PortfolioSkeleton />}

      {/* Error */}
      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-4 py-20 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-16 h-16 rounded-full bg-accent-danger/10 border border-accent-danger/30 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative">
            <div className="absolute inset-0 rounded-full border border-accent-danger animate-ping opacity-20 [animation-duration:2s]" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[12px] bg-accent-danger/10 border border-accent-danger/30 text-[10px] font-mono font-bold tracking-widest text-accent-danger mb-4 uppercase">
              ERR_FETCH_FAILED
            </div>
            <p className="text-content-primary text-lg font-mono font-bold mb-1 tracking-tight">Data Retrieval Failed</p>
            <p className="text-content-tertiary text-xs font-mono">Please verify network connection and try again.</p>
          </div>
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {/* Main Stats Card */}
          <div className="bg-surface/60 backdrop-blur-xl border border-border/50 rounded-[12px] p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden group opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="mb-8 relative z-10">
              <div className="text-content-tertiary text-[10px] font-mono tracking-widest uppercase font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_5px_rgba(46,232,144,0.8)]" />
                Total_Value
              </div>
              <div className="text-5xl md:text-6xl font-mono font-bold text-content-primary tracking-tighter mb-2 flex items-baseline gap-3">
                {totalValueOkb.toFixed(4)} <span className="text-2xl text-accent-primary opacity-80">OKB</span>
              </div>
            </div>

            <div className="border-t border-border/30 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-[#0A0A0A] border border-border/50 rounded-[12px] p-5 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                <div className="text-content-tertiary text-[10px] font-mono tracking-widest uppercase mb-2">
                  Tokens_Held
                </div>
                <div className="text-2xl font-mono font-bold text-content-primary">{holdings.length}</div>
              </div>
              <div className="bg-[#0A0A0A] border border-border/50 rounded-[12px] p-5 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                <div className="text-content-tertiary text-[10px] font-mono tracking-widest uppercase mb-2">
                  Realized_PnL
                </div>
                <div className={`text-2xl font-mono font-bold ${realizedPnlOkb >= 0 ? "text-accent-success drop-shadow-[0_0_8px_rgba(46,232,144,0.4)]" : "text-accent-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`}>
                  {realizedPnlOkb >= 0 ? "+" : ""}{realizedPnlOkb.toFixed(4)} OKB
                </div>
              </div>
              <div className="bg-[#0A0A0A] border border-border/50 rounded-[12px] p-5 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]">
                <div className="text-content-tertiary text-[10px] font-mono tracking-widest uppercase mb-2">
                  Wallet_Address
                </div>
                <div className="text-2xl font-mono font-bold text-content-primary">{shortAddr(walletAddress || "")}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-border/30 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={() => { setActiveTab("holdings"); setHoldingsPage(1); }}
              className={`pb-4 relative font-mono uppercase tracking-widest text-[12px] font-bold cursor-pointer transition-all duration-300 ${
                activeTab === "holdings"
                  ? "text-accent-primary"
                  : "text-content-tertiary hover:text-content-primary"
              }`}
            >
              Holdings
              {activeTab === "holdings" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_10px_rgba(46,232,144,0.8)]" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("history"); setHistoryPage(1); }}
              className={`pb-4 relative font-mono uppercase tracking-widest text-[12px] font-bold cursor-pointer transition-all duration-300 ${
                activeTab === "history"
                  ? "text-accent-primary"
                  : "text-content-tertiary hover:text-content-primary"
              }`}
            >
              History
              {activeTab === "history" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_10px_rgba(46,232,144,0.8)]" />
              )}
            </button>
          </div>

          {/* Holdings Table */}
          {activeTab === "holdings" && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-surface/40 backdrop-blur-md rounded-[12px] border border-border/50 overflow-x-auto shadow-xl">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border/30 text-content-tertiary text-[10px] font-mono uppercase tracking-widest bg-[#0A0A0A]/50">
                    <th className="px-6 py-4 font-semibold">TOKEN</th>
                    <th className="px-6 py-4 font-semibold">BALANCE</th>
                    <th className="px-6 py-4 font-semibold">AVG COST</th>
                    <th className="px-6 py-4 font-semibold">PRICE</th>
                    <th className="px-6 py-4 font-semibold">VALUE</th>
                    <th className="px-6 py-4 font-semibold text-right">PNL</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-transparent">
                  {holdings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <p className="text-content-tertiary text-sm font-mono uppercase tracking-widest">No holdings yet</p>
                        <p className="text-content-tertiary/50 text-[10px] font-mono mt-1">Your tokens will appear here after your first trade</p>
                      </td>
                    </tr>
                  )}
                  {paginatedHoldings.map((h, idx) => {
                    const pnlOkb = fmtOkb(h.unrealizedPnlOkb);
                    const isPositive = pnlOkb >= 0;
                    const hAvatarSrc = resolveIpfsUrl(h.avatarUrl);
                    return (
                      <tr key={idx} className="hover:bg-[#0A0A0A] transition-colors group cursor-pointer border-l-2 border-transparent hover:border-accent-primary">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {hAvatarSrc ? (
                              <Image
                                src={hAvatarSrc}
                                alt={h.symbol}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                                unoptimized
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
                                style={{ background: getBgColor(h.symbol) }}
                              >
                                {h.symbol.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-content-primary group-hover:text-accent-primary transition-colors">
                                {h.name}
                              </div>
                              <div className="text-xs text-content-tertiary">{h.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium font-mono text-content-primary">
                          {fmtTokenBalance(h.balance)}
                        </td>
                        <td className="px-6 py-4 font-medium text-content-secondary font-mono">
                          {fmtOkbCompact(h.avgCostOkb)} OKB
                        </td>
                        <td className="px-6 py-4 font-medium text-content-secondary font-mono">
                          {fmtOkbCompact(h.currentPriceOkb)} OKB
                        </td>
                        <td className="px-6 py-4 font-semibold font-mono text-content-primary">
                          {fmtOkbCompact(h.currentValueOkb)} OKB
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-semibold font-mono ${isPositive ? "text-accent-success" : "text-accent-danger"}`}>
                            {isPositive ? "+" : ""}{pnlOkb.toFixed(4)} OKB
                          </div>
                          <div className={`text-xs font-mono ${isPositive ? "text-accent-success" : "text-accent-danger"}`}>
                            {h.pnlPercent}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={h.tradeUrl}
                            className="px-4 py-1.5 rounded-[8px] text-[11px] font-mono font-bold tracking-widest uppercase bg-[#111] hover:bg-accent-primary hover:text-surface-base text-content-primary border border-border/50 hover:border-accent-primary transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(46,232,144,0.3)] inline-block"
                          >
                            VIEW
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={holdingsPage}
                totalPages={holdingsTotalPages}
                onPageChange={setHoldingsPage}
              />
            </div>
            </div>
          )}

          {/* History Table */}
          {activeTab === "history" && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-surface/40 backdrop-blur-md rounded-[12px] border border-border/50 overflow-x-auto shadow-xl">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border/30 text-content-tertiary text-[10px] font-mono uppercase tracking-widest bg-[#0A0A0A]/50">
                    <th className="px-6 py-4 font-semibold">TIME</th>
                    <th className="px-6 py-4 font-semibold">TOKEN</th>
                    <th className="px-6 py-4 font-semibold">TYPE</th>
                    <th className="px-6 py-4 font-semibold">OKB</th>
                    <th className="px-6 py-4 font-semibold">AMOUNT</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 bg-transparent">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-content-tertiary text-sm font-mono uppercase tracking-widest">No transaction history</p>
                        <p className="text-content-tertiary/50 text-[10px] font-mono mt-1">Your trades will appear here once you start trading</p>
                      </td>
                    </tr>
                  )}
                  {paginatedHistory.map((item, idx) => {
                    const okbVal = fmtOkb(item.okbAmount);
                    const displayType = toTradeSide(item.type);
                    const isMint = displayType === "mint";
                    const isBurn = displayType === "burn";
                    const isTransferIn = item.type === "TRANSFER_IN";
                    const isTransferOut = item.type === "TRANSFER_OUT";
                    const hasOkbFlow = isMint || isBurn;
                    const okbPrefix = isMint ? "-" : isBurn ? "+" : "";
                    const tokenPrefix = isMint || isTransferIn ? "+" : isBurn || isTransferOut ? "-" : "";
                    const histAvatarSrc = resolveIpfsUrl(item.token.avatarUrl);
                    return (
                      <tr key={idx} className="hover:bg-[#0A0A0A] transition-colors group cursor-pointer border-l-2 border-transparent hover:border-accent-primary">
                        <td className="px-6 py-4 text-content-tertiary font-mono text-[12px]">{timeAgo(item.ts, Date.now())}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {histAvatarSrc ? (
                              <Image
                                src={histAvatarSrc}
                                alt={item.token.symbol}
                                width={24}
                                height={24}
                                className="rounded object-cover"
                                unoptimized
                              />
                            ) : (
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px]"
                                style={{ background: getBgColor(item.token.symbol) }}
                              >
                                {item.token.symbol.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-semibold text-content-primary">{item.token.name}</span>
                              <span className="text-xs text-content-tertiary">{item.token.symbol}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isMint ? "bg-accent-success/10 text-accent-success" : "bg-accent-danger/10 text-accent-danger"
                          }`}>
                            {displayType}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-mono font-medium ${isMint ? "text-content-secondary" : isBurn ? "text-accent-success" : "text-content-tertiary"}`}>
                          {okbPrefix}{okbVal.toFixed(4)} OKB
                        </td>
                        <td className={`px-6 py-4 font-mono font-medium ${isMint || isTransferIn ? "text-accent-success" : hasOkbFlow || isTransferOut ? "text-content-secondary" : "text-content-tertiary"}`}>
                          {tokenPrefix}{fmtTokenBalance(item.tokenAmount)} {item.token.symbol}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={item.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-content-tertiary hover:text-content-primary transition-colors inline-flex"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={historyPage}
                totalPages={historyTotalPages}
                onPageChange={setHistoryPage}
              />
            </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
