import type { ApiTokenListItem } from "./api-types";
import type { Token } from "../types/token";

export function mapApiTokenToToken(item: ApiTokenListItem): Token {
  return {
    address: item.address,
    name: item.name,
    symbol: item.symbol,
    creator: item.creator,
    priceOkb: item.priceOkb,
    progress: item.progress,
    reserve: item.reserve,
    mintedAmount: item.mintedAmount ?? "--",
    totalAmount: item.totalAmount ?? "--",
    volume24hOkb: item.volume24hOkb,
    volume24h: item.volume24h,
    price: item.price,
    mcap: item.mcap ?? undefined,
    priceChange24h: item.priceChange24h ?? undefined,
    priceHistory: item.priceHistory,
    isGraduated: item.isGraduated,
    description: item.description,
    avatarUrl: item.avatarUrl ?? undefined,
    createdAt: item.createdAt,
    curve: item.curve,
  };
}

const tokenDisplay = {
  mapApiTokenToToken,
};

export default tokenDisplay;
