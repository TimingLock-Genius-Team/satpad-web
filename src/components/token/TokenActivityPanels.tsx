"use client";

import type { ReactNode } from "react";
import { formatUnits } from "viem";
import { useTokenHolders, useTokenTrades } from "@/lib/api-hooks";
import type { ApiHolder, ApiTrade } from "@/lib/api-types";
import { toTradeSide } from "@/lib/trade-display";

interface TokenActivityPanelsProps {
  address: string;
  network?: string;
}

function fmtEth(wei: string): string {
  let amount: bigint;
  const zero = BigInt(0);

  try {
    amount = BigInt(wei);
  } catch {
    return "0";
  }

  if (amount === zero) return "0";

  const sign = amount < zero ? "-" : "";
  const decimal = formatUnits(amount < zero ? -amount : amount, 18);

  return `${sign}${fmtDecimal(decimal)}`;
}

function fmtDecimal(decimal: string): string {
  const [whole, fraction = ""] = decimal.split(".");

  if (whole === "0" && /^0*$/.test(fraction)) return "0";
  if (whole === "0" && fraction.slice(0, 4).padEnd(4, "0") === "0000") {
    return fmtSmallDecimal(fraction);
  }

  if (whole.length >= 13) return fmtCompact(whole, fraction, 12, "T");
  if (whole.length >= 10) return fmtCompact(whole, fraction, 9, "B");
  if (whole.length >= 7) return fmtCompact(whole, fraction, 6, "M");
  if (whole.length >= 4) return fmtCompact(whole, fraction, 3, "K");

  return `${whole}.${fraction.padEnd(4, "0").slice(0, 4)}`;
}

function fmtSmallDecimal(fraction: string): string {
  const firstNonZero = fraction.search(/[1-9]/);
  if (firstNonZero === -1) return "0";

  const significant = fraction.slice(firstNonZero, firstNonZero + 3).padEnd(3, "0");
  return `${significant[0]}.${significant.slice(1)}e-${firstNonZero + 1}`;
}

function fmtCompact(
  whole: string,
  fraction: string,
  exponent: number,
  suffix: string
): string {
  const decimalAt = whole.length - exponent;
  const leading = whole.slice(0, decimalAt);
  const compactFraction = `${whole.slice(decimalAt)}${fraction}`
    .slice(0, 2)
    .replace(/0+$/, "");

  return `${leading}${compactFraction ? `.${compactFraction}` : ""}${suffix}`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function fmtTime(ts: number): string {
  const date = new Date(ts * 1000);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 bg-surface/60 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[24px] shadow-2xl min-w-0 relative overflow-hidden group/panel transition-colors duration-500 hover:border-[rgba(var(--token-rgb),0.25)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--token-rgb))] rounded-full blur-[80px] opacity-[0.03] pointer-events-none group-hover/panel:opacity-[0.1] transition-opacity duration-500" />
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-content-primary font-bold tracking-widest uppercase text-xs">
          {title}
        </h3>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function TradesPanel({
  trades,
  isLoading,
  isError,
}: {
  trades: ApiTrade[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <PanelShell title="Recent Trades">
      {isError ? (
        <div className="text-sm text-content-tertiary">
          Unable to load indexed trades.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-content-tertiary">Loading trades...</div>
      ) : trades.length === 0 ? (
        <div className="text-sm text-content-tertiary">No indexed trades yet</div>
      ) : (
        <div className="max-h-[210px] overflow-y-auto -mr-3 pr-3">
          <div>
            {trades.map((trade, index) => {
              const side = toTradeSide(trade.side);
              const sideClass =
                side === "mint" ? "text-accent-success" : "text-accent-danger";

              return (
                <div
                  key={`${trade.txHash}-${trade.logIndex}`}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-3 text-xs first:pt-0 last:pb-0 border-b border-border/50 last:border-b-0 hover:bg-surface-highlight/20 rounded-lg px-2 -mx-2 transition-colors opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className={`font-bold uppercase tracking-widest ${sideClass}`}>
                    {side}
                  </div>
                  <div className="min-w-0 text-right">
                    <div className="font-mono text-content-primary truncate">
                      {fmtEth(trade.tokens)} tokens
                    </div>
                    <div className="mt-1 text-content-tertiary">
                      {fmtEth(trade.netOkb)} OKB net / {fmtEth(trade.grossOkb)} gross
                    </div>
                  </div>
                  <div
                    className="font-mono text-content-secondary"
                    title={trade.user}
                    aria-label={`User ${trade.user}`}
                  >
                    {shortAddress(trade.user)}
                  </div>
                  <div className="text-right text-content-tertiary">
                    {fmtTime(trade.ts)} · block {trade.blockNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function HoldersPanel({
  holders,
  isLoading,
  isError,
}: {
  holders: ApiHolder[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <PanelShell title="Holders">
      {isError ? (
        <div className="text-sm text-content-tertiary">
          Unable to load indexed holders.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-content-tertiary">Loading holders...</div>
      ) : holders.length === 0 ? (
        <div className="text-sm text-content-tertiary">No indexed holders yet</div>
      ) : (
        <div className="max-h-[210px] overflow-y-auto -mr-3 pr-3">
          <div>
            {holders.map((holder, index) => (
              <div
                key={`${holder.holder}-${holder.lastBlock}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 py-3 text-xs first:pt-0 last:pb-0 border-b border-border/50 last:border-b-0 hover:bg-surface-highlight/20 rounded-lg px-2 -mx-2 transition-colors opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className="font-mono text-content-secondary truncate"
                  title={holder.holder}
                  aria-label={`Holder ${holder.holder}`}
                >
                  {shortAddress(holder.holder)}
                </div>
                <div className="font-mono text-content-primary text-right">
                  {fmtEth(holder.balance)}
                </div>
                <div className="text-content-tertiary">balance</div>
                <div className="text-content-tertiary text-right">
                  last block {holder.lastBlock}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

export function TokenActivityPanels({ address, network }: TokenActivityPanelsProps) {
  const {
    data: tradesData,
    isLoading: tradesLoading,
    isError: tradesError,
  } = useTokenTrades(address, { network, limit: 25 });
  const {
    data: holdersData,
    isLoading: holdersLoading,
    isError: holdersError,
  } = useTokenHolders(address, { network, limit: 25 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
      <TradesPanel
        trades={tradesData?.items ?? []}
        isLoading={tradesLoading}
        isError={tradesError}
      />
      <HoldersPanel
        holders={holdersData?.items ?? []}
        isLoading={holdersLoading}
        isError={holdersError}
      />
    </div>
  );
}
