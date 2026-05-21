import { defineChain } from "viem";

const sepoliaDefaultRpc =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const xLayerDefaultRpc = process.env.NEXT_PUBLIC_XLAYER_RPC_URL || "https://rpc.xlayer.tech";

export const sepolia = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: [sepoliaDefaultRpc] },
  },
  blockExplorers: {
    default: {
      name: "Sepolia Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 751532,
    },
  },
});

export const xLayer = defineChain({
  id: 196,
  name: "XLayer",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB",
  },
  rpcUrls: {
    default: { http: [xLayerDefaultRpc] },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: "https://www.okx.com/explorer/xlayer",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 47416,
    },
  },
});

const NETWORK_CHAINS: Record<string, ReturnType<typeof defineChain>> = {
  sepolia,
  xlayer: xLayer,
};

export function getDefaultChain() {
  return NETWORK_CHAINS[process.env.NEXT_PUBLIC_DEFAULT_NETWORK || ""] ?? xLayer;
}

export function chainForSatpadNetwork(network: string) {
  return NETWORK_CHAINS[network] ?? xLayer;
}
