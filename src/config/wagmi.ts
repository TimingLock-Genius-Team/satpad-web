import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, xLayer, hashKeyTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Satpad",
  projectId: "4b4f535d8832a8ba77a8df254ba2ba61", // public project ID
  chains: [sepolia, xLayer, hashKeyTestnet],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [xLayer.id]: http(),
    [hashKeyTestnet.id]: http(),
  },
});
