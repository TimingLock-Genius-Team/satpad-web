import { notFound } from "next/navigation";
import {
  MoreVertical,
  ExternalLink,
  Copy,
  Info,
  Globe,
  Send,
} from "lucide-react";
import { MOCK_TOKENS } from "@/types/token";
import { TokenTabs } from "./TokenTabs";
import { TradePanel } from "./TradePanel";
import { TokenChart } from "@/components/token/TokenChart";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
    <div className="w-full bg-surface-base min-h-screen text-content-primary">
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent-primary flex items-center justify-center text-surface-base text-2xl md:text-3xl font-bold flex-shrink-0">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{token.name}</h1>
                      <span className="text-content-secondary font-mono text-sm md:text-base">{token.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="bg-surface-highlight px-2.5 py-1 rounded flex items-center gap-1.5 text-xs text-content-secondary font-mono">
                        {token.address}
                        <Copy className="w-3 h-3 hover:text-content-primary cursor-pointer transition-colors" />
                        <ExternalLink className="w-3 h-3 hover:text-content-primary cursor-pointer transition-colors" />
                      </div>
                    </div>
                    <div className="text-xs text-content-tertiary mt-4">
                      Created 2d ago by <span className="font-mono text-content-secondary">{token.creator}</span>
                    </div>
                    <div className="flex items-center gap-5 mt-4 text-xs font-medium text-content-secondary">
                      <a href="#" className="flex items-center gap-1.5 hover:text-content-primary transition-colors">
                        <XIcon className="w-3.5 h-3.5" /> x.com/pepe2099
                      </a>
                      <a href="#" className="flex items-center gap-1.5 hover:text-content-primary transition-colors">
                        <Send className="w-3.5 h-3.5" /> t.me/pepe2099
                      </a>
                      <a href="#" className="flex items-center gap-1.5 hover:text-content-primary transition-colors">
                        <Globe className="w-3.5 h-3.5" /> website
                      </a>
                    </div>
                  </div>
                </div>
                <button className="text-content-tertiary hover:text-content-primary transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8">
                <div className="w-full bg-surface-highlight rounded-full h-2 mb-3">
                  <div
                    className="bg-accent-primary h-full rounded-full"
                    style={{ width: `${token.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-content-secondary">
                  <div>
                    <span className="text-content-primary font-mono">{token.progress.toFixed(1)}%</span> minted • <span className="font-mono">{token.mintedAmount} / {token.totalAmount}</span>
                  </div>
                  <div className="text-content-tertiary">~75 OKB to graduation</div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "PRICE", value: `${token.price.toExponential(2)} OKB`, sub: "$0.00" },
                { label: "MARKET CAP", value: token.mcap },
                { label: "SUPPLY MINTED", value: token.mintedAmount, sub: `${token.progress.toFixed(1)}% / ${token.totalAmount}` },
                { label: "24H VOLUME", value: token.volume24h },
                { label: "HOLDERS", value: "70", hasInfo: true },
                { label: "OKB RESERVE", value: token.reserve },
              ].map((stat, i) => (
                <div key={i} className="bg-surface rounded-xl p-4 border border-border flex flex-col justify-center">
                  <div className="text-[10px] text-content-tertiary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    {stat.label}
                    {stat.hasInfo && <Info className="w-3 h-3" />}
                  </div>
                  <div className="text-sm md:text-base font-bold text-content-primary flex items-baseline gap-1 font-mono">
                    {stat.value}
                  </div>
                  {stat.sub && <div className="text-[10px] text-content-secondary mt-1 font-mono">{stat.sub}</div>}
                </div>
              ))}
            </div>

            <TokenChart currentPrice={token.price} progressPercent={token.progress} />

            <TokenTabs />
          </div>

          {/* Right Column (Trade Panel) */}
          <div>
            <TradePanel token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
