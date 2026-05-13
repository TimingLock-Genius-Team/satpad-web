"use client";

import { useState } from "react";
import { Copy, Triangle, ExternalLink } from "lucide-react";

const mockHistory = [
  {
    time: "4h ago",
    token: { symbol: "PE", bgColor: "bg-[#10B981]", name: "PEPE2099", ticker: "PEPE" },
    type: "BUY",
    okb: "-1.300",
    tokenAmount: "+615.8k",
    link: "#",
  },
  {
    time: "14h ago",
    token: { symbol: "PE", bgColor: "bg-[#10B981]", name: "PEPE2099", ticker: "PEPE" },
    type: "BUY",
    okb: "-2.400",
    tokenAmount: "+615.8k",
    link: "#",
  },
  {
    time: "1d ago",
    token: { symbol: "PE", bgColor: "bg-[#10B981]", name: "PEPE2099", ticker: "PEPE" },
    type: "SELL",
    okb: "+0.500",
    tokenAmount: "-615.8k",
    link: "#",
  },
  {
    time: "1d ago",
    token: { symbol: "MO", bgColor: "bg-[#8B5CF6]", name: "MoonRune", ticker: "MOON" },
    type: "BUY",
    okb: "-0.600",
    tokenAmount: "+180.7k",
    link: "#",
  },
  {
    time: "1d ago",
    token: { symbol: "MO", bgColor: "bg-[#8B5CF6]", name: "MoonRune", ticker: "MOON" },
    type: "BUY",
    okb: "-1.700",
    tokenAmount: "+180.7k",
    link: "#",
  },
  {
    time: "2d ago",
    token: { symbol: "MO", bgColor: "bg-[#8B5CF6]", name: "MoonRune", ticker: "MOON" },
    type: "BUY",
    okb: "-2.800",
    tokenAmount: "+180.7k",
    link: "#",
  },
  {
    time: "2d ago",
    token: { symbol: "EU", bgColor: "bg-[#3B82F6]", name: "EulerCoin", ticker: "EULC" },
    type: "BUY",
    okb: "-2.900",
    tokenAmount: "+29.8k",
    link: "#",
  },
  {
    time: "2d ago",
    token: { symbol: "EU", bgColor: "bg-[#3B82F6]", name: "EulerCoin", ticker: "EULC" },
    type: "BUY",
    okb: "-1.000",
    tokenAmount: "+29.8k",
    link: "#",
  },
  {
    time: "3d ago",
    token: { symbol: "EU", bgColor: "bg-[#3B82F6]", name: "EulerCoin", ticker: "EULC" },
    type: "BUY",
    okb: "-2.100",
    tokenAmount: "+29.8k",
    link: "#",
  },
  {
    time: "3d ago",
    token: { symbol: "SI", bgColor: "bg-[#C0C334]", name: "SigmaInu", ticker: "SIGMA" },
    type: "BUY",
    okb: "-2.200",
    tokenAmount: "+706.8k",
    link: "#",
  },
];

