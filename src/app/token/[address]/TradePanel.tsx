"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { parseUnits } from "viem";
import { ExternalLink, Loader2 } from "lucide-react";
import { useAccount, useBalance, useChainId, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useQuote } from "@/lib/api-hooks";
import { ApiError, getDefaultNetwork } from "@/lib/api";
import { chainForSatpadNetwork } from "@/config/chains";
import { sendPreparedTransactions } from "@/lib/wallet-txs";
import type { UniswapLinks } from "@/lib/uniswap-links";
import {
  fmtOkbDisplay,
  fmtTokenDisplay,
  formatBalanceDisplay,
  formatQuoteMinReceived,
  formatWeiForInput,
  tradeInputAssetSymbol,
} from "@/lib/trade-display";
import { buildQuoteBreakdownRows, type QuoteBreakdownRow } from "@/lib/quote-breakdown";

interface TradePanelProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenPriceOkb: string;
  progress: number;
  isGraduated?: boolean;
  isMigrated?: boolean;
  uniswapLinks?: UniswapLinks;
}

function parseHumanToWei(amount: string): bigint | null {
  if (!amount || amount === ".") return null;
  try {
    const wei = parseUnits(amount, 18);
    if (wei <= BigInt(0)) return null;
    return wei;
  } catch {
    return null;
  }
}

type TxStage = "idle" | "confirming" | "success";

function apiErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError && error.data && typeof error.data === "object" && "message" in error.data) {
    const message = (error.data as { message?: unknown }).message;
    return typeof message === "string" ? message : error.message;
  }
  return error instanceof Error ? error.message : null;
}

function isMovedToUniswapError(error: unknown): boolean {
  return apiErrorMessage(error)?.toLowerCase().includes("moved to uniswap") ?? false;
}

function formatQuoteRowAmount(row: QuoteBreakdownRow): string {
  return row.symbol === "OKB" ? fmtOkbDisplay(row.valueWei) : fmtTokenDisplay(row.valueWei);
}

