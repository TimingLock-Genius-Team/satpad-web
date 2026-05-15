"use client";

import { useTokenHolders, useTokenTrades } from "@/lib/api-hooks";
import type { ApiHolder, ApiTrade } from "@/lib/api-types";

interface TokenActivityPanelsProps {
  address: string;
  network?: string;
}

function fmtEth(wei: string): string {
  const n = Number(wei) / 1e18;
  if (Number.isNaN(n)) return "0";
  return n < 0.0001 ? n.toExponential(2) : n.toFixed(4);
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function fmtTime(ts: number): string {
  const date = new Date(ts * 1000);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border border-border p-4 md:p-5 rounded-card bg-surface shadow-sm min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-content-primary font-bold tracking-widest uppercase text-xs">
          {title}
        </h3>
      </div>
      {children}
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
        <div className="divide-y divide-border/50">
          {trades.map((trade) => {
            const side = trade.side.toLowerCase();
            const sideClass =
              side === "buy" ? "text-accent-success" : "text-accent-danger";

            return (
              <div
                key={`${trade.txHash}-${trade.logIndex}`}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-3 text-xs first:pt-0 last:pb-0"
              >
                <div className={`font-bold uppercase tracking-widest ${sideClass}`}>
                  {trade.side}
                </div>
                <div className="min-w-0 text-right">
                  <div className="font-mono text-content-primary truncate">
                    {fmtEth(trade.tokens)} tokens
                  </div>
                  <div className="mt-1 text-content-tertiary">
                    {fmtEth(trade.netOkb)} OKB net / {fmtEth(trade.grossOkb)} gross
                  </div>
                </div>
                <div className="font-mono text-content-secondary">
                  {shortAddress(trade.user)}
                </div>
                <div className="text-right text-content-tertiary">
                  {fmtTime(trade.ts)} · block {trade.blockNumber}
                </div>
              </div>
            );
          })}
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
        <div className="divide-y divide-border/50">
          {holders.map((holder) => (
            <div
              key={`${holder.holder}-${holder.lastBlock}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 py-3 text-xs first:pt-0 last:pb-0"
            >
              <div className="font-mono text-content-secondary truncate">
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
