"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";
import { timeAgo, timestampMs } from "@/lib/time-display";
import { resolveIpfsUrl } from "@/lib/ipfs";

interface TokenCardProps {
  token: Token;
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

const formatPrice = (price: number) => {
  if (price === 0) return "0";
  if (price < 0.0001) {
    return price.toExponential(2);
  }
  if (price >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 5,
  }).format(price);
};

const parsePriceOkb = (priceOkb: string): number => {
  const n = Number(priceOkb);
  if (isNaN(n)) return 0;
  return n / 1e18;
};

function fmtOkb(weiString: string): string {
  const n = Number(weiString) / 1e18;
  if (isNaN(n)) return "0";
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 5,
  }).format(n);
}

const formatCompactValue = (str: string | undefined | null) => {
  if (!str || str === "--") return { value: "--", unit: null };
  
  let rawValue = str;
  let unit: string | null = null;
  
  const match = str.match(/^(.+?)\s+([A-Za-z]+)$/);
  if (match) {
    rawValue = match[1];
    unit = match[2];
  }
  
  const prefixMatch = rawValue.match(/^([^0-9\.\-]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : "";
  const numericPart = rawValue.slice(prefix.length);
  
  const num = Number(numericPart.replace(/,/g, ''));
  if (!isNaN(num) && numericPart.trim() !== "") {
    if (num >= 1000) {
      rawValue = prefix + new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(num);
    } else if (num < 0.001 && num > 0) {
      rawValue = prefix + num.toExponential(2);
    } else {
      rawValue = prefix + new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4,
      }).format(num);
    }
  }
  
  return { value: rawValue, unit };
};

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

export const TokenCard = memo(function TokenCard({ token }: TokenCardProps) {
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
  const tokenRGB = getTokenColorRGB(token.symbol);

  const mcapData = formatCompactValue(token.mcap);
  const volData = formatCompactValue(volumeDisplay);

  return (
    <Link
      href={`/token/${token.address}`}
      className="group bg-gradient-to-b from-surface/80 to-surface/40 backdrop-blur-xl border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_20px_-8px_rgba(0,0,0,0.5)] rounded-[20px] p-5 h-[240px] flex flex-col gap-4 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-[rgba(var(--token-rgb),0.4)] hover:shadow-[0_8px_30px_-12px_rgba(var(--token-rgb),0.35)] relative overflow-hidden"
      style={{ '--token-rgb': tokenRGB } as React.CSSProperties}
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[rgb(var(--token-rgb))] rounded-full blur-[80px] opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity duration-500" />
      
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--token-rgb),0)] via-transparent to-[rgba(var(--token-rgb),0)] group-hover:from-[rgba(var(--token-rgb),0.06)] group-hover:to-[rgba(var(--token-rgb),0.12)] transition-colors duration-500 pointer-events-none" />
      
      {/* Animated Streaming Border */}
      <div 
        className="absolute inset-0 rounded-[20px] pointer-events-none overflow-hidden z-20"
        style={{
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div 
          className="absolute inset-[-100%] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            animation: 'spin 4s linear infinite',
            background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, rgb(var(--token-rgb)) 45%, #ffffff 50%, transparent 50%, transparent 100%)' 
          }} 
        />
        {/* Opposite side beam for balance (optional, remove if you only want one beam) */}
        <div 
          className="absolute inset-[-100%] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            animation: 'spin 4s linear infinite',
            background: 'conic-gradient(from 180deg, transparent 0%, transparent 20%, rgb(var(--token-rgb)) 45%, #ffffff 50%, transparent 50%, transparent 100%)' 
          }} 
        />
      </div>
      
      {/* Card Header */}
      <div className="flex items-start gap-3 relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white border border-white/5 shrink-0 overflow-hidden group-hover:border-[rgba(var(--token-rgb),0.3)] transition-colors duration-300 relative"
          style={avatarSrc ? undefined : { background: `linear-gradient(135deg, rgba(${tokenRGB}, 0.8), rgba(${tokenRGB}, 0.4))` }}
        >
          {avatarSrc ? (
            <Image src={avatarSrc} alt={token.symbol} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
          ) : (
            token.symbol.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-content-primary truncate transition-colors duration-300 group-hover:text-[rgb(var(--token-rgb))] drop-shadow-sm">
              {token.name}
            </span>
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded transition-colors duration-300 bg-black/20 border border-white/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)] text-content-secondary group-hover:bg-[rgba(var(--token-rgb),0.15)] group-hover:text-[rgb(var(--token-rgb))] group-hover:border-[rgba(var(--token-rgb),0.3)]">
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
      <div className="grid grid-cols-3 gap-1.5 mt-auto relative z-10">
        <div className="bg-black/20 rounded-lg p-1.5 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] min-w-0 transition-colors duration-300 group-hover:bg-[rgba(var(--token-rgb),0.03)] group-hover:border-[rgba(var(--token-rgb),0.2)]">
          <div className="text-[9px] text-content-tertiary mb-0.5 uppercase tracking-wider truncate transition-colors duration-300 group-hover:text-[rgba(var(--token-rgb),0.8)]">Price</div>
          <div className="flex items-baseline gap-0.5 min-w-0 font-mono text-[11px] sm:text-xs font-bold text-content-primary drop-shadow-sm" title={formatPrice(priceNum)}>
            <span className="truncate">{formatPrice(priceNum)}</span>
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-1.5 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] min-w-0 transition-colors duration-300 group-hover:bg-[rgba(var(--token-rgb),0.03)] group-hover:border-[rgba(var(--token-rgb),0.2)]">
          <div className="text-[9px] text-content-tertiary mb-0.5 uppercase tracking-wider truncate transition-colors duration-300 group-hover:text-[rgba(var(--token-rgb),0.8)]">MCap</div>
          <div className="flex items-baseline gap-0.5 min-w-0 font-mono text-[11px] sm:text-xs font-bold text-content-primary drop-shadow-sm" title={token.mcap ?? undefined}>
            <span className="truncate">{mcapData.value}</span>
            {mcapData.unit && <span className="text-[8px] sm:text-[9px] text-content-secondary shrink-0">{mcapData.unit}</span>}
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-1.5 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] min-w-0 transition-colors duration-300 group-hover:bg-[rgba(var(--token-rgb),0.03)] group-hover:border-[rgba(var(--token-rgb),0.2)]">
          <div className="text-[9px] text-content-tertiary mb-0.5 uppercase tracking-wider truncate transition-colors duration-300 group-hover:text-[rgba(var(--token-rgb),0.8)]">24h Vol</div>
          <div className="flex items-baseline gap-0.5 min-w-0 font-mono text-[11px] sm:text-xs font-bold text-content-primary drop-shadow-sm" title={volumeDisplay}>
            <span className="truncate">{volData.value}</span>
            {volData.unit && <span className="text-[8px] sm:text-[9px] text-content-secondary shrink-0">{volData.unit}</span>}
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="w-full h-6 flex justify-center relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <MiniChartPath token={token} />
      </div>
    </Link>
  );
});
