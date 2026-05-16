export interface Token {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  priceOkb: string;
  progress: number;
  reserve: string;
  mintedAmount: string;
  totalAmount: string;
  volume24hOkb?: string;
  volume24h?: string;
  price?: number;
  mcap?: string;
  priceChange24h?: number;
  priceHistory?: number[];
  isGraduated?: boolean;
  description?: string;
  avatarUrl?: string;
  createdAt?: number;
  curve?: {
    curveS: number;
    feeBps: number;
    maxBuyOkb: string;
  };
}

export const generatePriceHistory = (currentPrice: number, priceChange24h: number, points = 24): number[] => {
  const history: number[] = [];
  const startPrice = currentPrice / (1 + priceChange24h / 100);

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const basePrice = startPrice + (currentPrice - startPrice) * Math.pow(t, 1.2);
    const noise = (Math.random() - 0.5) * currentPrice * 0.08 * Math.sin(t * Math.PI);
    history.push(Math.max(0, basePrice + noise));
  }

  return history;
};
