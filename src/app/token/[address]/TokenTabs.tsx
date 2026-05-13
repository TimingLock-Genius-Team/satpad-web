"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

const trades = [
  { time: "4h ago", type: "BUY", okb: "0.750", mrock: "118.2k", trader: "0x91d2..32d2" },
  { time: "4h ago", type: "SELL", okb: "4.850", mrock: "819.2k", trader: "0x1e03..c5d5" },
  { time: "4h ago", type: "BUY", okb: "3.950", mrock: "684.7k", trader: "0x2a3f..95fb" },
  { time: "4h ago", type: "BUY", okb: "3.050", mrock: "532.9k", trader: "0x3010..3355" },
  { time: "4h ago", type: "SELL", okb: "2.150", mrock: "371.9k", trader: "0x3675..4318" },
  { time: "4h ago", type: "BUY", okb: "1.250", mrock: "210.3k", trader: "0x4dfa..6fd1" },
  { time: "4h ago", type: "BUY", okb: "0.350", mrock: "56.2k", trader: "0x5e1d..8900" },
  { time: "4h ago", type: "SELL", okb: "4.450", mrock: "975.8k", trader: "0x64b4..555d" },
  { time: "4h ago", type: "BUY", okb: "3.550", mrock: "753.9k", trader: "0x6fc4..e76c" },
  { time: "4h ago", type: "BUY", okb: "2.650", mrock: "535.3k", trader: "0xee22..193c" },
  { time: "4h ago", type: "SELL", okb: "1.750", mrock: "330.2k", trader: "0xb360..6762" },
  { time: "4h ago", type: "BUY", okb: "0.850", mrock: "147.2k", trader: "0x9729..b8b1" },
];

const holders = [
  { rank: 1, address: "0x1b23...aee7", balance: "945k", percentage: "18.00%", isYou: false, isCreator: false },
  { rank: 2, address: "0x4c2a...8a23", balance: "650.1k", percentage: "12.38%", isYou: true, isCreator: false },
  { rank: 3, address: "0xe8bf...7032", balance: "493.4k", percentage: "9.40%", isYou: false, isCreator: false },
  { rank: 4, address: "0x90a2...6c3d", balance: "424.5k", percentage: "8.09%", isYou: false, isCreator: false },
  { rank: 5, address: "0x72f2...de17", balance: "321.2k", percentage: "6.12%", isYou: false, isCreator: true },
  { rank: 6, address: "0xc26a...5274", balance: "236.1k", percentage: "4.50%", isYou: false, isCreator: false },
  { rank: 7, address: "0x0e70...f969", balance: "223k", percentage: "4.25%", isYou: false, isCreator: false },
  { rank: 8, address: "0x7cf0...e1d3", balance: "163.1k", percentage: "3.11%", isYou: false, isCreator: false },
  { rank: 9, address: "0x5df7...b41b", balance: "111.8k", percentage: "2.13%", isYou: false, isCreator: false },
  { rank: 10, address: "0x6c82...99b9", balance: "125k", percentage: "2.38%", isYou: false, isCreator: false },
  { rank: 11, address: "0xa390...2d4b", balance: "85.6k", percentage: "1.63%", isYou: false, isCreator: false },
  { rank: 12, address: "0xd3f7...48c6", balance: "50.3k", percentage: "0.96%", isYou: false, isCreator: false },
  { rank: 13, address: "0x321a...cc3e", balance: "76k", percentage: "1.45%", isYou: false, isCreator: false },
  { rank: 14, address: "0xb027...f067", balance: "46.3k", percentage: "0.88%", isYou: false, isCreator: false },
  { rank: 15, address: "0x6f22...6fa3", balance: "76.3k", percentage: "1.45%", isYou: false, isCreator: false },
];

