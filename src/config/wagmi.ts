import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { xLayer } from "@/config/chain";

export const wagmiConfig = getDefaultConfig({
  appName: "SATPAD",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [xLayer],
  transports: {
    [xLayer.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
