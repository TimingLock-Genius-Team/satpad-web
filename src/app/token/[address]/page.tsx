"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { TokenChart } from "@/components/token/TokenChart";
import { TokenActivityPanels } from "@/components/token/TokenActivityPanels";
import { Copy, ExternalLink, Send, Globe, Check, RefreshCw, FileCode2 } from "lucide-react";
import Link from "next/link";
import { useTokenChart, useTokenDetail, useTokenSummary } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { getDefaultChain } from "@/config/chains";
import { buildUniswapLinks } from "@/lib/uniswap-links";
import { formatBpsPercent } from "@/lib/quote-breakdown";
import { fmtTokenDisplay, formatSmallNumber } from "@/lib/trade-display";

import { sanitizeUrl } from "@/utils/sanitizeUrl";

const TradePanel = dynamic(
  () => import("./TradePanel").then((m) => ({ default: m.TradePanel })),
  {
    loading: () => <div className="h-[400px] rounded-card bg-surface animate-pulse" />,
  }
);

const TokenPriceTimeChart = dynamic(
  () =>
    import("@/components/token/TokenPriceTimeChart").then((m) => ({
      default: m.TokenPriceTimeChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-[300px] rounded-card bg-surface animate-pulse" />,
  }
);

const SatoIssuanceChart = dynamic(
  () =>
    import("@/components/token/SatoIssuanceChart").then((m) => ({
      default: m.SatoIssuanceChart,
    })),
  {
    ssr: false,
    loading: () => <div className="h-[300px] rounded-card bg-surface animate-pulse" />,
  }
);

function chainForId() {
  return getDefaultChain();
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function parseOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return isNaN(n) ? 0 : n;
}

function fmtOkbCompact(wei: string): string {
  const okb = parseOkb(wei);
  if (okb < 0.001) return formatSmallNumber(okb);
  return okb.toFixed(4);
}

function fmtOptionalOkbCompact(wei: string | null | undefined): string {
  return wei ? `${fmtOkbCompact(wei)} OKB` : "--";
}

function parseTokenAmount(amount: string): number | null {
  const match = amount.trim().replace(/,/g, "").match(/^(\d*\.?\d+)\s*([kmb])?$/i);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  const suffix = match[2]?.toLowerCase();
  const multiplier =
    suffix === "k" ? 1_000 :
    suffix === "m" ? 1_000_000 :
    suffix === "b" ? 1_000_000_000 :
    1;

  return value * multiplier;
}

const getTokenColorRGB = (symbol: string) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  return `${(r % 150) + 40}, ${(g % 150) + 40}, ${(b % 150) + 40}`;
};

function TokenDetailSkeleton() {
  return (
    <div className="w-full bg-surface-base min-h-screen text-content-primary p-4 md:p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,360px)] gap-8 items-start">
          <div className="flex flex-col gap-8">
            <div className="border border-border p-6 rounded-card bg-surface">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl bg-surface-highlight animate-pulse" />
                <div className="flex flex-col gap-3 pt-1 flex-1">
                  <div className="h-9 w-48 bg-surface-highlight rounded-lg animate-pulse" />
                  <div className="h-7 w-72 bg-surface-highlight rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="mt-6 p-5 rounded-xl bg-surface-base/80 border border-border/40">
                <div className="flex justify-between items-end">
                  <div className="h-9 w-24 bg-surface-highlight rounded animate-pulse" />
                  <div className="h-5 w-36 bg-surface-highlight rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-full bg-surface-highlight rounded-full mt-4 animate-pulse" />
              </div>
            </div>
            {/* Chart skeleton */}
            <div className="border border-border p-4 md:p-5 rounded-card bg-surface h-[400px] animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-4 w-16 bg-surface-highlight rounded" />
                <div className="h-4 w-12 bg-surface-highlight rounded" />
                <div className="h-4 w-12 bg-surface-highlight rounded" />
              </div>
              <div className="h-[320px] bg-surface-highlight rounded-lg" />
            </div>
          </div>
          {/* Trade panel skeleton */}
          <div className="border border-border p-6 rounded-card bg-surface h-[420px] animate-pulse">
            <div className="flex gap-0 mb-6 rounded-input overflow-hidden">
              <div className="flex-1 h-10 bg-surface-highlight" />
              <div className="flex-1 h-10 bg-surface-base border-l border-border" />
            </div>
            <div className="h-16 bg-surface-highlight rounded-input mb-3" />
            <div className="h-24 bg-surface-highlight/50 rounded-input mb-4" />
            <div className="h-12 bg-surface-highlight rounded-input mt-auto" />
          </div>
        </div>
        {/* Sato data skeleton */}
        <div className="h-48 bg-surface rounded-card border border-border animate-pulse" />
        {/* Activity panels skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          <div className="h-64 bg-surface rounded-card border border-border animate-pulse" />
          <div className="h-64 bg-surface rounded-card border border-border animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function TokenDetailPage() {
  const params = useParams();
  const address = params.address as string;

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const activeChain = chainForId();
  const queryClient = useQueryClient();

  const handleCopyAddress = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  const handleViewExplorer = useCallback(() => {
    const explorer = activeChain.blockExplorers?.default;
    if (explorer && address) {
      window.open(`${explorer.url}/address/${address}`, "_blank");
    }
  }, [activeChain, address]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["token-detail", address] }),
      queryClient.invalidateQueries({ queryKey: ["token-summary", address] }),
      queryClient.invalidateQueries({ queryKey: ["token-chart", address] }),
      queryClient.invalidateQueries({ queryKey: ["token-trades", address] }),
      queryClient.invalidateQueries({ queryKey: ["token-holders", address] }),
    ]);
    setTimeout(() => setRefreshing(false), 600);
  }, [address, queryClient]);

  const { data: detail, isLoading: detailLoading, error: detailError } = useTokenDetail(address);
  const { isLoading: summaryLoading } = useTokenSummary(address);
  const { data: chart } = useTokenChart(address, { range: "24h", interval: "10m" });

  if (detailLoading || summaryLoading) {
    return <TokenDetailSkeleton />;
  }

  if (detailError || !detail) {
    notFound();
  }

  const token = detail.token;
  const satoData = detail.satoData;
  const socials = detail.socials;
  const avatarSrc = resolveIpfsUrl(token.avatarUrl);
  const volumeOkb = satoData.volume24hOkb ? parseOkb(satoData.volume24hOkb).toFixed(2) : "--";
  const maxSupply = satoData.maxSupply ?? token.totalAmount;
  const circulatingSupply = satoData.circulatingSupply ?? token.mintedAmount;
  const fdMarketCapOkb = token.mcap ?? "--";
  const circulatingMarketCapOkb = fmtOptionalOkbCompact(satoData.marketCapOkb);
  const mintedAmount = parseTokenAmount(token.mintedAmount);
  const totalAmount = parseTokenAmount(token.totalAmount);
  const progress = mintedAmount !== null && totalAmount !== null && totalAmount > 0
    ? (mintedAmount / totalAmount) * 100
    : 0;
  const isGraduated = Boolean(token.isGraduated);
  const isMigrated = Boolean(token.isMigrated || detail?.migration?.isMigrated);
  const uniswapLinks = buildUniswapLinks(address);
  const taxBurnedTokens = satoData.taxBurnedTokens ?? token.taxBurnedTokens;
  const burnTaxMinBps = token.curve?.burnTaxMinBps;
  const burnTaxMaxBps = token.curve?.burnTaxMaxBps;
  const tokenRGB = getTokenColorRGB(token.symbol);

  return (
    <div 
      className="w-full relative min-h-screen text-content-primary p-4 md:p-8 font-sans"
      style={{ '--token-rgb': tokenRGB } as React.CSSProperties}
    >
      {/* Full Page Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen animate-blob opacity-20" style={{ backgroundColor: `rgb(var(--token-rgb))` }} />
        <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[150px] mix-blend-screen animate-blob opacity-10" style={{ backgroundColor: `rgb(var(--token-rgb))`, animationDelay: '4s' }} />
      </div>

      <div className="max-w-[1200px] mx-auto space-y-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,360px)] gap-8 items-start relative">
          {/* Left Column */}
          <div className="flex flex-col gap-8 min-w-0">
            {/* Token Header */}
            <div className="animated-border-wrapper shadow-2xl" style={{ '--token-rgb': tokenRGB } as React.CSSProperties}>
            <div className="bg-surface/60 backdrop-blur-xl p-3.5 sm:p-4 rounded-[22px] flex flex-col sm:flex-row gap-4 sm:gap-5 relative overflow-hidden group">
              {/* Ambient Glow in Card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--token-rgb))] rounded-full blur-[100px] opacity-[0.15] pointer-events-none" />
              
              {/* Left: Avatar */}
              <div className="relative w-full sm:w-[136px] sm:h-[136px] aspect-square sm:aspect-auto flex-shrink-0 z-10">
                {avatarSrc ? (
                  <Image src={avatarSrc} alt={token.symbol} fill className="object-cover rounded-[16px] shadow-lg border border-white/5" unoptimized />
                ) : (
                  <div 
                    className="w-full h-full rounded-[16px] flex items-center justify-center text-4xl font-bold text-white shadow-lg border border-white/5"
                    style={{ background: `linear-gradient(135deg, rgba(var(--token-rgb), 0.8), rgba(var(--token-rgb), 0.4))` }}
                  >
                    {token.symbol.substring(0, 2)}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex flex-col flex-1 justify-between min-w-0 py-0.5 z-10">
                {/* Top Section */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <h1 className="text-[32px] font-bold text-content-primary truncate leading-none">{token.name}</h1>
                      <div className="px-1.5 py-0.5 bg-surface-highlight rounded text-[11px] font-mono font-bold text-content-secondary border border-border/50 flex items-center justify-center h-fit transform -translate-y-[1px]">
                        ${token.symbol}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={handleRefresh}
                        className="p-1 text-content-tertiary hover:text-content-primary transition-colors"
                        title="Refresh data"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                      </button>
                      <div className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary text-xs font-bold rounded">
                        Live
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-1 flex items-center gap-2">
                    {!isGraduated && (
                      <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary text-[11px] font-semibold rounded">
                        Meme
                      </span>
                    )}
                    <Link 
                      href="/docs/specs/v4-sell-tax" 
                      className="px-2 py-0.5 border border-[rgb(var(--token-rgb),0.4)] bg-[rgb(var(--token-rgb),0.1)] text-[rgb(var(--token-rgb))] hover:bg-[rgb(var(--token-rgb),0.2)] transition-all duration-300 text-[10px] font-mono uppercase tracking-widest rounded flex items-center gap-1.5 group/spec cursor-pointer relative overflow-hidden shadow-[0_0_8px_rgba(var(--token-rgb),0.1)] hover:shadow-[0_0_12px_rgba(var(--token-rgb),0.3)]"
                    >
                      <span className="absolute inset-0 bg-[rgb(var(--token-rgb),0.2)] translate-y-[100%] group-hover/spec:translate-y-0 transition-transform duration-300"></span>
                      <span className="w-1 h-1 rounded-full bg-[rgb(var(--token-rgb))] shadow-[0_0_5px_rgb(var(--token-rgb))] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                      <span className="relative z-10 drop-shadow-[0_0_8px_rgba(var(--token-rgb),0.5)] font-bold">V4_TAX_SPEC</span>
                      <FileCode2 className="w-3 h-3 relative z-10 group-hover/spec:scale-110 transition-transform" />
                    </Link>
                    {(socials?.twitter || socials?.telegram || socials?.website) && (
                      <div className="flex items-center gap-2 text-content-tertiary ml-1">
                        {sanitizeUrl(socials?.twitter) && <a href={sanitizeUrl(socials.twitter)} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><XIcon className="w-3 h-3" /></a>}
                        {sanitizeUrl(socials?.telegram) && <a href={sanitizeUrl(socials.telegram)} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><Send className="w-3 h-3" /></a>}
                        {sanitizeUrl(socials?.website) && <a href={sanitizeUrl(socials.website)} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><Globe className="w-3 h-3" /></a>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col gap-1 mt-4 sm:mt-0">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-content-tertiary flex-shrink-0">address:</span>
                    <div className="flex items-center min-w-0 overflow-hidden ml-2 bg-surface-base rounded-md border border-border/50">
                      <div 
                        className="flex items-center gap-1.5 text-content-primary cursor-pointer group truncate px-2 py-1 hover:bg-surface-highlight transition-colors flex-1"
                        onClick={handleCopyAddress}
                        title={token.address}
                      >
                        <span className="truncate group-hover:text-accent-primary transition-colors font-mono text-[12px]">
                          {token.address}
                        </span>
                        {copied ? <Check className="w-3 h-3 text-accent-primary flex-shrink-0" /> : <Copy className="w-3 h-3 text-content-tertiary group-hover:text-accent-primary transition-all flex-shrink-0" />}
                      </div>
                      <div className="w-[1px] h-3.5 bg-border/50 flex-shrink-0" />
                      <div 
                        className="text-content-tertiary cursor-pointer hover:text-content-primary hover:bg-surface-highlight transition-all p-1.5 flex-shrink-0"
                        onClick={handleViewExplorer}
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-content-tertiary">Market Cap:</span>
                    <span className="text-content-primary font-medium">{circulatingMarketCapOkb}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        {/* Bar background with grad notch highlight */}
                        <div className="h-2.5 bg-surface-base -skew-x-12 overflow-visible rounded-sm border border-border/30 relative">
                          {/* 80% graduation zone highlight strip */}
                          <div
                            className="absolute top-0 h-full w-[3px] bg-accent-primary/15 z-0"
                            style={{ left: '80%' }}
                          />
                          <div
                            className="h-full bg-accent-primary transition-all duration-1000 ease-out relative z-10"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        {/* Graduation beacon marker at 80% */}
                        <div className="absolute inset-0 pointer-events-none z-20" style={{ top: '-28px', height: 'calc(100% + 28px)' }}>
                          <div className="absolute flex flex-col items-center" style={{ left: '80%', transform: 'translateX(-50%)' }}>
                            {/* GRAD label */}
                            <span
                              className="text-[10px] font-bold text-accent-primary tracking-[0.15em] uppercase mb-0.5"
                              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                            >
                              GRAD
                            </span>
                            {/* Glow ring behind diamond */}
                            <div
                              className="w-5 h-5 rounded-full animate-glow-pulse absolute"
                              style={{
                                top: '12px',
                                background: 'radial-gradient(circle, rgba(46,232,144,0.5) 0%, transparent 70%)',
                              }}
                            />
                            {/* Diamond pin */}
                            <div
                              className="w-2 h-2 bg-accent-primary rotate-45 flex-shrink-0 relative z-10"
                              style={{
                                boxShadow: '0 0 6px rgba(46,232,144,0.6), 0 0 12px rgba(46,232,144,0.3)',
                              }}
                            />
                            {/* Dashed guideline down to bar */}
                            <div className="flex flex-col items-center gap-1 mt-0.5">
                              <div className="w-px h-1.5 bg-accent-primary/60" />
                              <div className="w-px h-1.5 bg-accent-primary/40" />
                              <div className="w-px h-1.5 bg-accent-primary/25" />
                              <div className="w-px h-2 bg-accent-primary/15" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-accent-primary text-[13px] font-bold w-16 text-right">
                        {progress.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-content-tertiary">
                      <span>Minted</span>
                      <span className="font-mono">
                        <span className="text-content-primary">{token.mintedAmount}</span> / {token.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Chart */}
            <TokenChart
              curve={token.curve}
              reserveOkbWei={satoData.reserveOkb}
              marketPriceOkbWei={satoData.marketPriceOkb}
              burnPriceOkbWei={satoData.burnPriceOkb}
              mintPriceOkbWei={satoData.mintPriceOkb}
              mintedAmount={token.mintedAmount}
              totalAmount={token.totalAmount}
              progressPercent={progress}
            />
          </div>

          {/* Right Column: Trade Panel */}
          <div>
            <TradePanel
              tokenAddress={address}
              tokenSymbol={token.symbol}
              tokenPriceOkb={token.priceOkb}
              progress={progress}
              isGraduated={isGraduated}
              isMigrated={isMigrated}
              uniswapLinks={uniswapLinks}
            />
          </div>
        </div>

        {/* Sato Data */}
        <div className="pt-2 relative z-10">
          {/* Tech-styled Header */}
          <div className="flex items-center gap-4 mb-6 relative cursor-pointer">
            {/* Tech Icon/Node */}
            <div className="relative flex items-center justify-center">
              <div 
                className="w-8 h-8 rounded border border-[rgba(var(--token-rgb),0.3)] flex items-center justify-center"
                style={{ animation: 'spin 6s linear infinite' }}
              >
                <div 
                  className="w-2 h-2 bg-[rgb(var(--token-rgb))] shadow-[0_0_8px_rgb(var(--token-rgb))]"
                  style={{ animation: 'spin 3s linear infinite reverse' }}
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[rgb(var(--token-rgb))] font-mono text-[9px] font-bold tracking-[0.3em] uppercase opacity-70">
                  Data_Node
                </span>
                <span className="text-content-tertiary font-mono text-[9px]">{"// 0x01"}</span>
              </div>
              <h2 className="text-content-primary font-bold text-sm uppercase tracking-[0.25em] flex items-center gap-2 drop-shadow-[0_0_12px_rgba(var(--token-rgb),0.4)]">
                sato data
                <span className="inline-block w-1.5 h-4 bg-[rgb(var(--token-rgb))] opacity-80 animate-pulse ml-1" />
              </h2>
            </div>
            
            {/* Connecting Line & Circuit pattern */}
            <div className="flex-1 flex items-center ml-2 opacity-60 hidden sm:flex translate-y-1.5">
              <div className="h-px flex-1 bg-gradient-to-r from-[rgb(var(--token-rgb))] to-transparent" />
              <div className="flex gap-1.5 mr-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_8px_rgb(var(--token-rgb))]" />
                <div className="w-1.5 h-1.5 rounded-full border border-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_4px_rgba(var(--token-rgb),0.5)]" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full border border-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_4px_rgba(var(--token-rgb),0.5)]" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
          <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[12px] shadow-2xl relative overflow-hidden group/card transition-colors duration-500 hover:border-[rgba(var(--token-rgb),0.25)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--token-rgb))] rounded-full blur-[120px] opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-500" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6 text-[11px] relative z-10">
              {/* SUPPLY */}
              <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">SUPPLY</div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">max</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{maxSupply}</span>
                </div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">circulating</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{circulatingSupply}</span>
                </div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">holders</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{satoData.holders}</span>
                </div>
                {taxBurnedTokens && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-content-secondary">burned</span>
                    <span className="text-content-primary font-mono font-medium">{fmtTokenDisplay(taxBurnedTokens)}</span>
                  </div>
                )}
              </div>

              {/* PRICE */}
              <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">PRICE</div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">market</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{fmtOkbCompact(satoData.marketPriceOkb)} OKB</span>
                </div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">reserve</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{fmtOkbCompact(satoData.reserveOkb)} OKB</span>
                </div>
                {burnTaxMinBps !== undefined && burnTaxMaxBps !== undefined && (
                  <div className="flex flex-col gap-1.5 pt-1 mt-1 border-t border-border/30">
                    <div className="flex justify-between items-baseline group/row">
                      <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">burn tax</span>
                      <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">
                        {formatBpsPercent(burnTaxMaxBps)} → {formatBpsPercent(burnTaxMinBps)}
                      </span>
                    </div>
                    <Link href="/docs/specs/v4-sell-tax" className="flex items-center justify-end gap-1 text-[9px] font-mono tracking-widest uppercase text-[rgb(var(--token-rgb),0.7)] hover:text-[rgb(var(--token-rgb))] transition-colors group/link">
                      <span>View_Spec</span>
                      <ExternalLink className="w-2 h-2 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>

              {/* VALUATION */}
              <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">VALUATION</div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">mcap (fd)</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{fdMarketCapOkb}</span>
                </div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">mcap (circ)</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{circulatingMarketCapOkb}</span>
                </div>
              </div>

              {/* RESERVE */}
              <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">RESERVE</div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">liquidity</span>
                  <div className="text-right">
                    <div className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{fmtOkbCompact(satoData.reserveOkb)} OKB</div>
                  </div>
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="flex flex-col gap-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">ACTIVITY</div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">vol 24h</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{volumeOkb} OKB</span>
                </div>
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-secondary group-hover/row:text-content-primary transition-colors">txns 24h</span>
                  <span className="text-content-primary font-mono font-medium group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{satoData.txns24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TokenActivityPanels address={address} />

        {/* Price and Issuance */}
        <div className="pt-2 relative z-10">
          <div className="flex items-center gap-4 mb-6 relative cursor-pointer">
            <div className="relative flex items-center justify-center">
              <div 
                className="w-8 h-8 rounded border border-[rgba(var(--token-rgb),0.3)] flex items-center justify-center"
                style={{ animation: 'spin 6s linear infinite' }}
              >
                <div 
                  className="w-2 h-2 bg-[rgb(var(--token-rgb))] shadow-[0_0_8px_rgb(var(--token-rgb))]"
                  style={{ animation: 'spin 3s linear infinite reverse' }}
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[rgb(var(--token-rgb))] font-mono text-[9px] font-bold tracking-[0.3em] uppercase opacity-70">
                  Market_Node
                </span>
                <span className="text-content-tertiary font-mono text-[9px]">{"// 0x02"}</span>
              </div>
              <h2 className="text-content-primary font-bold text-sm uppercase tracking-[0.25em] flex items-center gap-2 drop-shadow-[0_0_12px_rgba(var(--token-rgb),0.4)]">
                price & issuance
                <span className="inline-block w-1.5 h-4 bg-[rgb(var(--token-rgb))] opacity-80 animate-pulse ml-1" />
              </h2>
            </div>
            
            <div className="flex-1 flex items-center ml-2 opacity-60 hidden sm:flex translate-y-1.5">
              <div className="h-px flex-1 bg-gradient-to-r from-[rgb(var(--token-rgb))] to-transparent" />
              <div className="flex gap-1.5 mr-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_8px_rgb(var(--token-rgb))]" />
                <div className="w-1.5 h-1.5 rounded-full border border-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_4px_rgba(var(--token-rgb),0.5)]" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full border border-[rgb(var(--token-rgb))] animate-pulse shadow-[0_0_4px_rgba(var(--token-rgb),0.5)]" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="flex flex-col gap-3 bg-surface/60 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[12px] shadow-2xl relative overflow-hidden group/card transition-colors duration-500 hover:border-[rgba(var(--token-rgb),0.25)] content-visibility-auto">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[rgb(var(--token-rgb))] rounded-full blur-[100px] opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-500" />
              <div className="flex justify-between items-center text-xs relative z-10">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">price over time</span>
                <span className="text-content-tertiary text-[10px]">now: <span className="text-content-primary font-mono font-medium">{fmtOkbCompact(satoData.marketPriceOkb)} OKB</span></span>
              </div>
              <div className="flex-1 relative z-10">
                <TokenPriceTimeChart
                  points={chart?.points}
                  currentPriceOkbWei={satoData.marketPriceOkb}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-surface/60 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[12px] shadow-2xl relative overflow-hidden group/card transition-colors duration-500 hover:border-[rgba(var(--token-rgb),0.25)] content-visibility-auto">
              <div className="absolute top-0 left-0 w-48 h-48 bg-[rgb(var(--token-rgb))] rounded-full blur-[100px] opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-500" />
              <div className="flex justify-between items-center text-xs relative z-10">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">sato issuance</span>
                <span className="text-content-tertiary text-[10px]">unit: <span className="text-content-primary font-mono font-medium">tokens/OKB</span></span>
              </div>
              <div className="flex-1 relative z-10">
                <SatoIssuanceChart
                  curve={token.curve}
                  reserveOkbWei={satoData.reserveOkb}
                  marketPriceOkbWei={satoData.marketPriceOkb}
                  mintedAmount={token.mintedAmount}
                  totalAmount={token.totalAmount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
