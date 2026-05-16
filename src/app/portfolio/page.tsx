"use client";

import { useState, useCallback } from "react";
import { Check, Copy, ExternalLink, Wallet } from "lucide-react";
import { Pagination } from "@/components/explore/Pagination";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePortfolio, usePortfolioHistory } from "@/lib/api-hooks";

import { timeAgo } from "@/lib/time-display";
import { toTradeSide } from "@/lib/trade-display";

function fmtOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return isNaN(n) ? 0 : n;
}

function fmtOkbCompact(wei: string): string {
  const n = fmtOkb(wei);
  if (n < 0.0001) return n.toExponential(2);
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
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-surface-highlight rounded" />
        </td>
      ))}
    </tr>
  );
}

function PortfolioSkeleton() {
  return (
    <>
      {/* Stats card skeleton */}
      <div className="bg-surface rounded-xl border border-border p-6 md:p-8 mb-8 animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-3 w-20 bg-surface-highlight rounded" />
          <div className="h-12 w-56 bg-surface-highlight rounded" />
        </div>
        <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-surface-highlight rounded" />
            <div className="h-7 w-12 bg-surface-highlight rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-surface-highlight rounded" />
            <div className="h-7 w-24 bg-surface-highlight rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-surface-highlight rounded" />
            <div className="h-7 w-28 bg-surface-highlight rounded" />
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        <div className="h-8 w-20 bg-surface-highlight rounded animate-pulse" />
        <div className="h-8 w-16 bg-surface-highlight rounded animate-pulse" />
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-3 w-14 bg-surface-highlight rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={7} />
            ))}
          </tbody>
        </table>
      </div>
    </>
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
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-highlight border border-border flex items-center justify-center">
            <Wallet className="w-8 h-8 text-content-tertiary" />
          </div>
          <div>
            <p className="text-content-primary text-lg font-semibold mb-1">No wallet connected</p>
            <p className="text-content-tertiary text-sm">Connect your wallet to view your portfolio and trading history</p>
          </div>
          <button
            onClick={openConnectModal}
            className="px-5 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            Connect Wallet
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
    <div className="flex-1 w-full max-w-[1260px] mx-auto px-4 py-8 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-content-primary tracking-tight">Portfolio</h1>
          <p className="text-content-tertiary text-sm mt-1">Your holdings and transaction history</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border text-sm">
          <span className="text-content-secondary font-mono">{walletAddress ? shortAddr(walletAddress) : "..."}</span>
          {copied ? (
            <Check className="w-4 h-4 text-accent-primary" />
          ) : (
            <Copy
              className="w-4 h-4 text-content-tertiary cursor-pointer hover:text-content-primary transition-colors"
              onClick={handleCopyAddress}
            />
          )}
          <span className="text-content-tertiary ml-1">(you)</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <PortfolioSkeleton />}

      {/* Error */}
      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-danger/10 border border-accent-danger/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-danger"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p className="text-content-primary text-sm font-medium mb-1">Failed to load portfolio</p>
            <p className="text-content-tertiary text-xs">Please check your connection and try again.</p>
          </div>
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {/* Main Stats Card */}
          <div className="bg-surface rounded-xl border border-border p-6 md:p-8 mb-8">
            <div className="mb-8">
              <div className="text-content-tertiary text-xs font-medium mb-2">
                Total Value
              </div>
              <div className="text-5xl font-mono font-bold text-content-primary tracking-tight mb-2">
                {totalValueOkb.toFixed(4)} OKB
              </div>
            </div>

            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-content-tertiary text-xs font-medium mb-2">
                  Tokens Held
                </div>
                <div className="text-xl font-mono font-bold text-content-primary">{holdings.length}</div>
              </div>
              <div>
                <div className="text-content-tertiary text-xs font-medium mb-2">
                  Realized PnL
                </div>
                <div className={`text-xl font-mono font-bold ${realizedPnlOkb >= 0 ? "text-accent-success" : "text-accent-danger"}`}>
                  {realizedPnlOkb >= 0 ? "+" : ""}{realizedPnlOkb.toFixed(4)} OKB
                </div>
              </div>
              <div>
                <div className="text-content-tertiary text-xs font-medium mb-2">
                  Wallet
                </div>
                <div className="text-xl font-mono font-bold text-content-primary">{shortAddr(walletAddress || "")}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border mb-6">
            <button
              onClick={() => { setActiveTab("holdings"); setHoldingsPage(1); }}
              className={`pb-3 border-b-2 font-medium cursor-pointer transition-colors ${
                activeTab === "holdings"
                  ? "border-accent-success text-content-primary"
                  : "border-transparent text-content-tertiary hover:text-content-primary"
              }`}
            >
              Holdings
            </button>
            <button
              onClick={() => { setActiveTab("history"); setHistoryPage(1); }}
              className={`pb-3 border-b-2 font-medium cursor-pointer transition-colors ${
                activeTab === "history"
                  ? "border-accent-success text-content-primary"
                  : "border-transparent text-content-tertiary hover:text-content-primary"
              }`}
            >
              History
            </button>
          </div>

          {/* Holdings Table */}
          {activeTab === "holdings" && (
            <>
            <div className="bg-transparent rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-content-tertiary text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">TOKEN</th>
                    <th className="px-6 py-4 font-semibold">BALANCE</th>
                    <th className="px-6 py-4 font-semibold">AVG COST</th>
                    <th className="px-6 py-4 font-semibold">PRICE</th>
                    <th className="px-6 py-4 font-semibold">VALUE</th>
                    <th className="px-6 py-4 font-semibold text-right">PNL</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {holdings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <p className="text-content-tertiary text-sm">No holdings yet</p>
                        <p className="text-content-tertiary/50 text-xs mt-1">Your tokens will appear here after your first trade</p>
                      </td>
                    </tr>
                  )}
                  {paginatedHoldings.map((h, idx) => {
                    const pnlOkb = fmtOkb(h.unrealizedPnlOkb);
                    const isPositive = pnlOkb >= 0;
                    return (
                      <tr key={idx} className="hover:bg-surface-highlight/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
                              style={{ background: getBgColor(h.symbol) }}
                            >
                              {h.symbol.slice(0, 2).toUpperCase()}
                            </div>
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
                          {fmtOkbCompact(h.avgCostOkb)}
                        </td>
                        <td className="px-6 py-4 font-medium text-content-secondary font-mono">
                          {fmtOkbCompact(h.currentPriceOkb)}
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
                            className="px-4 py-1.5 rounded text-sm font-medium bg-surface-elevated hover:bg-surface-highlight text-content-primary border border-border transition-colors"
                          >
                            Trade
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={holdingsPage}
              totalPages={holdingsTotalPages}
              onPageChange={setHoldingsPage}
            />
            </>
          )}

          {/* History Table */}
          {activeTab === "history" && (
            <>
            <div className="bg-transparent rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-content-tertiary text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">TIME</th>
                    <th className="px-6 py-4 font-semibold">TOKEN</th>
                    <th className="px-6 py-4 font-semibold">TYPE</th>
                    <th className="px-6 py-4 font-semibold">OKB</th>
                    <th className="px-6 py-4 font-semibold">AMOUNT</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-content-tertiary text-sm">No transaction history</p>
                        <p className="text-content-tertiary/50 text-xs mt-1">Your trades will appear here once you start trading</p>
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
                    return (
                      <tr key={idx} className="hover:bg-surface-highlight/30 transition-colors group">
                        <td className="px-6 py-4 text-content-tertiary">{timeAgo(item.ts, Date.now())}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px]"
                              style={{ background: getBgColor(item.token.symbol) }}
                            >
                              {item.token.symbol.slice(0, 2).toUpperCase()}
                            </div>
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
            <Pagination
              currentPage={historyPage}
              totalPages={historyTotalPages}
              onPageChange={setHistoryPage}
            />
            </>
          )}
        </>
      )}
    </div>
  );
}
