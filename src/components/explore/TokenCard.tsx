import Link from "next/link";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";

interface TokenCardProps {
  token: Token;
}

// Simple random data generator for mini-charts based on address string
const generateChartData = (seed: string, points = 20) => {
  let value = 50;
  const data = [];
  for (let i = 0; i < points; i++) {
    const change = (seed.charCodeAt(i % seed.length) % 10) - 4;
    value = Math.max(10, Math.min(90, value + change));
    data.push(value);
  }
  return data;
};

// Generate background color based on symbol
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

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const formatPrice = (price: number) => {
  if (price < 0.001) {
    return price.toExponential(2);
  }
  return price.toString();
};

export function TokenCard({ token }: TokenCardProps) {
  const chartData = generateChartData(token.address);
  // Scale the chart so it occupies 0-20 in y-axis
  const chartPath = chartData.map((val, i) => `${i === 0 ? 'M' : 'L'} ${i * (100 / (chartData.length - 1))} ${20 - (val * 0.2)}`).join(" ");
  // New token is within 24 hours
  const isNew = Date.now() - token.createdAt <= 1000 * 60 * 60 * 24;

  return (
    <Link 
      href={`/token/${token.address}`}
      className="bg-[#12131A] border border-[#1E2028] rounded-xl p-4 h-[220px] flex flex-col gap-3 cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-1 hover:border-[#00FF88]/50 relative overflow-hidden group block"
    >
      {/* Card Header */}
      <div className="flex items-start gap-3">
        {/* Logo Placeholder */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center font-sans font-bold text-[14.4px] text-white border border-[#1E2028] shrink-0 tracking-[-0.02em]" 
          style={{ background: getBgColor(token.symbol) }}
        >
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>
        
        {/* Title and Address */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-[6px]">
            <div className="text-[15px] font-semibold text-[#F2F4F8] overflow-hidden text-ellipsis whitespace-nowrap">
              {token.name}
            </div>
            <div className="font-mono text-xs text-[#8F94A8]/60">
              {token.symbol}
            </div>
          </div>
          <div className="flex items-center gap-[6px] mt-[2px]">
            <span className="font-mono text-[11px] text-[#8F94A8]/60">
              {token.address.slice(0, 6)}…{token.address.slice(-4)}
            </span>
            <span className="text-[11px] text-[#8F94A8]/60">
              · {timeAgo(token.createdAt)}
            </span>
          </div>
        </div>
        
        {/* Badge */}
        {token.isGraduated ? (
          <span className="inline-flex items-center gap-1 px-2 h-[22px] bg-[#00FF88]/10 text-[#00FF88] rounded-full text-[11px] font-medium tracking-[0.04em] uppercase shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> Grad
          </span>
        ) : isNew ? (
          <span className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#4D94FF] rounded-full text-[11px] font-medium shrink-0">
            New
          </span>
        ) : (
          <span className={cn("font-mono text-[13px] font-medium shrink-0", token.priceChange24h >= 0 ? "text-[#00FF88]" : "text-[#FF4D4D]")}>
            {token.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(token.priceChange24h).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div>
        <div className="w-full">
          <div className="w-full h-[6px] bg-[#1A1C24] rounded-full overflow-hidden relative border border-[#1E2028]/50">
            <div 
              className="h-full rounded-full transition-all duration-800" 
              style={{ 
                width: `${token.progress}%`, 
                background: 'linear-gradient(90deg, #00CC6A 0%, #00FF88 100%)',
                boxShadow: '0 0 10px rgba(0,255,136,0.3)'
              }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="text-[#8F94A8]/60">
            <span className="font-mono text-[#8F94A8]">{token.progress.toFixed(1)}%</span> minted
          </span>
          <span className="font-mono text-[#8F94A8]/60">
            {token.mintedAmount} / {token.totalAmount}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3 mt-auto relative z-10">
        <div>
          <div className="text-[10px] text-[#8F94A8]/60 uppercase tracking-[0.04em] mb-1">Price</div>
          <div className="flex items-baseline gap-1">
            <div className="font-mono text-[13px] font-medium text-[#F2F4F8]">{formatPrice(token.price)}</div>
            <div className="font-mono text-[11px] text-[#8F94A8]/60">OKB</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#8F94A8]/60 uppercase tracking-[0.04em] mb-1">MCap</div>
          <div className="font-mono text-[13px] font-medium text-[#F2F4F8]">{token.mcap}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#8F94A8]/60 uppercase tracking-[0.04em] mb-1">24H Vol</div>
          <div className="font-mono text-[13px] font-medium text-[#F2F4F8]">{token.volume24h}</div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="w-full h-5 flex justify-center z-0 mt-2">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d={chartPath} 
            fill="none" 
            stroke={token.priceChange24h >= 0 ? "#00FF88" : "#FF4D4D"} 
            strokeWidth="1.5" 
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </Link>
  );
}
