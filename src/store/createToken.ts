import { create } from "zustand";

export interface CreateTokenState {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  twitter: string;
  telegram: string;
  website: string;
  setField: (field: keyof CreateTokenState, value: string | null) => void;
  reset: () => void;
}

const initialState = {
  name: "",
  symbol: "",
  description: "",
  image: null as string | null,
  twitter: "",
  telegram: "",
  website: "",
};

export const useCreateTokenStore = create<CreateTokenState>((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  reset: () => set(initialState),
}));
