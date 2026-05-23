import assert from "node:assert/strict";
import test from "node:test";
import { buildQuoteBreakdownRows, formatBpsPercent } from "./quote-breakdown.js";
import type { ApiQuoteResponse } from "./api-types.js";

const WAD = "1000000000000000000";

function quote(overrides: Partial<ApiQuoteResponse>): ApiQuoteResponse {
  return {
    network: "anvil",
    chainId: 31337,
    token: "0x0000000000000000000000000000000000000001",
    side: "mint",
    amountIn: WAD,
    amountOut: WAD,
    fee: "3000000000000000",
    minOut: "990000000000000000",
    priceImpactBps: 100,
    hook: "0x0000000000000000000000000000000000000002",
    router: "0x0000000000000000000000000000000000000003",
    blockNumber: "1",
    txs: [],
    ...overrides,
  };
}

test("formatBpsPercent formats burn tax bps as percent", () => {
  assert.equal(formatBpsPercent(1000), "10.00%");
  assert.equal(formatBpsPercent(125), "1.25%");
});

test("buildQuoteBreakdownRows exposes mint gross, burn tax, and net token output", () => {
  const rows = buildQuoteBreakdownRows({
    side: "mint",
    tokenSymbol: "DUAL",
    quote: quote({
      side: "mint",
      grossTokenAmount: "2000000000000000000",
      amountOut: "1800000000000000000",
      burnTaxSupported: true,
      burnTaxBps: 1000,
      burnTaxTokens: "200000000000000000",
    }),
  });

  assert.deepEqual(rows.map((row) => row.label), [
    "gross tokens",
    "burn tax",
    "you receive",
  ]);
  assert.equal(rows[1].detail, "10.00%");
  assert.equal(rows[2].symbol, "DUAL");
});

test("buildQuoteBreakdownRows hides mint burn-tax rows when tax amount is zero", () => {
  const rows = buildQuoteBreakdownRows({
    side: "mint",
    tokenSymbol: "DUAL",
    quote: quote({
      side: "mint",
      grossTokenAmount: "2000000000000000000",
      amountOut: "2000000000000000000",
      burnTaxSupported: true,
      burnTaxBps: 0,
      burnTaxTokens: "0",
    }),
  });

  assert.deepEqual(rows.map((row) => row.label), ["you receive"]);
});

test("buildQuoteBreakdownRows exposes burn gross input, tax, effective sold, and net OKB", () => {
  const rows = buildQuoteBreakdownRows({
    side: "burn",
    tokenSymbol: "DUAL",
    quote: quote({
      side: "burn",
      amountIn: "2000000000000000000",
      effectiveTokensIn: "1800000000000000000",
      amountOut: "900000000000000000",
      burnTaxSupported: true,
      burnTaxBps: 1000,
      burnTaxTokens: "200000000000000000",
    }),
  });

  assert.deepEqual(rows.map((row) => row.label), [
    "tokens in",
    "burn tax",
    "effective sold",
    "you receive",
  ]);
  assert.equal(rows[3].symbol, "OKB");
});

test("buildQuoteBreakdownRows hides burn burn-tax rows when tax amount is zero", () => {
  const rows = buildQuoteBreakdownRows({
    side: "burn",
    tokenSymbol: "DUAL",
    quote: quote({
      side: "burn",
      amountIn: "2000000000000000000",
      effectiveTokensIn: "2000000000000000000",
      amountOut: "900000000000000000",
      burnTaxSupported: true,
      burnTaxBps: 0,
      burnTaxTokens: "0",
    }),
  });

  assert.deepEqual(rows.map((row) => row.label), ["tokens in", "you receive"]);
});
