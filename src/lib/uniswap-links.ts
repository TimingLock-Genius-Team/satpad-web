import { getDefaultChain } from "@/config/chains";

const UNISWAP_BASE_URL = "https://app.uniswap.org";

const UNISWAP_SEPOLIA_CHAIN = "ethereum_sepolia";
const SUV4_SEPOLIA_POOL_ID =
  process.env.NEXT_PUBLIC_UNISWAP_SEPOLIA_POOL_ID ||
  "0x7c6b83740eb93c5a06a0e7058e344420e94e44c8477b09e0c4bc066f44fa1a6d";

const UNISWAP_XLAYER_CHAIN = "xlayer";
const SUV4_XLAYER_POOL_ID =
  process.env.NEXT_PUBLIC_UNISWAP_XLAYER_POOL_ID ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export interface UniswapLinks {
  defaultUrl: string;
  poolUrl: string;
  buyUrl: string;
  sellUrl: string;
}

export function buildUniswapLinks(tokenAddress: string): UniswapLinks {
  const chain = getDefaultChain();
  const isSepolia = chain.id === 11155111;

  const uniswapChain = isSepolia ? UNISWAP_SEPOLIA_CHAIN : UNISWAP_XLAYER_CHAIN;
  const poolId = isSepolia ? SUV4_SEPOLIA_POOL_ID : SUV4_XLAYER_POOL_ID;
  const nativeSymbol = chain.nativeCurrency.symbol;

  const encodedToken = encodeURIComponent(tokenAddress);
  const poolUrl = `${UNISWAP_BASE_URL}/explore/pools/${uniswapChain}/${poolId}`;

  return {
    defaultUrl: poolUrl,
    poolUrl,
    buyUrl: `${UNISWAP_BASE_URL}/swap?chain=${uniswapChain}&inputCurrency=${nativeSymbol}&outputCurrency=${encodedToken}`,
    sellUrl: `${UNISWAP_BASE_URL}/swap?chain=${uniswapChain}&inputCurrency=${encodedToken}&outputCurrency=${nativeSymbol}`,
  };
}