export function TokenTabs() {
  const [activeTab, setActiveTab] = useState<'trades' | 'holders' | 'about'>('holders');

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 pt-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('trades')}
            className={`py-4 text-sm transition-colors ${
              activeTab === 'trades'
                ? 'text-content-primary border-b-2 border-accent-primary font-bold -mb-[1px]'
                : 'text-content-tertiary font-semibold hover:text-content-secondary'
            }`}
          >
            Trades
          </button>
          <button
            onClick={() => setActiveTab('holders')}
            className={`py-4 text-sm transition-colors ${
              activeTab === 'holders'
                ? 'text-content-primary border-b-2 border-accent-primary font-bold -mb-[1px]'
                : 'text-content-tertiary font-semibold hover:text-content-secondary'
            }`}
          >
            Holders
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 text-sm transition-colors ${
              activeTab === 'about'
                ? 'text-content-primary border-b-2 border-accent-primary font-bold -mb-[1px]'
                : 'text-content-tertiary font-semibold hover:text-content-secondary'
            }`}
          >
            About
          </button>
        </div>
        {activeTab === 'trades' && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-content-secondary tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_var(--accent-primary)]"></div>
            LIVE
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {activeTab === 'trades' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-content-tertiary uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold whitespace-nowrap border-b border-border">Time</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap border-b border-border">Type</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap text-center border-b border-border">OKB</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap text-right border-b border-border">MROCK</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap text-left border-b border-border">Trader</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr
                  key={i}
                  className={`hover:bg-surface-highlight/30 transition-colors group ${
                    i !== trades.length - 1 ? "border-b border-border/20" : ""
                  }`}
                >
                  <td className="py-3.5 px-6 text-content-secondary whitespace-nowrap text-xs">
                    {trade.time}
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center w-fit ${
                          trade.type === "BUY"
                            ? "text-accent-primary bg-accent-primary/10"
                            : "text-accent-danger bg-accent-danger/10"
                        }`}
                      >
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono text-content-primary whitespace-nowrap text-xs">
                    {trade.okb} OKB
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-content-primary whitespace-nowrap text-xs">
                    {trade.mrock} MROCK
                  </td>
                  <td className="py-3.5 px-6 text-left font-mono text-content-secondary whitespace-nowrap text-xs">
                    <div className="flex items-center gap-2">
                      {trade.trader}
                      <ExternalLink className="w-3.5 h-3.5 text-content-tertiary group-hover:text-content-primary cursor-pointer transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'holders' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-content-tertiary uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold whitespace-nowrap border-b border-border">#</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap border-b border-border">Holder</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap text-right border-b border-border">Balance</th>
                <th className="py-4 px-6 font-semibold whitespace-nowrap text-right border-b border-border">% OF SUPPLY</th>
              </tr>
            </thead>
            <tbody>
              {holders.map((holder, i) => (
                <tr
                  key={i}
                  className={`hover:bg-surface-highlight/30 transition-colors group ${
                    i !== holders.length - 1 ? "border-b border-border/20" : ""
                  }`}
                >
                  <td className="py-4 px-6 text-content-tertiary font-mono whitespace-nowrap text-xs">
                    {holder.rank}
                  </td>
                  <td className="py-4 px-6 font-mono text-content-secondary whitespace-nowrap text-xs">
                    <div className="flex items-center gap-2">
                      {holder.address}
                      {holder.isYou && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary tracking-wide">
                          YOU
                        </span>
                      )}
                      {holder.isCreator && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/20 text-[#3B82F6] tracking-wide">
                          CREATOR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-content-primary whitespace-nowrap text-xs">
                    {holder.balance}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-content-tertiary whitespace-nowrap text-xs">
                    {holder.percentage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'about' && (
          <div className="p-6 text-left">
            {/* Curve mechanics */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-content-primary mb-3">Curve mechanics</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                This token uses the sat1 bonding curve: <span className="bg-surface-highlight text-content-primary font-mono px-1.5 py-0.5 rounded text-[13px]">price = (S/K) × e^(okb/S)</span> with S = 100 OKB and K = 21,000,000. Each buy moves the price up the curve; each sell moves it down.
              </p>
            </div>

            {/* Contract */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-content-primary mb-4">Contract</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-6">
                  <span className="text-sm text-content-tertiary w-[88px] flex-shrink-0">Address</span>
                  <div className="bg-surface-highlight flex-1 rounded-md px-3 py-2 flex items-center gap-2 max-w-[500px]">
                    <span className="font-mono text-sm text-content-secondary">0xb05d...1be2</span>
                    <button className="text-content-tertiary hover:text-content-primary transition-colors ml-1">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-content-tertiary hover:text-content-primary transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className="text-sm text-content-tertiary w-[88px] flex-shrink-0">Creator</span>
                  <div className="bg-surface-highlight flex-1 rounded-md px-3 py-2 flex items-center gap-2 max-w-[500px]">
                    <span className="font-mono text-sm text-content-secondary">0xd1df...a873</span>
                    <button className="text-content-tertiary hover:text-content-primary transition-colors ml-1">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-content-tertiary hover:text-content-primary transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <span className="text-sm text-content-tertiary w-[88px] flex-shrink-0">Deployment</span>
                  <div className="text-sm text-content-secondary">
                    Block #4,820,193 <span className="mx-1.5 text-content-tertiary">·</span> 2d ago
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <span className="text-sm text-content-tertiary w-[88px] flex-shrink-0">Verified</span>
                  <a href="#" className="text-sm text-accent-success hover:text-accent-success/80 transition-colors flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4" />
                    Source on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Liquidity destination */}
            <div>
              <h3 className="text-sm font-bold text-content-primary mb-3">Liquidity destination</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                When this token graduates (99% minted), the OKB reserve becomes liquidity in a Uniswap V4 pool. The LP position is <span className="text-accent-success font-medium">permanently burned</span> — no one can withdraw it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
