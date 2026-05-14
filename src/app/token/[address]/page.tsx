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
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
            <div className="border border-border p-6 rounded-card bg-surface shadow-sm relative overflow-hidden flex flex-col gap-8">
              {/* Subtle background glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
              
              {/* Header Top Section */}
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start z-10">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Token Avatar - Distinctive box */}
                  <div className="relative group flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-surface-highlight to-surface border border-border/50 flex items-center justify-center shadow-inner overflow-hidden">
                      <span className="text-4xl font-bold text-content-primary tracking-tighter">
                        {token.symbol.substring(0, 2)}
                      </span>
                      {/* Decorative corner accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-primary/50 rounded-tl-2xl" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-primary/50 rounded-br-2xl" />
                    </div>
                  </div>

                  <div className="flex flex-col pt-1">
                    {/* Name & Symbol */}
                    <div className="flex items-end gap-4 mb-4">
                      <h1 className="text-3xl md:text-4xl font-bold text-content-primary tracking-tight leading-none">
                        {token.name}
                      </h1>
                      <div className="px-2.5 py-1 bg-surface-base border border-border/80 rounded-md text-xs font-mono text-accent-primary font-bold tracking-widest shadow-sm">
                        ${token.symbol}
                      </div>
                    </div>

                    {/* Meta Data Pill */}
                    <div className="flex flex-wrap items-center gap-0 text-xs font-mono bg-surface-base border border-border/50 rounded-lg overflow-hidden shadow-sm">
                      <div className="px-3 py-2 border-r border-border/50 flex items-center gap-2 group cursor-pointer hover:bg-surface-highlight transition-colors">
                        <span className="text-content-secondary group-hover:text-content-primary transition-colors">
                          {token.address}
                        </span>
                        <Copy className="w-3 h-3 text-content-tertiary group-hover:text-content-primary transition-colors" />
                      </div>
                      <div className="px-3 py-2 border-r border-border/50 flex items-center gap-2 text-content-secondary">
                        <span className="text-content-tertiary">by</span>
                        <span className="text-content-primary hover:underline cursor-pointer">
                          {token.creator}
                        </span>
                      </div>
                      <div className="px-3 py-2 text-content-tertiary flex items-center gap-2">
                        2d ago <ExternalLink className="w-3 h-3 hover:text-content-primary cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socials & Actions */}
                <div className="flex items-center gap-2 self-start">
                  <div className="flex bg-surface-base rounded-lg border border-border/50 shadow-sm p-1">
                    <a href="#" className="p-2 text-content-tertiary hover:text-content-primary hover:bg-surface-highlight rounded-md transition-all" title="X (Twitter)">
                      <XIcon className="w-4 h-4" />
                    </a>
                    <a href="#" className="p-2 text-content-tertiary hover:text-content-primary hover:bg-surface-highlight rounded-md transition-all" title="Telegram">
                      <Send className="w-4 h-4" />
                    </a>
                    <a href="#" className="p-2 text-content-tertiary hover:text-content-primary hover:bg-surface-highlight rounded-md transition-all" title="Website">
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex flex-col gap-4 p-5 rounded-xl bg-surface-base/80 border border-border/40 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-mono font-bold text-content-primary tracking-tight leading-none">
                      {token.progress.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-content-tertiary uppercase tracking-widest font-bold">Minted</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-content-secondary mb-1">
                      <span className="text-content-primary font-medium">{token.mintedAmount}</span> / {token.totalAmount}
                    </div>
                    <div className="text-[10px] text-content-tertiary uppercase tracking-widest font-semibold flex items-center justify-end gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-[brand-pulse_2s_ease-in-out_infinite]" />
                      ~75 OKB to grad
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="h-2.5 w-full bg-surface-highlight rounded-full overflow-hidden relative border border-border/30 shadow-inner">
                  {/* Subtle track pattern */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDRMNCBMMCAwWk00IDhMODg0WSIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+')] opacity-20" />
                  
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent-primary transition-all duration-1000 ease-out relative"
                    style={{ width: `${token.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                    <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white/40 to-transparent blur-[1px]" />
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
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-accent-primary rounded-sm" />
            <h2 className="text-content-primary font-bold tracking-widest uppercase text-xs">sato data</h2>
          </div>
          <div className="border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6 text-[11px]">
              {/* SUPPLY */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">SUPPLY</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">max</span>
                  <span className="text-content-primary font-mono font-medium">20.79m</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">circulating</span>
                  <span className="text-content-primary font-mono font-medium">19.66m</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">holders</span>
                  <span className="text-content-primary font-mono font-medium">9,519</span>
                </div>
              </div>

              {/* PRICE */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">PRICE</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">market</span>
                  <span className="text-accent-danger font-mono font-medium">$1.07</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">burn</span>
                  <span className="text-accent-danger font-mono font-medium">$0.8472</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">mint</span>
                  <span className="text-accent-primary font-mono font-medium">$1.88</span>
                </div>
              </div>

              {/* VALUATION */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">VALUATION</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">mcap (fd)</span>
                  <span className="text-content-primary font-mono font-medium">22.26m</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">mcap (circ)</span>
                  <span className="text-content-primary font-mono font-medium">21.06m</span>
                </div>
              </div>

              {/* RESERVE */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">RESERVE</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">liquidity</span>
                  <div className="text-right">
                    <div className="text-content-primary font-mono font-medium">$4.24m</div>
                    <div className="text-content-tertiary font-mono text-[9px] mt-0.5">1870.6454 eth</div>
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary whitespace-nowrap mr-2">eth backing / sato</span>
                  <span className="text-content-primary font-mono font-medium">$0.216</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">burnt fees</span>
                  <span className="text-content-primary font-mono font-medium">97.7573 eth</span>
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="flex flex-col gap-2">
                <div className="text-content-tertiary text-[9px] tracking-widest uppercase font-bold mb-1 border-b border-border/50 pb-1">ACTIVITY</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">vol 24h</span>
                  <span className="text-content-primary font-mono font-medium">$925.79k</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-content-secondary">txns 24h</span>
                  <span className="text-content-primary font-mono font-medium">1,026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Issuance Comparison (Full Width Now) */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-accent-primary rounded-sm" />
            <h2 className="text-content-primary font-bold tracking-widest uppercase text-xs">issuance comparison</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Bitcoin */}
            <div className="flex flex-col gap-3 border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">bitcoin issuance</span>
                <span className="text-content-tertiary text-[10px]">now: <span className="text-content-primary font-mono font-medium">3.125 btc/block</span></span>
              </div>
              <div className="flex-1">
                <BitcoinIssuanceChart />
              </div>
            </div>

            {/* Sato */}
            <div className="flex flex-col gap-3 border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-secondary font-bold tracking-wide uppercase text-[11px]">sato issuance</span>
                <span className="text-content-tertiary text-[10px]">now: <span className="text-content-primary font-mono font-medium">1k sato/eth</span></span>
              </div>
              <div className="flex-1">
                <SatoIssuanceChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
