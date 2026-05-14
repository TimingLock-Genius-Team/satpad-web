"use client";

import { useState } from "react";
import { Token } from "@/types/token";
import { ArrowRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TradePanel({ token }: { token: Token }) {
  const [tradeType, setTradeType] = useState<"mint" | "burn">("mint");
  const isMint = tradeType === "mint";

  return (
    <div className="flex flex-col border border-border p-6 rounded-card bg-surface shadow-sm">
      {/* Tabs */}
      <div className="flex w-full mb-6 border border-border rounded-input overflow-hidden text-sm font-semibold tracking-wide">
        <button
          onClick={() => setTradeType("mint")}
          className={`flex-1 py-3 transition-colors uppercase text-xs ${
            isMint ? "bg-surface-highlight text-accent-primary" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-base"
          }`}
        >
          mint
        </button>
        <button
          onClick={() => setTradeType("burn")}
          className={`flex-1 py-3 border-l border-border transition-colors uppercase text-xs ${
            !isMint ? "bg-surface-highlight text-accent-danger" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-base"
          }`}
        >
          burn
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Input Area */}
        <div className="bg-surface-base border border-border/50 p-4 rounded-input transition-colors focus-within:border-border">
          <div className="flex justify-between text-xs text-content-tertiary font-medium mb-3 uppercase tracking-wider">
            <span>pay</span>
            <span>bal:</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl text-content-primary w-1/2 placeholder:text-content-tertiary font-mono"
            />
            <button className={`text-xs font-mono flex gap-1 hover:opacity-80 transition-opacity px-2 py-1 rounded bg-surface-highlight ${isMint ? "text-accent-primary" : "text-accent-danger"}`}>
              <span>max</span> <span className="text-content-secondary uppercase">{isMint ? "eth" : "sato"}</span>
            </button>
          </div>
        </div>

        {/* Max Mint Subtext */}
        <div className="text-right text-[10px] text-content-tertiary font-mono border-b border-border/30 pb-4 mb-2">
          max mint 5 ETH
        </div>

        {/* Info Box */}
        <div className="text-xs font-mono text-content-secondary space-y-2 mt-2 bg-surface-highlight/30 p-3 rounded-input">
          <div className="flex justify-between">
            <span>minting</span>
            <span className="text-content-primary">0.00 <span className="text-content-secondary text-[10px]">SATO</span></span>
          </div>
          <div className="flex justify-between">
            <span>for</span>
            <span className="text-content-primary">0.0000 <span className="text-content-secondary text-[10px]">ETH</span></span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border/30">
            <span>price impact</span>
            <span className="text-content-primary">0.00%</span>
          </div>
        </div>

        {/* Link */}
        <div className="text-left mt-2 mb-4">
          <a href="#" className="text-xs text-content-tertiary hover:text-content-secondary flex items-center justify-start gap-1 font-medium transition-colors">
            trade on uniswap <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Action Button */}
        <button className="w-full py-3.5 bg-surface-highlight border border-border/50 text-content-tertiary font-semibold uppercase tracking-widest text-xs rounded-input cursor-not-allowed transition-colors">
          {isMint ? "mint sato" : "burn sato"}
        </button>

        {/* Footer Text */}
        <div className="text-[10px] text-content-tertiary/70 font-mono mt-4 text-center leading-relaxed max-w-[200px] mx-auto">
          calls SatoSwapRouter via Uniswap V4 PoolManager 0x06A...45E3
        </div>
      </div>
    </div>
  );
}

