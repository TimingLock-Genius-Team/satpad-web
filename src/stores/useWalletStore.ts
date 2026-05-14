import { create } from "zustand";

interface WalletState {
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  setAccount: (address: `0x${string}` | undefined, chainId: number | undefined, isConnected: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: undefined,
  chainId: undefined,
  isConnected: false,
  setAccount: (address, chainId, isConnected) => set({ address, chainId, isConnected }),
}));
