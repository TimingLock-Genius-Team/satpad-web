import { TokenCard } from "./TokenCard";
import { Token } from "@/types/token";
import { cn } from "@/utils/cn";

interface TokenGridProps {
  tokens: Token[];
  viewMode?: "comfy" | "compact";
}

export function TokenGrid({ tokens, viewMode = "comfy" }: TokenGridProps) {
  if (tokens.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-content-secondary mb-4">No tokens found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div aria-live="polite" className="text-[13px] text-content-tertiary">
          <span className="font-mono text-content-secondary">{tokens.length}</span> tokens
        </div>
        <div className="flex items-center gap-[6px] text-[11px] text-content-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-brand-pulse"></span>
          <span className="uppercase tracking-[0.06em] font-medium">Live</span>
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
        {tokens.map((token) => (
          <TokenCard key={token.address} token={token} />
        ))}
      </div>
    </div>
  );
}
