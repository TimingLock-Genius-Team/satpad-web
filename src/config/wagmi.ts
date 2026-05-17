import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, xLayer } from "./chains";


export const wagmiConfig = getDefaultConfig({
  appName: "Eulr",
  projectId: "4b4f535d8832a8ba77a8df254ba2ba61", // public project ID
  chains: [xLayer, sepolia],
  ssr: true,
  transports: {
    [xLayer.id]: http(),
    [sepolia.id]: http(),
  },
});
