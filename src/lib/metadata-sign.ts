import { getAddress } from "viem";

export type MetadataSignInput = {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  wallet: `0x${string}`;
  nonce: string;
  expiresAt: number;
};

/** Must stay in sync with `metadataSigningMessage` in backend/src/api/validation.ts */
export function buildMetadataSigningMessage(input: MetadataSignInput): string {
  const canonical = {
    name: input.name.trim(),
    symbol: input.symbol.trim(),
    description: input.description ?? "",
    image: input.image ?? null,
    website: input.website ?? null,
    twitter: input.twitter ?? null,
    telegram: input.telegram ?? null,
    wallet: getAddress(input.wallet),
    nonce: input.nonce.trim(),
    expiresAt: input.expiresAt,
  };
  return `Eulr metadata create\n${JSON.stringify(canonical)}`;
}

export function randomMetadataNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
