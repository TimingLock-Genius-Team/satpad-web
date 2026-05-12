import Link from "next/link";
import { cn } from "@/utils/cn";
import { Token } from "@/types/token";

export function TokenCard({ token }: { token: Token }) {
  return (
    <Link 
      href={`/token/${token.address}`}
      className={cn(
        "block p-4 rounded-card bg-surface border border-border hover:border-accent-primary transition-all",
        "hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] group"
      )}
    >
      <div className="flex gap-4 mb-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-elevated shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={token.avatarUrl} 
            alt={token.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-content-primary font-bold truncate group-hover:text-accent-primary transition-colors">
              {token.name}
            </h3>
            {token.isGraduated && (
              <span className="shrink-0 px-2 py-0.5 rounded-pill bg-accent-success/10 text-accent-success text-xs font-bold">
                Graduated
              </span>
            )}
          </div>
          <p className="text-content-secondary text-sm font-medium mb-1">
            ${token.symbol}
          </p>
          <p className="text-content-tertiary text-xs truncate">
            by {token.creator}
          </p>
        </div>
      </div>
      
      <p className="text-content-secondary text-sm line-clamp-2 mb-4 h-10">
        {token.description}
      </p>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-content-tertiary">Price</span>
          <span className="text-content-primary font-medium">{token.price.toFixed(6)} OKB</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-content-tertiary">Reserve</span>
          <span className="text-content-primary font-medium">{token.reserve}</span>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-content-tertiary">Bonding Curve Progress</span>
            <span className="text-accent-primary font-bold">{token.progress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-elevated rounded-pill overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-pill transition-all duration-700",
                token.isGraduated ? "bg-accent-success" : "bg-accent-primary"
              )}
              style={{ width: `${token.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
