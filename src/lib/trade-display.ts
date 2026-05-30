import { formatUnits } from "viem";

export type TradeSide = "mint" | "burn";

const API_SIDE_MAP: Record<string, TradeSide> = {
  buy: "mint",
  sell: "burn",
  BUY: "mint",
  SELL: "burn",
};

export function toTradeSide(apiSide: string): TradeSide {
  return API_SIDE_MAP[apiSide] ?? (apiSide as TradeSide);
}

export function fmtOkb(wei: string): number {
  const n = Number(wei) / 1e18;
  return Number.isNaN(n) ? 0 : n;
}

export function formatSmallNumber(n: number): string {
  if (n === 0) return "0";
  if (n >= 0.01) return n.toString();
  
  // Convert to fixed string to avoid e-notation, max 20 decimals
  const str = n.toFixed(20).replace(/0+$/, '');
  const match = str.match(/^0\.0(0+)(\d+)$/);
  
  if (match) {
    const zerosCount = match[1].length; // number of zeros between '0.0' and the significant digits
    const sigDigits = match[2].slice(0, 4); // keep up to 4 significant digits
    return `0.0{${zerosCount}}${sigDigits}`;
  }
  
  return n.toExponential(2);
}

export function fmtOkbDisplay(wei: string): string {
  const okb = fmtOkb(wei);
  if (okb < 0.0001) return formatSmallNumber(okb);
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
  if (n < 0.0001) return `${formatSmallNumber(n)} ${symbol}`;
  return `${n.toFixed(4)} ${symbol}`;
}

const tradeDisplay = {
  fmtOkb,
  fmtOkbDisplay,
  fmtTokenDisplay,
  formatBalanceDisplay,
  formatQuoteMinReceived,
  formatWeiForInput,
  tradeInputAssetSymbol,
};

export default tradeDisplay;
