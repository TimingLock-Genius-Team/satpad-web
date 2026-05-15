"use client";

import { useState, useCallback, useMemo } from "react";
import { parseUnits } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useQuote } from "@/lib/api-hooks";
import { getDefaultNetwork } from "@/lib/api";
import { chainForSatpadNetwork } from "@/config/chains";
import { sendPreparedTransactions } from "@/lib/wallet-txs";

interface TradePanelProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenPriceOkb: string;
  progress: number;
}

function fmtOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return isNaN(n) ? 0 : n;
}

function fmtOkbDisplay(wei: string): string {
  const okb = fmtOkb(wei);
  if (okb < 0.0001) return okb.toExponential(2);
  return okb.toFixed(6);
}

function fmtTokenDisplay(wei: string): string {
  const n = Number(wei) / 1e18;
  if (isNaN(n)) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
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

export function TradePanel({ tokenAddress, tokenSymbol }: TradePanelProps) {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const [tradeType, setTradeType] = useState<"mint" | "burn">("mint");
  const [amount, setAmount] = useState("");
  const [slippageBps] = useState(100);
  const [txBusy, setTxBusy] = useState(false);

  const isMint = tradeType === "mint";

  const amountWeiString = useMemo(() => {
    const wei = parseHumanToWei(amount.trim());
    return wei === null ? null : wei.toString();
  }, [amount]);

  const networkKey = getDefaultNetwork();
  const targetChain = chainForSatpadNetwork(networkKey);
  const requestTxCalldata = isConnected && !!walletAddress;

  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuote(
    tokenAddress,
    {
      side: tradeType,
      amount: amountWeiString ?? "0",
      slippageBps,
      includeTx: requestTxCalldata,
      recipient: walletAddress,
    },
    !!amountWeiString && (!requestTxCalldata || !!walletAddress)
  );

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSetMax = useCallback(() => {
    const maxWei = "10000000000000000000";
    const maxOkb = fmtOkb(maxWei);
    setAmount(maxOkb.toFixed(6));
  }, []);

  const handleTrade = useCallback(async () => {
    if (!quote?.txs?.length || !walletAddress || !walletClient || !publicClient || txBusy)
      return;
    try {
      setTxBusy(true);
      if (switchChainAsync && chainId !== targetChain.id) {
        await switchChainAsync({ chainId: targetChain.id });
      }
      await sendPreparedTransactions(walletClient, publicClient, quote.txs);
      await queryClient.invalidateQueries({ queryKey: ["tokens"] });
      await queryClient.invalidateQueries({ queryKey: ["token-detail", tokenAddress] });
      await queryClient.invalidateQueries({ queryKey: ["token-summary", tokenAddress] });
      setAmount("");
    } catch (err) {
      console.error(err);
      window.alert(
        err instanceof Error ? err.message : "Transaction failed. Check your wallet and network."
      );
    } finally {
      setTxBusy(false);
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

  return (
    <div className="flex flex-col w-full border border-border p-6 rounded-card bg-surface shadow-sm">
      {/* Tabs */}
      <div className="flex w-full mb-6 border border-border rounded-input overflow-hidden text-sm font-semibold tracking-wide">
        <button
          onClick={() => { setTradeType("mint"); setAmount(""); }}
          className={`flex-1 py-3 transition-colors uppercase text-xs ${
            isMint ? "bg-surface-highlight text-accent-primary" : "text-content-tertiary hover:text-content-secondary hover:bg-surface-base"
          }`}
        >
          mint
        </button>
        <button
          onClick={() => { setTradeType("burn"); setAmount(""); }}
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
            <span>bal: --</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="bg-transparent outline-none text-2xl text-content-primary w-1/2 placeholder:text-content-tertiary font-mono"
            />
            <button
              onClick={handleSetMax}
              className={`text-xs font-mono flex gap-1 hover:opacity-80 transition-opacity px-2 py-1 rounded bg-surface-highlight ${isMint ? "text-accent-primary" : "text-accent-danger"}`}
            >
              <span>max</span> <span className="text-content-secondary uppercase">OKB</span>
            </button>
          </div>
        </div>

        {/* Quote Info Box */}
        {quoteLoading && amount && amount !== "0" && (
          <div className="text-xs text-content-tertiary text-center py-2">
            Fetching quote...
          </div>
        )}
        {quoteError && amount && amount !== "0" && (
          <div className="text-xs text-accent-danger text-center py-2">
            Failed to get quote
          </div>
        )}
        {quote && amount && amount !== "0" && (
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
            {quote.minOut && (
              <div className="flex justify-between">
                <span>min received</span>
                <span className="text-content-primary">
                  {fmtOkbDisplay(quote.minOut)} OKB
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <button className="w-full py-3.5 bg-surface-highlight border border-border/50 text-content-tertiary font-semibold uppercase tracking-widest text-xs rounded-input cursor-not-allowed transition-colors">
            Connect Wallet
          </button>
        ) : !amount || amount === "0" ? (
          <button className="w-full py-3.5 bg-surface-highlight border border-border/50 text-content-tertiary font-semibold uppercase tracking-widest text-xs rounded-input cursor-not-allowed transition-colors">
            Enter an amount
          </button>
        ) : (
          <button
            onClick={handleTrade}
            disabled={quoteLoading || !!quoteError || txBusy || !quote?.txs?.length}
            className={`w-full py-3.5 font-semibold uppercase tracking-widest text-xs rounded-input transition-all ${
              isMint
                ? "bg-accent-primary text-surface-base hover:bg-accent-primary/90 shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                : "bg-accent-danger text-white hover:bg-accent-danger/90 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {quoteLoading ? "Fetching quote..." : isMint ? "mint " + tokenSymbol : "burn " + tokenSymbol}
          </button>
        )}

        {/* Footer Text */}
        <div className="text-[10px] text-content-tertiary/70 font-mono mt-4 text-center leading-relaxed max-w-[200px] mx-auto">
          via Eulr Backend API · HashKey Testnet
        </div>
      </div>
    </div>
  );
}
