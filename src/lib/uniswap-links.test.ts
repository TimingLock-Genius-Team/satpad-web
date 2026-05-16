import assert from "node:assert/strict";
import test from "node:test";

import { buildUniswapLinks } from "./uniswap-links";

test("buildUniswapLinks keeps pool, buy, and sell links with pool as default", () => {
  const links = buildUniswapLinks("0x7926876d0D28aC4d49F8c1129BEd261Fa3b4830C");

  assert.equal(
    links.defaultUrl,
    "https://app.uniswap.org/explore/pools/ethereum_sepolia/0x7c6b83740eb93c5a06a0e7058e344420e94e44c8477b09e0c4bc066f44fa1a6d",
  );
  assert.equal(links.defaultUrl, links.poolUrl);
  assert.equal(
    links.buyUrl,
    "https://app.uniswap.org/swap?chain=ethereum_sepolia&inputCurrency=ETH&outputCurrency=0x7926876d0D28aC4d49F8c1129BEd261Fa3b4830C",
  );
  assert.equal(
    links.sellUrl,
    "https://app.uniswap.org/swap?chain=ethereum_sepolia&inputCurrency=0x7926876d0D28aC4d49F8c1129BEd261Fa3b4830C&outputCurrency=ETH",
  );
});
