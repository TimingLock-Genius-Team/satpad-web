import { notFound } from "next/navigation";
import { MOCK_TOKENS } from "@/types/token";
import { TradePanel } from "./TradePanel";
import { BondingCurveChart } from "@/components/token/BondingCurveChart";
import { BitcoinIssuanceChart } from "@/components/token/BitcoinIssuanceChart";
import { SatoIssuanceChart } from "@/components/token/SatoIssuanceChart";
import { Copy, ExternalLink, Send, Globe, MoreVertical } from "lucide-react";

export function generateStaticParams() {
  return MOCK_TOKENS.map((token) => ({
    address: token.address,
  }));
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
    <div className="w-full bg-surface-base min-h-screen text-content-primary p-4 md:p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,360px)] gap-8 items-start relative">
          {/* Left Column: All Content */}
          <div className="flex flex-col gap-8 min-w-0">
            
            {/* Token Header Profile Card with Progress */}
            <div className="border border-border p-6 rounded-card bg-surface shadow-sm flex flex-col gap-6 relative overflow-hidden">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex gap-5 items-start">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-accent-primary flex items-center justify-center text-surface-base text-2xl font-bold flex-shrink-0">
                    {token.symbol.substring(0, 2)}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-content-primary">{token.name}</h1>
                      <span className="text-content-secondary font-mono text-sm">{token.symbol}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-surface-highlight px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-content-secondary font-mono">
                        {token.address}
                        <button className="hover:text-content-primary transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button className="hover:text-content-primary transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    <div className="text-xs text-content-tertiary mb-4">
                      Created 2d ago by <span className="font-mono text-content-secondary">{token.creator}</span>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-medium text-content-secondary">
                      <a href="#" className="flex items-center gap-2 hover:text-content-primary transition-colors">
                        <XIcon className="w-3.5 h-3.5" /> x.com/pepe2099
                      </a>
                      <a href="#" className="flex items-center gap-2 hover:text-content-primary transition-colors">
                        <Send className="w-3.5 h-3.5" /> t.me/pepe2099
                      </a>
                      <a href="#" className="flex items-center gap-2 hover:text-content-primary transition-colors">
                        <Globe className="w-3.5 h-3.5" /> website
                      </a>
                    </div>
                  </div>
                </div>
                
                <button className="text-content-tertiary hover:text-content-primary transition-colors p-2 -mr-2 -mt-2">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Integrated Progress Bar */}
              <div className="pt-4 border-t border-border/30">
                <div className="w-full bg-surface-base rounded-full h-2.5 mb-3 border border-border/50">
                  <div
                    className="bg-accent-primary h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${token.progress}%` }}
                  >
                    {/* Optional glow effect */}
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 rounded-full blur-sm" />
                  </div>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <div className="text-content-secondary">
                    <span className="text-content-primary font-mono">{token.progress.toFixed(1)}%</span> minted <span className="mx-2 text-content-tertiary">·</span> <span className="font-mono">{token.mintedAmount} / {token.totalAmount}</span>
                  </div>
                  <div className="text-content-tertiary text-xs font-mono">
                    ~75 OKB to graduation
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <BondingCurveChart
              currentSupply={19.6}
              forwardSupply={20.3}
              drift={728}
              currentPrice={1.02}
              burnPrice={0.8467}
              mintPrice={1.88}
            />
          </div>

          {/* Right Column: Trade Panel */}
          <div>
            <TradePanel token={token} />
          </div>
        </div>

        {/* Middle Section: Sato Data (Full Width Now) */}
        <div className="border border-border p-8 rounded-card bg-surface shadow-sm">
          <h2 className="text-content-primary font-semibold tracking-wide mb-8 uppercase text-sm">sato data</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 text-sm">
            {/* SUPPLY */}
            <div className="flex flex-col gap-3">
              <div className="text-content-tertiary text-[10px] tracking-widest uppercase font-bold mb-1">SUPPLY</div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">max</span>
                <span className="text-content-primary font-mono">20.79m</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">circulating</span>
                <span className="text-content-primary font-mono">19.66m</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">holders</span>
                <span className="text-content-primary font-mono">9,519</span>
              </div>
            </div>

            {/* PRICE */}
            <div className="flex flex-col gap-3">
              <div className="text-content-tertiary text-[10px] tracking-widest uppercase font-bold mb-1">PRICE</div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">market</span>
                <span className="text-accent-danger font-mono font-medium">$1.07</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">burn</span>
                <span className="text-accent-danger font-mono font-medium">$0.8472</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">mint</span>
                <span className="text-accent-primary font-mono font-medium">$1.88</span>
              </div>
            </div>

            {/* VALUATION */}
            <div className="flex flex-col gap-3">
              <div className="text-content-tertiary text-[10px] tracking-widest uppercase font-bold mb-1">VALUATION</div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">mcap (fd)</span>
                <span className="text-content-primary font-mono">22.26m</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">mcap (circ)</span>
                <span className="text-content-primary font-mono">21.06m</span>
              </div>
            </div>

            {/* RESERVE */}
            <div className="flex flex-col gap-3">
              <div className="text-content-tertiary text-[10px] tracking-widest uppercase font-bold mb-1">RESERVE</div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">liquidity</span>
                <div className="text-right">
                  <div className="text-content-primary font-mono">$4.24m</div>
                  <div className="text-content-tertiary font-mono text-[10px] mt-0.5">1870.6454 eth</div>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs whitespace-nowrap mr-2">eth backing / sato</span>
                <span className="text-content-primary font-mono">$0.216</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">burnt fees</span>
                <span className="text-content-primary font-mono">97.7573 eth</span>
              </div>
            </div>

            {/* ACTIVITY */}
            <div className="flex flex-col gap-3">
              <div className="text-content-tertiary text-[10px] tracking-widest uppercase font-bold mb-1">ACTIVITY</div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">vol 24h</span>
                <span className="text-content-primary font-mono">$925.79k</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-content-secondary text-xs">txns 24h</span>
                <span className="text-content-primary font-mono">1,026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Issuance Comparison (Full Width Now) */}
        <div>
          <h2 className="text-content-primary font-semibold tracking-wide mb-6 uppercase text-sm">issuance comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bitcoin */}
            <div className="space-y-4 border border-border p-6 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-content-secondary font-medium">bitcoin issuance</span>
                <span className="text-content-tertiary text-xs">now: <span className="text-content-primary font-mono">3.125 btc/block</span></span>
              </div>
              <BitcoinIssuanceChart />
            </div>

            {/* Sato */}
            <div className="space-y-4 border border-border p-6 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-content-secondary font-medium">sato issuance</span>
                <span className="text-content-tertiary text-xs">now: <span className="text-content-primary font-mono">1k sato/eth</span></span>
              </div>
              <SatoIssuanceChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
