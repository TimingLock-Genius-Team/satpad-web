"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";
import { timeAgo, timestampMs } from "@/lib/time-display";
import { resolveIpfsUrl } from "@/lib/ipfs";

interface TokenCardProps {
  token: Token;
}

const getBgColor = (symbol: string) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  return `rgb(${(r % 150) + 40}, ${(g % 150) + 40}, ${(b % 150) + 40})`;
};

const formatPrice = (price: number) => {
  if (price < 0.001) {
    return price.toExponential(2);
  }
  return price.toString();
};

const parsePriceOkb = (priceOkb: string): number => {
  const n = Number(priceOkb);
  if (isNaN(n)) return 0;
  return n / 1e18;
};

function fmtOkb(weiString: string): string {
  const n = Number(weiString) / 1e18;
  if (isNaN(n)) return "0";
  if (n < 0.001) return n.toExponential(3);
  return n.toFixed(6);
}

function MiniChartPath({ token }: { token: Token }) {
  const priceHistory = token.priceHistory;
  if (!priceHistory || priceHistory.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="h-px w-3/4 bg-border/40" />
      </div>
    );
  }
  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const range = maxPrice - minPrice || 1;
  const chartPath = priceHistory.map((val, i) => {
    const x = i * (100 / (priceHistory.length - 1));
    const y = 20 - ((val - minPrice) / range) * 18 - 1;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(" ");

  const trendColor = (token.priceChange24h ?? 0) >= 0
    ? "rgb(var(--accent-success))"
    : "rgb(var(--accent-danger))";

  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
      <path 
        d={chartPath} 
        fill="none" 
        stroke={trendColor} 
        strokeWidth="1.5" 
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function TokenCard({ token }: TokenCardProps) {
  const [now, setNow] = useState<number | null>(null);
  const priceNum = token.price ?? parsePriceOkb(token.priceOkb);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const isGraduated = token.isGraduated ?? (token.progress >= 100);
  const isNew = token.createdAt != null && now != null ? now - timestampMs(token.createdAt) <= 1000 * 60 * 60 * 24 : false;
  const priceChange = token.priceChange24h ?? 0;
  const volumeDisplay = token.volume24h ?? (token.volume24hOkb ? fmtOkb(token.volume24hOkb) + " OKB" : "--");
  const avatarSrc = resolveIpfsUrl(token.avatarUrl);

  return (
    <Link
      href={`/token/${token.address}`}
      className="group bg-surface border border-border/50 rounded-xl p-4 h-[220px] flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-border-hover hover:shadow-sm relative overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white border border-border shrink-0 overflow-hidden bg-gradient-to-br from-surface-highlight to-surface"
          style={avatarSrc ? undefined : { background: getBgColor(token.symbol) }}
        >
          {avatarSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarSrc} alt={token.symbol} className="w-full h-full object-cover" />
          ) : (
            token.symbol.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold text-content-primary truncate">
              {token.name}
            </span>
            <span className="font-mono text-xs text-content-tertiary">
              {token.symbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-content-tertiary">
            <span>{token.address.slice(0, 6)}…{token.address.slice(-4)}</span>
            {token.createdAt != null && now != null && (
              <span>· {timeAgo(token.createdAt, now)}</span>
            )}
          </div>
        </div>

        {isGraduated ? (
          <span className="inline-flex items-center gap-1 px-2 h-[22px] bg-accent-success/10 text-accent-success rounded-full text-[11px] font-medium tracking-wide uppercase shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> Grad
          </span>
        ) : isNew ? (
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[11px] font-medium shrink-0">
            New
          </span>
        ) : (
          <span className={cn("font-mono text-[13px] font-medium shrink-0", priceChange >= 0 ? "text-accent-success" : "text-accent-danger")}>
            {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div>
        <div className="w-full h-1.5 bg-surface-highlight rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(token.progress, 100)}%`,
              background: 'linear-gradient(90deg, rgb(var(--accent-primary)/0.8), rgb(var(--accent-primary)))',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-content-tertiary">
            <span className="font-mono text-content-secondary">{token.progress.toFixed(1)}%</span> minted
          </span>
          <span className="font-mono text-content-tertiary">
            {token.mintedAmount} / {token.totalAmount}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-auto">
        <div>
          <div className="text-[10px] text-content-tertiary mb-1">Price</div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[13px] font-medium text-content-primary">{formatPrice(priceNum)}</span>
            <span className="font-mono text-[11px] text-content-tertiary">OKB</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-content-tertiary mb-1">MCap</div>
          <span className="font-mono text-[13px] font-medium text-content-primary">{token.mcap ?? "--"}</span>
        </div>
        <div>
          <div className="text-[10px] text-content-tertiary mb-1">24h Vol</div>
          <span className="font-mono text-[13px] font-medium text-content-primary">{volumeDisplay}</span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="w-full h-5 flex justify-center">
        <MiniChartPath token={token} />
      </div>
    </Link>
  );
}
