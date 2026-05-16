"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { TradePanel } from "./TradePanel";
import { TokenChart } from "@/components/token/TokenChart";
import { TokenActivityPanels } from "@/components/token/TokenActivityPanels";
import { TokenPriceTimeChart } from "@/components/token/TokenPriceTimeChart";
import { SatoIssuanceChart } from "@/components/token/SatoIssuanceChart";
import { Copy, ExternalLink, Send, Globe, Check, RefreshCw } from "lucide-react";
import { useTokenChart, useTokenDetail, useTokenSummary } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { useAccount } from "wagmi";
import { hashKeyTestnet, sepolia, xLayer } from "@/config/chains";

function chainForId(chainId?: number) {
  switch (chainId) {
    case xLayer.id:
      return xLayer;
    case hashKeyTestnet.id:
      return hashKeyTestnet;
    case sepolia.id:
    default:
      return sepolia;
  }
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
  if (okb < 0.001) return okb.toExponential(2);
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
  const { chainId } = useAccount();
  const activeChain = chainForId(chainId);
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
  const uniswapUrl = `https://app.uniswap.org/swap?outputCurrency=${address}&chain=${activeChain.id}`;

  return (
    <div className="w-full bg-surface-base min-h-screen text-content-primary p-4 md:p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,360px)] gap-8 items-start relative">
          {/* Left Column */}
          <div className="flex flex-col gap-8 min-w-0">
            {/* Token Header */}
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row gap-4 sm:gap-5 border border-border shadow-sm">
              {/* Left: Avatar */}
              <div className="relative w-full sm:w-[136px] sm:h-[136px] aspect-square sm:aspect-auto flex-shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={token.symbol} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-surface-highlight rounded-xl flex items-center justify-center text-4xl font-bold text-content-primary">
                    {token.symbol.substring(0, 2)}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex flex-col flex-1 justify-between min-w-0 py-0.5">
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
                    {(socials?.twitter || socials?.telegram || socials?.website) && (
                      <div className="flex items-center gap-2 text-content-tertiary ml-1">
                        {socials?.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><XIcon className="w-3 h-3" /></a>}
                        {socials?.telegram && <a href={socials.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><Send className="w-3 h-3" /></a>}
                        {socials?.website && <a href={socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-content-primary transition-colors"><Globe className="w-3 h-3" /></a>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col gap-1 mt-4 sm:mt-0">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-content-tertiary flex-shrink-0">created by:</span>
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
                      <div className="flex-1 h-2 bg-surface-base -skew-x-12 overflow-hidden rounded-sm border border-border/30">
                        <div
                          className="h-full bg-accent-primary transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
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
              uniswapUrl={uniswapUrl}
            />
          </div>
        </div>

        {/* Sato Data */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-accent-primary rounded-sm" />
            <h2 className="text-content-primary font-semibold text-xs">sato data</h2>
          </div>
          <div className="border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6 text-[11px]">
              {/* SUPPLY */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">SUPPLY</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">max</span>
                  <span className="text-content-primary font-mono font-medium">{maxSupply}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">circulating</span>
                  <span className="text-content-primary font-mono font-medium">{circulatingSupply}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">holders</span>
                  <span className="text-content-primary font-mono font-medium">{satoData.holders}</span>
                </div>
              </div>

              {/* PRICE */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">PRICE</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">market</span>
                  <span className="text-content-primary font-mono font-medium">{fmtOkbCompact(satoData.marketPriceOkb)} OKB</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">reserve</span>
                  <span className="text-content-primary font-mono font-medium">{fmtOkbCompact(satoData.reserveOkb)} OKB</span>
                </div>
              </div>

              {/* VALUATION */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">VALUATION</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">mcap (fd)</span>
                  <span className="text-content-primary font-mono font-medium">{fdMarketCapOkb}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">mcap (circ)</span>
                  <span className="text-content-primary font-mono font-medium">{circulatingMarketCapOkb}</span>
                </div>
              </div>

              {/* RESERVE */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">RESERVE</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">liquidity</span>
                  <div className="text-right">
                    <div className="text-content-primary font-mono font-medium">{fmtOkbCompact(satoData.reserveOkb)} OKB</div>
                  </div>
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">ACTIVITY</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">vol 24h</span>
                  <span className="text-content-primary font-mono font-medium">{volumeOkb} OKB</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">txns 24h</span>
                  <span className="text-content-primary font-mono font-medium">{satoData.txns24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TokenActivityPanels address={address} />

        {/* Price and Issuance */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-accent-primary rounded-sm" />
            <h2 className="text-content-primary font-semibold text-xs">price and issuance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="flex flex-col gap-3 border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">price over time</span>
                <span className="text-content-tertiary text-[10px]">now: <span className="text-content-primary font-mono font-medium">{fmtOkbCompact(satoData.marketPriceOkb)} OKB</span></span>
              </div>
              <div className="flex-1">
                <TokenPriceTimeChart
                  points={chart?.points}
                  currentPriceOkbWei={satoData.marketPriceOkb}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">sato issuance</span>
                <span className="text-content-tertiary text-[10px]">unit: <span className="text-content-primary font-mono font-medium">tokens/OKB</span></span>
              </div>
              <div className="flex-1">
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
