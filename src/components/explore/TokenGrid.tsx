import { memo } from "react";
import { TokenCard } from "./TokenCard";
import { Token } from "@/types/token";
import { cn } from "@/utils/cn";

interface TokenGridProps {
  tokens: Token[];
  viewMode?: "comfy" | "compact";
  totalCount?: number;
  emptyMessage?: string;
}

export const TokenGrid = memo(function TokenGrid({ tokens, viewMode = "comfy", totalCount, emptyMessage }: TokenGridProps) {
  if (tokens.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-content-secondary mb-2">{emptyMessage ?? "No tokens found."}</p>
        {emptyMessage && (
          <p className="text-content-tertiary text-xs">Try a different search term or browse the tabs.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-content-primary mb-2 flex items-center gap-3">
            Active Markets
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-success/10 text-accent-success text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-brand-pulse"></span>
              Live
            </span>
          </h2>
          <p className="text-content-secondary text-sm">
            Discover and trade the latest tokens. Showing <span className="font-mono text-content-primary">{totalCount ?? tokens.length}</span> results.
          </p>
        </div>
      </div>
      
      <div 
        className={cn(
          "grid gap-5",
          viewMode === "comfy" 
            ? "" 
            : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
        style={viewMode === "comfy" ? { gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' } : {}}
      >
        {tokens.map((token, index) => (
          <div
            key={token.address}
            className="opacity-0 animate-fade-in-up content-visibility-auto"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TokenCard token={token} />
          </div>
        ))}
      </div>
    </div>
  );
});
