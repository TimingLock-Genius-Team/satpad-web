import { TokenCard } from "./TokenCard";
import { Token } from "@/types/token";

export function TokenGrid({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) {
    return (
      <div className="py-20 text-center animate-in fade-in duration-500">
        <p className="text-content-secondary mb-4">No tokens found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {tokens.map((token, index) => (
        <div 
          key={token.address}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TokenCard token={token} />
        </div>
      ))}
    </div>
  );
}
