import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from "lucide-react";
import { MOCK_TOKENS } from "@/types/token";

const holdings = [
  {
    token: MOCK_TOKENS[0],
    amount: "1,250,000",
    value: "$595.25",
    pnl: "+$128.40",
    pnlPercent: "+27.5%",
  },
  {
    token: MOCK_TOKENS[2],
    amount: "500,000",
    value: "$3.97",
    pnl: "-$12.50",
    pnlPercent: "-75.9%",
  },
  {
    token: MOCK_TOKENS[4],
    amount: "100,000",
    value: "$2.80",
    pnl: "+$1.10",
    pnlPercent: "+64.7%",
  },
];

export default function PortfolioPage() {
  const totalValue = "$602.02";
  const totalPnl = "+$117.00";
  const pnlPositive = true;

  return (
    <div className="w-full">
      <section className="w-full border-b border-border pb-10 pt-12 md:pt-20 px-4 bg-surface-base">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-content-primary">
            Portfolio
          </h1>
          <p className="text-content-secondary text-base md:text-[17px] leading-relaxed">
            Track your token holdings and performance.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface rounded-xl p-5 border border-border">
            <div className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase mb-2">
              Total Value
            </div>
            <div className="text-2xl md:text-3xl font-bold text-content-primary">{totalValue}</div>
          </div>
          <div className="bg-surface rounded-xl p-5 border border-border">
            <div className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase mb-2">
              Total P&L
            </div>
            <div
              className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${pnlPositive ? "text-accent-success" : "text-accent-danger"}`}
            >
              {totalPnl}
              {pnlPositive ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="bg-surface rounded-xl p-5 border border-border">
            <div className="text-content-tertiary text-[11px] font-semibold tracking-wider uppercase mb-2">
              Tokens Held
            </div>
            <div className="text-2xl md:text-3xl font-bold text-content-primary">{holdings.length}</div>
          </div>
        </div>

        {holdings.length > 0 ? (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <Wallet className="w-4 h-4 text-content-tertiary" />
                Your Holdings
              </h2>
            </div>
            <div className="divide-y divide-border">
              {holdings.map((h) => (
                <Link
                  key={h.token.address}
                  href={`/token/${h.token.address}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-surface-highlight transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Image
                      src={h.token.avatarUrl}
                      alt={h.token.name}
                      width={40}
                      height={40}
                      className="rounded-full bg-surface-highlight flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-content-primary group-hover:text-accent-primary transition-colors truncate">
                        {h.token.name}
                      </div>
                      <div className="text-xs text-content-tertiary">
                        {h.token.symbol} · {h.amount}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-content-primary">{h.value}</div>
                    <div
                      className={`text-xs ${h.pnl.startsWith("+") ? "text-accent-success" : "text-accent-danger"}`}
                    >
                      {h.pnl} ({h.pnlPercent})
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-highlight flex items-center justify-center">
              <Wallet className="w-8 h-8 text-content-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-content-primary mb-2">No tokens yet</h3>
            <p className="text-content-tertiary text-sm mb-6 max-w-[360px] mx-auto">
              Start exploring and trading tokens to build your portfolio.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Explore Tokens
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