const mockHoldings = [
  {
    symbol: "BK",
    bgColor: "bg-[#2563EB]",
    name: "BasedKitty",
    ticker: "BKITTY",
    hasSocials: true,
    balance: "6.8M",
    avgCost: "4.00e-7",
    price: "0.0004762",
    value: "$124,407.62",
    pnl: "+$124303.12",
    pnlPercent: "+118947.6%",
    isPositive: true,
    action: "Sell",
  },
  {
    symbol: "SI",
    bgColor: "bg-[#C0C334]",
    name: "SigmaInu",
    ticker: "SIGMA",
    hasSocials: false,
    balance: "2.12M",
    avgCost: "1.88e-6",
    price: "7.11e-6",
    value: "$579.03",
    pnl: "+$432.27",
    pnlPercent: "+294.5%",
    isPositive: true,
    action: "Trade",
  },
  {
    symbol: "PE",
    bgColor: "bg-[#10B981]",
    name: "PEPE2099",
    ticker: "PEPE",
    hasSocials: false,
    balance: "1.85M",
    avgCost: "9.50e-6",
    price: "7.61e-6",
    value: "$539.89",
    pnl: "-$134.38",
    pnlPercent: "-19.9%",
    isPositive: false,
    action: "Trade",
  },
  {
    symbol: "SA",
    bgColor: "bg-[#10B981]",
    name: "Sat1Genesis",
    ticker: "SATG",
    hasSocials: false,
    balance: "412k",
    avgCost: "2.80e-6",
    price: "1.98e-5",
    value: "$314.07",
    pnl: "+$269.89",
    pnlPercent: "+610.8%",
    isPositive: true,
    action: "Trade",
  },
  {
    symbol: "MO",
    bgColor: "bg-[#8B5CF6]",
    name: "MoonRune",
    ticker: "MOON",
    hasSocials: false,
    balance: "542.1k",
    avgCost: "4.10e-6",
    price: "9.16e-6",
    value: "$190.73",
    pnl: "+$105.44",
    pnlPercent: "+123.6%",
    isPositive: true,
    action: "Trade",
  },
  {
    symbol: "LL",
    bgColor: "bg-[#EF4444]",
    name: "LiquidLizard",
    ticker: "LLZD",
    hasSocials: false,
    balance: "38k",
    avgCost: "8.20e-5",
    price: "5.29e-5",
    value: "$77.25",
    pnl: "-$42.62",
    pnlPercent: "-35.6%",
    isPositive: false,
    action: "Trade",
  },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"holdings" | "history">("holdings");

  return (
    <div className="w-full max-w-[1260px] mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[32px] font-bold text-content-primary">Portfolio</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border text-sm">
          <span className="text-content-secondary font-mono">0x4c2a...8a23</span>
          <Copy className="w-4 h-4 text-content-tertiary cursor-pointer hover:text-content-primary transition-colors" />
          <span className="text-content-tertiary ml-1">(you)</span>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-[#13151A] rounded-xl border border-border p-6 md:p-8 mb-8">
        <div className="mb-8">
          <div className="text-content-tertiary text-xs font-semibold tracking-wider uppercase mb-2">
            TOTAL VALUE
          </div>
          <div className="text-5xl font-mono font-bold text-content-primary tracking-tight mb-2">
            $126,125.62
          </div>
          <div className="flex items-center gap-2">
            <Triangle className="w-3 h-3 text-accent-success fill-current" />
            <span className="text-accent-success font-mono font-medium">+$124927.75 (+9744.2%)</span>
            <span className="text-content-tertiary">all-time</span>
          </div>
        </div>

        <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-content-tertiary text-xs font-semibold tracking-wider uppercase mb-2">
              OKB BALANCE
            </div>
            <div className="text-xl font-mono font-bold text-content-primary mb-1">12.45 OKB</div>
            <div className="text-sm font-mono text-content-tertiary">$478.33</div>
          </div>
          <div>
            <div className="text-content-tertiary text-xs font-semibold tracking-wider uppercase mb-2">
              TOKENS HELD
            </div>
            <div className="text-xl font-mono font-bold text-content-primary">7</div>
          </div>
          <div>
            <div className="text-content-tertiary text-xs font-semibold tracking-wider uppercase mb-2">
              REALIZED PNL
            </div>
            <div className="text-xl font-mono font-bold text-accent-success">+$84.20</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        <div
          onClick={() => setActiveTab("holdings")}
          className={`pb-3 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === "holdings"
              ? "border-accent-success text-content-primary"
              : "border-transparent text-content-tertiary hover:text-content-primary"
          }`}
        >
          Holdings
        </div>
        <div
          onClick={() => setActiveTab("history")}
          className={`pb-3 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === "history"
              ? "border-accent-success text-content-primary"
              : "border-transparent text-content-tertiary hover:text-content-primary"
          }`}
        >
          History
        </div>
      </div>

      {/* Table */}
      {activeTab === "holdings" ? (
        <div className="bg-transparent rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-content-tertiary text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">TOKEN</th>
                <th className="px-6 py-4 font-semibold">BALANCE</th>
                <th className="px-6 py-4 font-semibold">AVG COST</th>
                <th className="px-6 py-4 font-semibold">PRICE</th>
                <th className="px-6 py-4 font-semibold flex items-center gap-1">
                  VALUE <span className="text-[10px]">↓</span>
                </th>
                <th className="px-6 py-4 font-semibold text-right">PNL</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-[#13151A]">
              {mockHoldings.map((token, idx) => (
                <tr key={idx} className="hover:bg-surface-highlight/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${token.bgColor}`}
                      >
                        {token.symbol}
                      </div>
                      <div>
                        <div className="font-semibold text-content-primary group-hover:text-accent-primary transition-colors">
                          {token.name}
                        </div>
                        <div className="text-xs text-content-tertiary flex items-center gap-1">
                          {token.ticker}
                          {token.hasSocials && (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 bg-surface-elevated rounded-sm inline-block"></span>
                              <span className="w-3 h-3 bg-surface-elevated rounded-sm inline-block"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium font-mono text-content-primary">{token.balance}</td>
                  <td className="px-6 py-4 font-medium text-content-secondary font-mono">
                    {token.avgCost}
                  </td>
                  <td className="px-6 py-4 font-medium text-content-secondary font-mono">
                    {token.price}
                  </td>
                  <td className="px-6 py-4 font-semibold font-mono text-content-primary">{token.value}</td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`font-semibold font-mono ${
                        token.isPositive ? "text-accent-success" : "text-accent-danger"
                      }`}
                    >
                      {token.pnl}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        token.isPositive ? "text-accent-success" : "text-accent-danger"
                      }`}
                    >
                      {token.pnlPercent}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                        token.action === "Sell"
                          ? "bg-surface-elevated hover:bg-surface-highlight text-content-primary border border-border"
                          : "bg-surface-elevated hover:bg-surface-highlight text-content-primary border border-border"
                      }`}
                    >
                      {token.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-transparent rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-content-tertiary text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">TIME</th>
                <th className="px-6 py-4 font-semibold">TOKEN</th>
                <th className="px-6 py-4 font-semibold">TYPE</th>
                <th className="px-6 py-4 font-semibold">OKB</th>
                <th className="px-6 py-4 font-semibold">TOKEN</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-[#13151A]">
              {mockHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-highlight/30 transition-colors group">
                  <td className="px-6 py-4 text-content-tertiary">{item.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px] ${item.token.bgColor}`}
                      >
                        {item.token.symbol}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-content-primary">{item.token.name}</span>
                        <span className="text-xs text-content-tertiary">{item.token.ticker}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.type === "BUY"
                          ? "bg-accent-success/10 text-accent-success"
                          : "bg-accent-danger/10 text-accent-danger"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 font-mono font-medium ${
                      item.okb.startsWith("+") ? "text-accent-success" : "text-content-secondary"
                    }`}
                  >
                    {item.okb}
                  </td>
                  <td
                    className={`px-6 py-4 font-mono font-medium ${
                      item.tokenAmount.startsWith("+") ? "text-accent-success" : "text-content-secondary"
                    }`}
                  >
                    {item.tokenAmount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={item.link}
                      className="text-content-tertiary hover:text-content-primary transition-colors inline-flex"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
