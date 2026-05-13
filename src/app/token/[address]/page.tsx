import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Copy, ExternalLink } from "lucide-react";
import { MOCK_TOKENS } from "@/types/token";

export function generateStaticParams() {
  return MOCK_TOKENS.map((token) => ({
    address: token.address,
  }));
}

export default function TokenDetailPage({
  params,
}: {
  params: { address: string };
}) {
  const token = MOCK_TOKENS.find((t) => t.address === params.address);

  if (!token) {
    notFound();
  }

  return (
    <div className="w-full">
      <section className="w-full border-b border-border pb-8 pt-10 md:pt-16 px-4 bg-surface-base">
        <div className="max-w-[1440px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-content-tertiary hover:text-content-primary transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <div className="flex items-start gap-5">
            <Image
              src={token.avatarUrl}
              alt={token.name}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-highlight flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-content-primary">
                {token.name}
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-content-secondary font-medium">${token.symbol}</span>
                {token.isGraduated && (
                  <span className="text-[11px] font-semibold bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full">
                    Graduated
                  </span>
                )}
                <span className="text-xs text-content-tertiary font-mono">
                  {token.address}
                  <button className="inline-flex items-center ml-1.5 text-content-tertiary hover:text-content-primary transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                </span>
              </div>
              <p className="text-content-secondary text-sm mt-2 max-w-[560px]">{token.description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-content-primary mb-5 uppercase tracking-wider">
                Bonding Curve Progress
              </h2>
              <div className="w-full bg-surface-highlight rounded-full h-2.5 mb-3">
                <div
                  className="h-full rounded-full bg-accent-primary transition-all"
                  style={{ width: `${token.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-content-secondary">
                  {token.mintedAmount} minted
                </span>
                <span className="text-accent-primary font-semibold">{token.progress}%</span>
                <span className="text-content-secondary">
                  {token.totalAmount} total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-content-tertiary text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  Price
                </div>
                <div className="text-lg font-bold text-content-primary">{token.price.toExponential(3)} OKB</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-content-tertiary text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  Market Cap
                </div>
                <div className="text-lg font-bold text-content-primary">{token.mcap}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-content-tertiary text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  24H Volume
                </div>
                <div className="text-lg font-bold text-content-primary">{token.volume24h}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <div className="text-content-tertiary text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  Reserve
                </div>
                <div className="text-lg font-bold text-content-primary">{token.reserve}</div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-content-primary mb-5 uppercase tracking-wider">
                Token Info
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-content-tertiary">Creator</span>
                  <span className="text-content-primary font-mono">{token.creator}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-content-tertiary">Contract</span>
                  <a
                    href="#"
                    className="text-accent-primary font-mono inline-flex items-center gap-1 hover:underline"
                  >
                    {token.address}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-content-tertiary">Minted</span>
                  <span className="text-content-primary">
                    {token.mintedAmount} / {token.totalAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-content-tertiary">Status</span>
                  <span className={token.isGraduated ? "text-accent-success" : "text-accent-warning"}>
                    {token.isGraduated ? "Graduated to DEX" : "On Bonding Curve"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-content-primary mb-5 uppercase tracking-wider">
                Trade
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-content-tertiary mb-1.5">Amount (OKB)</label>
                  <input
                    type="text"
                    placeholder="0.0"
                    className="w-full bg-surface-highlight border border-border rounded-input px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                </div>
                <div className="flex justify-between text-xs text-content-tertiary">
                  <span>You will receive</span>
                  <span>≈ 0.00 {token.symbol}</span>
                </div>
                <button
                  type="button"
                  className="w-full py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] text-sm"
                >
                  Buy
                </button>
              </div>
            </div>

            {token.priceChange24h !== 0 && (
              <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center gap-2">
                  <span className="text-content-tertiary text-xs">24H Change</span>
                  <span
                    className={`text-sm font-semibold flex items-center gap-1 ${token.priceChange24h > 0 ? "text-accent-success" : "text-accent-danger"}`}
                  >
                    {token.priceChange24h > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {token.priceChange24h}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
