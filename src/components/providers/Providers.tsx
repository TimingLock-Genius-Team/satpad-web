"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/config/wagmi";
import { useWalletStore } from "@/stores/useWalletStore";
import { useAccount } from "wagmi";
import { useEffect, type ReactNode } from "react";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function WalletStateSync({ children }: { children: ReactNode }) {
  const { address, chainId, isConnected } = useAccount();
  const setAccount = useWalletStore((s) => s.setAccount);

  useEffect(() => {
    setAccount(address, chainId, isConnected);
  }, [address, chainId, isConnected, setAccount]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00FF66",
            accentColorForeground: "#000000",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <WalletStateSync>{children}</WalletStateSync>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
