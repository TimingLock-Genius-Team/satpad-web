import { TokenCard } from "./TokenCard";
import { Token } from "@/types/token";

export function TokenGrid({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-content-secondary mb-4">No tokens found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tokens.map((token) => (
        <TokenCard key={token.address} token={token} />
      ))}
    </div>
  );
}
