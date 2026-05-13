"use client";

import { useState } from "react";
import { ChevronDown, ArrowDown, Info } from "lucide-react";
import { Token } from "@/types/token";

export function TradePanel({ token }: { token: Token }) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const isBuy = tradeType === "buy";

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sticky top-24">
      <div className="grid grid-cols-2 text-center mb-6 border-b border-border">
        <button
          onClick={() => setTradeType("buy")}
          className={`pb-3 text-sm transition-colors ${
            isBuy
              ? "font-bold text-content-primary border-b-2 border-accent-primary"
              : "font-semibold text-content-tertiary hover:text-content-secondary"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType("sell")}
          className={`pb-3 text-sm transition-colors ${
            !isBuy
              ? "font-bold text-accent-danger border-b-2 border-accent-danger"
              : "font-semibold text-content-tertiary hover:text-content-secondary"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        {/* INPUT: YOU PAY / YOU SELL */}
        <div>
          <div className="text-[10px] font-semibold text-content-tertiary uppercase mb-2 tracking-wider">
            {isBuy ? "You pay" : "You sell"}
          </div>
          <div
            className={`bg-[#0B0E14] rounded-xl p-4 flex items-center justify-between border border-border transition-colors ${
              isBuy ? "focus-within:border-accent-primary/50" : "focus-within:border-accent-danger/50"
            }`}
          >
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl font-bold text-content-primary w-1/2 placeholder:text-content-tertiary font-mono"
            />
            <div className="flex items-center gap-3">
              <button className="text-[10px] font-bold bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded transition-colors hover:bg-accent-primary/30">
                MAX
              </button>
              {isBuy ? (
                <div className="flex items-center gap-1 font-semibold text-sm cursor-pointer hover:text-content-primary transition-colors">
                  OKB
                  <ChevronDown className="w-4 h-4 text-content-secondary" />
                </div>
              ) : (
                <div className="flex items-center gap-1 font-semibold text-sm">
                  {token.symbol}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-content-tertiary text-right mt-2 font-mono">
            {isBuy ? "Balance: 12.45 OKB" : `Balance: 1.85M ${token.symbol}`}
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="flex justify-center -my-3 relative z-10">
          <button className="bg-surface border border-border w-8 h-8 rounded-full flex items-center justify-center text-content-secondary hover:text-content-primary hover:border-content-tertiary transition-colors">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* OUTPUT: YOU RECEIVE */}
        <div>
          <div className="text-[10px] font-semibold text-content-tertiary uppercase mb-2 tracking-wider">
            You receive (estimated)
          </div>
          <div
            className={`bg-[#0B0E14] rounded-xl p-4 flex items-center justify-between border border-border transition-colors ${
              isBuy ? "focus-within:border-accent-primary/50" : "focus-within:border-accent-danger/50"
            }`}
          >
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl font-bold text-content-primary w-1/2 placeholder:text-content-tertiary font-mono"
            />
            <div className="flex items-center gap-1 font-semibold text-sm">
              {isBuy ? token.symbol : "OKB"}
            </div>
          </div>
        </div>

        {/* Info List */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between text-xs">
            <span className="text-content-tertiary font-semibold tracking-wider">PRICE</span>
            <span className="font-mono text-content-secondary">
              {token.price.toExponential(2)} OKB
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-tertiary font-semibold tracking-wider">PRICE IMPACT</span>
            <span className="font-mono text-content-secondary">- 0.0%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-tertiary font-semibold tracking-wider">FEE (0.3%)</span>
            <span className="font-mono text-content-secondary">0.0000 OKB</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-content-tertiary font-semibold tracking-wider">MAX PER TX</span>
            <span className="font-mono text-content-secondary">10 OKB</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full py-4 font-bold rounded-xl mt-6 transition-all text-sm ${
            isBuy
              ? "bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-[#0B0E14]"
              : "bg-accent-danger/20 text-accent-danger hover:bg-accent-danger hover:text-white"
          }`}
        >
          Enter an amount
        </button>

        <div className="flex gap-2 text-[10px] text-content-tertiary mt-4 leading-relaxed p-3 bg-[#0B0E14] rounded-lg border border-border">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>
            Eulr never holds your funds. Trades execute against the bonding-curve contract.
          </p>
        </div>
      </div>
    </div>
  );
}
