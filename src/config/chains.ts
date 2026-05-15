import { defineChain } from "viem";

export const xLayer = defineChain({
  id: 196,
  name: "XLayer",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB",
  },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech"] },
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

export const hashKeyTestnet = defineChain({
  id: 133,
  name: "HashKey Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HSK",
    symbol: "HSK",
  },
  rpcUrls: {
    default: { http: ["https://hashkeychain-testnet.alt.technology"] },
  },
  blockExplorers: {
    default: {
      name: "HashKey Explorer",
      url: "https://hashkey-testnet-explorer.alt.technology",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
});
