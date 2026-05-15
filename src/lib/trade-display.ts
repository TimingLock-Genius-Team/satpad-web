import { formatUnits } from "viem";

export type TradeSide = "mint" | "burn";

export function fmtOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return Number.isNaN(n) ? 0 : n;
}

export function fmtOkbDisplay(wei: string): string {
  const okb = fmtOkb(wei);
  if (okb < 0.0001) return okb.toExponential(2);
  return okb.toFixed(6);
}

export function fmtTokenDisplay(wei: string): string {
  const n = Number(wei) / 1e18;
  if (Number.isNaN(n)) return "0";
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

export function formatQuoteMinReceived(side: TradeSide, minOut: string, tokenSymbol: string) {
  return side === "mint"
    ? { amount: fmtTokenDisplay(minOut), symbol: tokenSymbol }
    : { amount: fmtOkbDisplay(minOut), symbol: "OKB" };
}

export function tradeInputAssetSymbol(side: TradeSide, tokenSymbol: string): string {
  return side === "mint" ? "OKB" : tokenSymbol;
}

export function formatWeiForInput(value: bigint, decimals = 18): string {
  const formatted = formatUnits(value, decimals);
  return formatted.includes(".")
    ? formatted.replace(/0+$/, "").replace(/\.$/, "")
    : formatted;
}

export function formatBalanceDisplay(value: bigint | undefined, decimals: number, symbol: string): string {
  if (value === undefined) return "--";
  const n = Number(formatUnits(value, decimals));
  if (!Number.isFinite(n)) return `-- ${symbol}`;
  if (n === 0) return `0 ${symbol}`;
  if (n < 0.0001) return `${n.toExponential(2)} ${symbol}`;
  return `${n.toFixed(4)} ${symbol}`;
}

export default {
  fmtOkb,
  fmtOkbDisplay,
  fmtTokenDisplay,
  formatBalanceDisplay,
  formatQuoteMinReceived,
  formatWeiForInput,
  tradeInputAssetSymbol,
};
