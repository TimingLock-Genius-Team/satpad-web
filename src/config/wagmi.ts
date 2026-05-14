import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { xLayer } from "./chains";

export const wagmiConfig = createConfig({
  chains: [xLayer],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [xLayer.id]: http(),
  },
});
