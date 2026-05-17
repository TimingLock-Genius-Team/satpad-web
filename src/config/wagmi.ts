import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { getDefaultChain } from "./chains";

const defaultChain = getDefaultChain();

export const wagmiConfig = getDefaultConfig({
  appName: "Satpad",
  projectId: "4b4f535d8832a8ba77a8df254ba2ba61", // public project ID
  chains: [defaultChain],
  ssr: true,
  transports: {
    [defaultChain.id]: http()
  },
});
