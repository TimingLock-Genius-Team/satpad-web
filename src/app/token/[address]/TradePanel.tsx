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
  const quoteMovedToUniswap = isMovedToUniswapError(quoteError);
  const quoteErrorMessage = apiErrorMessage(quoteError);

  const mintLabel = `mint ${tokenSymbol}`;
  const burnLabel = `burn ${tokenSymbol}`;
  const actionLabel = isMint ? mintLabel : burnLabel;
  const buttonState = getButtonState({ isConnected, amount, quoteLoading, quoteError, txStage, txError, quote, actionLabel });

  return (
    <div className="flex flex-col w-full bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-[24px] shadow-2xl relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-[rgb(var(--token-rgb))] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />
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
      <div className="flex w-full mb-6 border border-border rounded-input overflow-hidden text-sm font-semibold tracking-wide">
        {!mintClosed && (
          <button
            onClick={() => { if (!txBusy) { setTradeType("mint"); setAmount(""); setTxError(null); } }}
            disabled={txBusy}
            className={`flex-1 py-3 transition-colors uppercase text-xs disabled:opacity-50 ${
              isMint ? "bg-surface-highlight text-accent-primary" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-base"
            }`}
          >
            mint
          </button>
        )}
        <button
          onClick={() => { if (!txBusy) { setTradeType("burn"); setAmount(""); setTxError(null); } }}
          disabled={txBusy}
          className={`flex-1 py-3 ${mintClosed ? "" : "border-l border-border"} transition-colors uppercase text-xs disabled:opacity-50 ${
            !isMint ? "bg-surface-highlight text-accent-danger" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-base"
          }`}
        >
          burn
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
          <div className="bg-surface-base border border-border/50 p-4 rounded-input transition-colors focus-within:border-border">
            <div className="flex justify-between text-xs text-content-tertiary font-medium mb-3">
              <span>Pay</span>
              <span>Bal: {balanceLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="0.0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-transparent outline-none text-2xl text-content-primary flex-1 min-w-0 placeholder:text-content-tertiary font-mono"
              />
              <button
                onClick={handleSetMax}
                disabled={!activeBalance?.value || txBusy}
                className={`text-xs font-mono flex items-baseline justify-center gap-1 hover:opacity-80 transition-opacity px-2 py-1 rounded bg-surface-highlight disabled:opacity-50 ${isMint ? "text-accent-primary" : "text-accent-danger"}`}
              >
                <span>max</span>
                <span className="text-content-secondary uppercase">{inputAssetSymbol}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quote Info Box */}
        {quoteLoading && amount && amount !== "0" && (
          <div className="flex items-center justify-center gap-2 text-xs text-content-tertiary py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Fetching quote...
          </div>
        )}
        {quoteError && amount && amount !== "0" && (
          <div className="text-xs text-accent-danger text-center py-2">
            {quoteErrorMessage ?? "Failed to get quote"}
          </div>
        )}
        {quote && amount && amount !== "0" && (
          <div className={txBusy ? "opacity-50" : ""}>
            <div className="text-xs font-mono text-content-secondary space-y-2 mt-2 bg-surface-highlight/30 p-3 rounded-input">
              <div className="flex justify-between">
                <span>{isMint ? "minting" : "burning"}</span>
                <span className="text-content-primary">
                  {fmtTokenDisplay(isMint ? quote.amountOut : quote.amountIn)} <span className="text-content-secondary text-[10px]">{tokenSymbol}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>for</span>
                <span className="text-content-primary">
                  {fmtOkbDisplay(isMint ? quote.amountIn : quote.amountOut)} <span className="text-content-secondary text-[10px]">OKB</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>fee</span>
                <span className="text-content-primary">{fmtOkbDisplay(quote.fee)} OKB</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/30">
                <span>price impact</span>
                <span className={priceImpact > 5 ? "text-accent-danger" : "text-content-primary"}>
                  {(priceImpact / 100).toFixed(2)}%
                </span>
              </div>
              {minReceived && (
                <div className="flex justify-between">
                  <span>min received</span>
                  <span className="text-content-primary">
                    {minReceived.amount} <span className="text-content-secondary text-[10px]">{minReceived.symbol}</span>
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
          className={`w-full py-3.5 font-semibold uppercase tracking-widest text-xs rounded-input transition-all flex items-center justify-center gap-2 ${
            txStage === "success"
              ? "bg-accent-success text-white"
              : isMint
                ? "bg-accent-primary text-surface-base hover:bg-accent-primary/90"
                : "bg-accent-danger text-white hover:bg-accent-danger/90"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {txStage === "confirming" && <Loader2 className="w-4 h-4 animate-spin" />}
          {buttonState.label}
        </button>

        {/* Footer Text */}
        <div className="text-[10px] text-content-tertiary/70 font-mono mt-4 text-center leading-relaxed max-w-[200px] mx-auto">
          via Eulr Backend API · {targetChain.name}
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
