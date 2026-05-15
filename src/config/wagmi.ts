import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { xLayer, hashKeyTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [xLayer, hashKeyTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [xLayer.id]: http(),
    [hashKeyTestnet.id]: http(),
  },
});
