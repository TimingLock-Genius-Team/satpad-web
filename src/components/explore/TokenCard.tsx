import Link from "next/link";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";

const truncateAddress = (addr: string) => {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export function TokenCard({ token }: { token: Token }) {
  // Mock data
  const mockMarketCap = `$${(token.price * 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const mockChange = "+5.2%";
  const isPositive = true;

  return (
    <Link 
      href={`/token/${token.address}`}
      className={cn(
        "block p-4 rounded-xl bg-surface border border-border transition-all duration-300",
        "hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)] group",
        "relative overflow-hidden"
      )}
    >
      {/* Top Section: Avatar + Name + Symbol + Change */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-elevated shrink-0 border border-border group-hover:border-green-500/30 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={token.avatarUrl} 
            alt={token.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <h3 className="text-content-primary font-bold truncate group-hover:text-green-400 transition-colors">
                {token.name}
              </h3>
              <span className="text-content-secondary text-sm font-medium shrink-0">
                ${token.symbol}
              </span>
            </div>
            {/* Change Indicator */}
            <span className={cn(
              "shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md",
              isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
            )}>
              {mockChange}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-content-tertiary text-xs">
              created by <span className="text-content-secondary hover:text-green-400 transition-colors">{truncateAddress(token.creator)}</span>
            </p>
            {token.isGraduated && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-accent-success/10 text-accent-success text-[10px] font-bold uppercase tracking-wider">
                Graduated
              </span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-content-secondary text-sm line-clamp-2 mb-4 h-10">
        {token.description}
      </p>

      {/* Market Cap - Highlighted */}
      <div className="mb-4 mt-2 flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-border/50 group-hover:border-green-500/30 transition-colors">
        <span className="text-content-tertiary text-xs uppercase tracking-wider font-semibold">Market Cap</span>
        <span className="text-lg font-bold text-green-400 tracking-tight">
          {mockMarketCap}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-content-tertiary">Price</span>
          <span className="text-content-primary font-medium">{token.price.toFixed(6)} OKB</span>
        </div>
        
        {/* Bonding Curve */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-content-tertiary font-medium">Bonding Curve</span>
            <span className="text-green-400 font-bold">{token.progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-surface-elevated/50 rounded-full border border-border/50 p-[1px]">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 relative",
                token.isGraduated 
                  ? "bg-accent-success" 
                  : "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
              )}
              style={{ width: `${Math.max(token.progress, 2)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
