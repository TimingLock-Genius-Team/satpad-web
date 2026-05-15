import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { sepolia, xLayer, hashKeyTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [sepolia, xLayer, hashKeyTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(),
    [xLayer.id]: http(),
    [hashKeyTestnet.id]: http(),
  },
});