export function TradePanel({ tokenAddress, tokenSymbol, isGraduated = false, isMigrated = false, uniswapLinks }: TradePanelProps) {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const [tradeType, setTradeType] = useState<"mint" | "burn">("mint");
  const [amount, setAmount] = useState("");
  const [slippageBps] = useState(100);
  const [txStage, setTxStage] = useState<TxStage>("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [txErrorExpanded, setTxErrorExpanded] = useState(false);

  const isMint = tradeType === "mint";
  const mintClosed = isGraduated || isMigrated;
  const tokenAddressHex = tokenAddress as `0x${string}`;
  const txBusy = txStage === "confirming";

  const amountWeiString = useMemo(() => {
    const wei = parseHumanToWei(amount.trim());
    return wei === null ? null : wei.toString();
  }, [amount]);

  const networkKey = getDefaultNetwork();
  const targetChain = chainForSatpadNetwork(networkKey);
  const requestTxCalldata = isConnected && !!walletAddress;
  const inputAssetSymbol = tradeInputAssetSymbol(tradeType, tokenSymbol);

  useEffect(() => {
    if (mintClosed && tradeType === "mint") {
      setTradeType("burn");
      setAmount("");
      setTxError(null);
    }
  }, [mintClosed, tradeType]);

  const { data: nativeBalance } = useBalance({
    address: walletAddress,
    chainId: targetChain.id,
    query: { enabled: isConnected && !!walletAddress && isMint },
  });
  const { data: tokenBalance } = useBalance({
    address: walletAddress,
    token: tokenAddressHex,
    chainId: targetChain.id,
    query: { enabled: isConnected && !!walletAddress && !isMint },
  });
  const activeBalance = isMint ? nativeBalance : tokenBalance;
  const balanceLabel = formatBalanceDisplay(
    activeBalance?.value,
    activeBalance?.decimals ?? 18,
    inputAssetSymbol
  );

  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuote(
    tokenAddress,
    {
      network: networkKey,
      side: tradeType,
      amount: amountWeiString ?? "0",
      slippageBps,
      includeTx: requestTxCalldata,
      recipient: walletAddress,
    },
    !!amountWeiString && (!requestTxCalldata || !!walletAddress) && !(isMint && mintClosed)
  );

  const handleAmountChange = (value: string) => {
    if (txBusy) return;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setTxError(null);
    }
  };

  const handleSetMax = useCallback(() => {
    if (!activeBalance?.value || txBusy) return;
    setAmount(formatWeiForInput(activeBalance.value, activeBalance.decimals));
  }, [activeBalance?.decimals, activeBalance?.value, txBusy]);

  const handleTrade = useCallback(async () => {
    if (!quote?.txs?.length || !walletAddress || !walletClient || !publicClient || txBusy)
      return;
    try {
      setTxStage("confirming");
      if (switchChainAsync && chainId !== targetChain.id) {
        await switchChainAsync({ chainId: targetChain.id });
      }
      await sendPreparedTransactions(walletClient, publicClient, quote.txs);
      await queryClient.invalidateQueries({ queryKey: ["tokens"] });
      await queryClient.invalidateQueries({ queryKey: ["token-detail", tokenAddress] });
      await queryClient.invalidateQueries({ queryKey: ["token-summary", tokenAddress] });
      await queryClient.invalidateQueries({ queryKey: ["token-trades", tokenAddress] });
      await queryClient.invalidateQueries({ queryKey: ["token-holders", tokenAddress] });
      await queryClient.invalidateQueries({ queryKey: ["token-chart", tokenAddress] });
      setTxStage("success");
      setAmount("");
      setTimeout(() => {
        setTxStage("idle");
      }, 2000);
    } catch (err) {
      console.error(err);
      setTxStage("idle");
      const msg =
        err instanceof Error ? err.message : "Transaction failed.";
      setTxError(msg);
    }
  }, [
    quote,
    walletAddress,
    walletClient,
    publicClient,
    txBusy,
    chainId,
    switchChainAsync,
    targetChain.id,
    queryClient,
    tokenAddress,
  ]);

  const priceImpact = quote?.priceImpactBps ?? 0;
  const minReceived = quote?.minOut
    ? formatQuoteMinReceived(tradeType, quote.minOut, tokenSymbol)
    : null;
  const quoteRows = quote
    ? buildQuoteBreakdownRows({ side: tradeType, tokenSymbol, quote })
    : [];
  const quoteMovedToUniswap = isMovedToUniswapError(quoteError);
  const quoteErrorMessage = apiErrorMessage(quoteError);

  const mintLabel = `mint ${tokenSymbol}`;
  const burnLabel = `burn ${tokenSymbol}`;
  const actionLabel = isMint ? mintLabel : burnLabel;
  const buttonState = getButtonState({ isConnected, amount, quoteLoading, quoteError, txStage, txError, quote, actionLabel });

  return (
    <div className={`flex flex-col w-full bg-[#050505]/90 backdrop-blur-2xl border ${txBusy ? "border-[rgba(var(--token-rgb),0.8)]" : "border-[rgba(var(--token-rgb),0.4)]"} p-6 md:p-8 rounded-[12px] shadow-[0_0_40px_rgba(var(--token-rgb),0.15)] relative overflow-hidden group/tradepanel transition-all duration-700 hover:shadow-[0_0_60px_rgba(var(--token-rgb),0.25)] hover:border-[rgba(var(--token-rgb),0.6)]`}>
      {/* Flowing Light Border Effect during Transaction */}
      <div 
        className={`absolute inset-0 z-50 pointer-events-none rounded-[12px] transition-opacity duration-500 ${txBusy ? "opacity-100" : "opacity-0"}`}
        style={{
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          filter: isMint ? 'drop-shadow(0 0 10px rgba(var(--token-rgb), 0.8))' : 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))',
        }}
      >
        <div 
          className="absolute inset-[-100%] animate-[spin_2s_linear_infinite]" 
          style={{ 
            backgroundImage: isMint 
              ? 'conic-gradient(from 0deg, transparent 0 280deg, rgba(var(--token-rgb), 1) 340deg, rgba(255,255,255,1) 360deg)' 
              : 'conic-gradient(from 0deg, transparent 0 280deg, rgba(239, 68, 68, 1) 340deg, rgba(255,255,255,1) 360deg)'
          }}
        />
      </div>

      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--token-rgb),0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--token-rgb),0.05)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-[rgb(var(--token-rgb))] rounded-full blur-[100px] opacity-[0.15] pointer-events-none group-hover/tradepanel:opacity-[0.25] transition-opacity duration-700" />
      <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-[rgb(var(--token-rgb))] rounded-full blur-[100px] opacity-[0.1] pointer-events-none group-hover/tradepanel:opacity-[0.2] transition-opacity duration-700" />

      {/* Top Edge Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(var(--token-rgb),0.8)] to-transparent opacity-60" />

      <div className="relative z-10">
      {isMigrated || quoteMovedToUniswap ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-input border border-accent-primary/30 bg-accent-primary/10 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-2">
              migrated to Uniswap
            </div>
            <p className="text-sm text-content-secondary leading-relaxed">
              Bonding-curve trading is closed after migration. Continue trading this token on Uniswap.
            </p>
          </div>
          <a
            href={uniswapLinks?.defaultUrl ?? "https://app.uniswap.org"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 font-semibold uppercase tracking-widest text-xs rounded-input transition-all flex items-center justify-center gap-2 bg-accent-primary text-surface-base hover:bg-accent-primary/90"
          >
            Open Uniswap Pool
            <ExternalLink className="w-4 h-4" />
          </a>
          {uniswapLinks && (
            <div className="hidden grid-cols-2 gap-2">
              <a
                href={uniswapLinks.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest rounded-input border border-border text-content-secondary hover:text-content-primary hover:border-accent-primary/50 transition-colors"
              >
                Buy on Uniswap
              </a>
              <a
                href={uniswapLinks.sellUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest rounded-input border border-border text-content-secondary hover:text-content-primary hover:border-accent-primary/50 transition-colors"
              >
                Sell on Uniswap
              </a>
            </div>
          )}
          <div className="text-[10px] text-content-tertiary/70 font-mono mt-1 text-center leading-relaxed max-w-[240px] mx-auto">
            Eulr mint is permanently disabled after migration.
          </div>
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex w-full mb-8 border border-[rgba(var(--token-rgb),0.4)] bg-[#0A0A0A] rounded-[8px] overflow-hidden text-sm font-semibold tracking-[0.2em] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        {/* Animated glowing border for active tab */}
        <div 
          className={`absolute bottom-0 h-1 transition-all duration-500 ${isMint ? "bg-[rgb(var(--token-rgb))] shadow-[0_0_12px_rgb(var(--token-rgb))]" : "bg-accent-danger shadow-[0_0_12px_rgba(239,68,68,0.8)]"}`} 
          style={{ 
            width: mintClosed ? '100%' : '50%', 
            left: !isMint && !mintClosed ? '50%' : '0%' 
          }} 
        />
        {!mintClosed && (
          <button
            onClick={() => { if (!txBusy) { setTradeType("mint"); setAmount(""); setTxError(null); } }}
            disabled={txBusy}
            className={`flex-1 py-4 transition-all uppercase text-[13px] disabled:opacity-50 relative ${
              isMint 
                ? "bg-[rgba(var(--token-rgb),0.15)] text-[rgb(var(--token-rgb))] font-bold shadow-[inset_0_0_15px_rgba(var(--token-rgb),0.2)]" 
                : "text-content-tertiary hover:text-content-secondary hover:bg-[rgba(var(--token-rgb),0.05)]"
            }`}
          >
            MINT_MODE
          </button>
        )}
        <button
          onClick={() => { if (!txBusy) { setTradeType("burn"); setAmount(""); setTxError(null); } }}
          disabled={txBusy}
          className={`flex-1 py-4 ${mintClosed ? "" : "border-l border-[rgba(var(--token-rgb),0.2)]"} transition-all uppercase text-[13px] disabled:opacity-50 relative ${
            !isMint 
              ? "bg-accent-danger/15 text-accent-danger font-bold shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]" 
              : "text-content-tertiary hover:text-content-secondary hover:bg-accent-danger/5"
          }`}
        >
          BURN_MODE
        </button>
      </div>
      {mintClosed && (
        <div className="mb-4 rounded-input border border-border/50 bg-surface-base p-3 text-xs text-content-secondary leading-relaxed">
          <div className="text-content-primary font-bold uppercase tracking-widest mb-1">
            Graduated, migration pending
          </div>
          Minting is closed. Burning on the Eulr curve remains available until migration completes.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Input Area */}
        <div className={txBusy ? "opacity-50 pointer-events-none" : ""}>
          <div className="bg-[#0A0A0A] border border-[rgba(var(--token-rgb),0.3)] p-6 md:p-8 rounded-[12px] transition-all duration-300 focus-within:border-[rgb(var(--token-rgb))] focus-within:shadow-[0_0_25px_rgba(var(--token-rgb),0.15)] shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] relative overflow-hidden group/input">
            
            <div className="flex justify-between text-[11px] text-content-tertiary font-mono mb-6 tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--token-rgb))] rounded-sm opacity-80" />
                PAY_AMOUNT
              </span>
              <span className="text-[rgb(var(--token-rgb))] opacity-80 pb-0.5">BAL: {balanceLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-4 relative z-10">
              <input
                type="text"
                placeholder="0.0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-transparent outline-none text-2xl md:text-3xl text-content-primary flex-1 min-w-0 placeholder:text-content-tertiary/20 font-mono tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] leading-none"
              />
              <button
                onClick={handleSetMax}
                disabled={!activeBalance?.value || txBusy}
                className={`text-[11px] font-mono font-bold tracking-[0.2em] flex items-baseline justify-center gap-2 hover:opacity-100 opacity-80 transition-all px-4 py-2.5 rounded-[4px] border ${
                  isMint 
                    ? "border-[rgba(var(--token-rgb),0.5)] bg-[rgba(var(--token-rgb),0.1)] text-[rgb(var(--token-rgb))] hover:bg-[rgba(var(--token-rgb),0.2)] hover:shadow-[0_0_15px_rgba(var(--token-rgb),0.4)]" 
                    : "border-accent-danger/50 bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                } disabled:opacity-30 disabled:hover:shadow-none`}
              >
                <span>MAX</span>
                <span className="opacity-60">{inputAssetSymbol}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quote Info Box */}
        {quoteLoading && amount && amount !== "0" && (
          <div className="flex items-center justify-center gap-2 text-xs text-[rgb(var(--token-rgb))] py-2 font-mono opacity-80 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            COMPUTING_QUOTE...
          </div>
        )}
        {quoteError && amount && amount !== "0" && (
          <div className="text-xs text-accent-danger text-center py-2 font-mono bg-accent-danger/10 border border-accent-danger/30 rounded">
            [ERR] {quoteErrorMessage ?? "FAILED_TO_GET_QUOTE"}
          </div>
        )}
        {quote && amount && amount !== "0" && (
          <div className={txBusy ? "opacity-50" : ""}>
            <div className="text-[11px] font-mono text-content-secondary space-y-2 mt-2 bg-[#050505] border border-[rgba(var(--token-rgb),0.15)] p-3.5 rounded-input relative overflow-hidden">
              {/* Decorative scanline in quote box */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[rgb(var(--token-rgb))] opacity-20" />

              {isMint && (
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-tertiary">PAY</span>
                  <span className="text-content-primary font-bold group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">
                    {fmtOkbDisplay(quote.amountIn)} <span className="text-content-secondary text-[10px]">OKB</span>
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline group/row">
                <span className="text-content-tertiary">PLATFORM_FEE</span>
                <span className="text-content-primary group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">{fmtOkbDisplay(quote.fee)} OKB</span>
              </div>
              {quoteRows.map((row) => (
                <div key={`${row.label}-${row.symbol}`} className="flex justify-between items-baseline gap-4 group/row">
                  <span className="text-content-tertiary">
                    {row.label.toUpperCase().replace(/\s+/g, "_")}
                    {row.detail ? <span className="text-content-tertiary"> ({row.detail})</span> : null}
                  </span>
                  <span className="text-content-primary text-right font-bold group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">
                    {formatQuoteRowAmount(row)} <span className="text-content-secondary text-[10px]">{row.symbol}</span>
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-2 border-t border-[rgba(var(--token-rgb),0.1)] group/row">
                <span className="text-content-tertiary">PRICE_IMPACT</span>
                <span className={`${priceImpact > 5 ? "text-accent-danger" : "text-[rgb(var(--token-rgb))]"} font-bold`}>
                  {(priceImpact / 100).toFixed(2)}%
                </span>
              </div>
              {minReceived && (
                <div className="flex justify-between items-baseline group/row">
                  <span className="text-content-tertiary">MIN_RECEIVED</span>
                  <span className="text-content-primary group-hover/row:text-[rgb(var(--token-rgb))] transition-colors">
                    {minReceived.amount} <span className="text-content-tertiary text-[9px]">{minReceived.symbol}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tx Error */}
        {txError && (
          <div className="bg-accent-danger/10 border border-accent-danger/30 rounded-input p-3">
            <p className="text-accent-danger text-xs leading-relaxed break-all">
              {txErrorExpanded || txError.length <= 200
                ? txError
                : txError.slice(0, 200) + "..."}
            </p>
            {txError.length > 200 && (
              <button
                onClick={() => setTxErrorExpanded(!txErrorExpanded)}
                className="text-accent-danger/70 text-[10px] mt-1 hover:text-accent-danger underline"
              >
                {txErrorExpanded ? "Show less" : "Show full error"}
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleTrade}
          disabled={buttonState.disabled}
          className={`w-full py-4 font-mono font-bold uppercase tracking-[0.2em] text-xs rounded-input transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn border ${
            txStage === "success"
              ? "bg-accent-success text-white border-accent-success"
              : isMint
                ? "bg-[rgba(var(--token-rgb),0.1)] text-[rgb(var(--token-rgb))] border-[rgba(var(--token-rgb),0.4)] hover:bg-[rgba(var(--token-rgb),0.2)] hover:border-[rgb(var(--token-rgb))] hover:shadow-[0_0_15px_rgba(var(--token-rgb),0.3)]"
                : "bg-accent-danger/10 text-accent-danger border-accent-danger/40 hover:bg-accent-danger/20 hover:border-accent-danger hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-transparent`}
        >
          {/* Scanning light effect for button */}
          {!buttonState.disabled && (
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[rgba(var(--token-rgb),0.2)] to-transparent skew-x-12" />
          )}
          {txStage === "confirming" && <Loader2 className="w-4 h-4 animate-spin" />}
          <span className="relative z-10">{buttonState.label}</span>
        </button>

        {/* Footer Text */}
        <div className="text-[9px] text-content-tertiary/60 font-mono mt-4 text-center tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-accent-primary rounded-full animate-pulse" />
          <span>ROUTED_VIA_EULR_API // {targetChain.name}</span>
        </div>
      </div>
      </>
      )}
      </div>
    </div>
  );
}

function getButtonState(opts: {
  isConnected: boolean;
  amount: string;
  quoteLoading: boolean;
  quoteError: unknown;
  txStage: TxStage;
  txError: string | null;
  quote: unknown;
  actionLabel: string;
}) {
  const { isConnected, amount, quoteLoading, quoteError, txStage, txError, quote, actionLabel } = opts;

  if (!isConnected) {
    return { disabled: true, label: "Connect Wallet" };
  }
  if (txStage === "success") {
    return { disabled: true, label: "Success ✓" };
  }
  if (txStage === "confirming") {
    return { disabled: true, label: "Confirm in wallet..." };
  }
  if (txError) {
    return { disabled: true, label: "Transaction failed" };
  }
  if (!amount || amount === "0") {
    return { disabled: true, label: "Enter an amount" };
  }
  if (quoteLoading) {
    return { disabled: true, label: "Fetching quote..." };
  }
  if (quoteError || !(quote as { txs?: unknown[] } | null | undefined)?.txs?.length) {
    return { disabled: true, label: "Unavailable" };
  }
  return { disabled: false, label: actionLabel };
}
