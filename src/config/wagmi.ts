import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia, xLayer, hashKeyTestnet } from "./chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = getDefaultConfig({
  appName: "Satpad",
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
  chains: [sepolia, xLayer, hashKeyTestnet],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [xLayer.id]: http(),
    [hashKeyTestnet.id]: http(),
  },
});
