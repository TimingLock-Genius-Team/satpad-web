import { create } from "zustand";

export interface CreateTokenState {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  imageIpfsUri: string | null;
  twitter: string;
  telegram: string;
  website: string;
  curveS: number;
  metadataURI: string | null;
  setField: (field: keyof CreateTokenState, value: string | number | null) => void;
  reset: () => void;
}

const initialState = {
  name: "",
  symbol: "",
  description: "",
  image: null as string | null,
  imageIpfsUri: null as string | null,
  twitter: "",
  telegram: "",
  website: "",
  curveS: 25,
  metadataURI: null as string | null,
};

export const useCreateTokenStore = create<CreateTokenState>((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  reset: () => set(initialState),
}));
