import { create } from "zustand";

interface WalletState {
  balance: string;
  setBalance: (balance: string) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: "0",
  setBalance: (balance: string) => set({ balance }),
  reset: () => set({ balance: "0" }),
}));
