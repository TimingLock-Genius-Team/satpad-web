import type { ApiQuoteResponse } from "./api-types";

export type QuoteBreakdownSide = "mint" | "burn";

export interface QuoteBreakdownRow {
  label: string;
  valueWei: string;
  symbol: string;
  detail?: string;
}

function hasBurnTax(quote: ApiQuoteResponse): boolean {
  return Boolean(quote.burnTaxSupported) || BigInt(quote.burnTaxTokens ?? "0") > BigInt(0);
}

export function formatBpsPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function buildQuoteBreakdownRows({
  side,
  tokenSymbol,
  quote,
}: {
  side: QuoteBreakdownSide;
  tokenSymbol: string;
  quote: ApiQuoteResponse;
}): QuoteBreakdownRow[] {
  const burnTaxDetail = quote.burnTaxBps === undefined ? undefined : formatBpsPercent(quote.burnTaxBps);

  if (side === "mint") {
    if (!hasBurnTax(quote)) {
      return [{ label: "you receive", valueWei: quote.amountOut, symbol: tokenSymbol }];
    }

    return [
      { label: "gross tokens", valueWei: quote.grossTokenAmount ?? quote.amountOut, symbol: tokenSymbol },
      { label: "burn tax", valueWei: quote.burnTaxTokens ?? "0", symbol: tokenSymbol, detail: burnTaxDetail },
      { label: "you receive", valueWei: quote.amountOut, symbol: tokenSymbol },
    ];
  }

  if (!hasBurnTax(quote)) {
    return [
      { label: "tokens in", valueWei: quote.amountIn, symbol: tokenSymbol },
      { label: "you receive", valueWei: quote.amountOut, symbol: "OKB" },
    ];
  }

  return [
    { label: "tokens in", valueWei: quote.amountIn, symbol: tokenSymbol },
    { label: "burn tax", valueWei: quote.burnTaxTokens ?? "0", symbol: tokenSymbol, detail: burnTaxDetail },
    { label: "effective sold", valueWei: quote.effectiveTokensIn ?? quote.amountIn, symbol: tokenSymbol },
    { label: "you receive", valueWei: quote.amountOut, symbol: "OKB" },
  ];
}
