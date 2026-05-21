import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia, xLayer } from "./chains";


const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = getDefaultConfig({
  appName: "Eulr",
  projectId: walletConnectProjectId ?? "local-only",
  ...(walletConnectProjectId
    ? {}
    : {
        wallets: [
          {
            groupName: "Available",
            wallets: [injectedWallet],
          },
        ],
      }),
  chains: [xLayer, sepolia],
  ssr: true,
  transports: {
    [xLayer.id]: http(),
    [sepolia.id]: http(),
  },
});
