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
      className="group bg-surface/60 backdrop-blur-md border border-border/60 rounded-[20px] p-5 h-[240px] flex flex-col gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-accent-primary/50 hover:shadow-[0_8px_30px_-12px] hover:shadow-accent-primary/30 relative overflow-hidden"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/0 via-transparent to-accent-primary/0 group-hover:from-accent-primary/5 group-hover:to-accent-primary/10 transition-colors duration-500 pointer-events-none" />
      
      {/* Card Header */}
      <div className="flex items-start gap-3 relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white border border-border shrink-0 overflow-hidden shadow-inner"
          style={avatarSrc ? undefined : { background: getBgColor(token.symbol) }}
        >
          {avatarSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarSrc} alt={token.symbol} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            token.symbol.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-content-primary truncate group-hover:text-accent-primary transition-colors">
              {token.name}
            </span>
            <span className="font-mono text-xs font-medium text-content-tertiary px-1.5 py-0.5 rounded bg-surface-highlight">
              {token.symbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-content-tertiary">
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
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            New
          </span>
        ) : (
          <span className={cn("font-mono text-[13px] font-medium shrink-0", priceChange >= 0 ? "text-accent-success" : "text-accent-danger")}>
            {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div className="relative z-10">
        <div className="w-full h-2 bg-surface-highlight rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
            style={{
              width: `${Math.min(token.progress, 100)}%`,
              background: 'linear-gradient(90deg, rgb(var(--accent-primary)/0.6), rgb(var(--accent-primary)))',
              boxShadow: '0 0 10px rgb(var(--accent-primary)/0.5)'
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-content-tertiary">
            <span className="font-mono text-content-secondary font-medium">{token.progress.toFixed(1)}%</span> minted
          </span>
          <span className="font-mono text-content-tertiary">
            {token.mintedAmount} / {token.totalAmount}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-auto relative z-10">
        <div className="bg-surface-base/50 rounded-lg p-2 border border-border/40">
          <div className="text-[10px] text-content-tertiary mb-0.5 uppercase tracking-wider">Price</div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[13px] font-bold text-content-primary">{formatPrice(priceNum)}</span>
          </div>
        </div>
        <div className="bg-surface-base/50 rounded-lg p-2 border border-border/40">
          <div className="text-[10px] text-content-tertiary mb-0.5 uppercase tracking-wider">MCap</div>
          <span className="font-mono text-[13px] font-bold text-content-primary">{token.mcap ?? "--"}</span>
        </div>
        <div className="bg-surface-base/50 rounded-lg p-2 border border-border/40">
          <div className="text-[10px] text-content-tertiary mb-0.5 uppercase tracking-wider">24h Vol</div>
          <span className="font-mono text-[13px] font-bold text-content-primary">{volumeDisplay}</span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="w-full h-6 flex justify-center relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <MiniChartPath token={token} />
      </div>
    </Link>
  );
}
