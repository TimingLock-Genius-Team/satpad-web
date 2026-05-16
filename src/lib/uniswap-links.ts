const UNISWAP_BASE_URL = "https://app.uniswap.org";
const UNISWAP_SEPOLIA_CHAIN = "ethereum_sepolia";
const SUV4_SEPOLIA_POOL_ID =
  "0x7c6b83740eb93c5a06a0e7058e344420e94e44c8477b09e0c4bc066f44fa1a6d";

export interface UniswapLinks {
  defaultUrl: string;
  poolUrl: string;
  buyUrl: string;
  sellUrl: string;
}

export function buildUniswapLinks(tokenAddress: string): UniswapLinks {
  const encodedToken = encodeURIComponent(tokenAddress);
  const poolUrl = `${UNISWAP_BASE_URL}/explore/pools/${UNISWAP_SEPOLIA_CHAIN}/${SUV4_SEPOLIA_POOL_ID}`;

  return {
    defaultUrl: poolUrl,
    poolUrl,
    buyUrl: `${UNISWAP_BASE_URL}/swap?chain=${UNISWAP_SEPOLIA_CHAIN}&inputCurrency=ETH&outputCurrency=${encodedToken}`,
    sellUrl: `${UNISWAP_BASE_URL}/swap?chain=${UNISWAP_SEPOLIA_CHAIN}&inputCurrency=${encodedToken}&outputCurrency=ETH`,
  };
}
