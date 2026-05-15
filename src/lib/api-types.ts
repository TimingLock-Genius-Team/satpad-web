export interface ApiPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ApiNetwork {
  network: string;
  chainId: number;
  name: string;
  explorerUrl: string;
  factory: string | null;
  router: string | null;
  migrationTarget: string | null;
  hasDeployment: boolean;
  hasRpc: boolean;
  hasStartBlock: boolean;
  readyForIndexing: boolean;
  readiness: string[];
}

export interface ApiConfig {
  network: string;
  chainId: number;
  explorerUrl: string;
  deployment: {
    factory: string;
    router: string | null;
    migrationTarget: string;
    curve: {
      k: string;
      s: string;
      feeBps: number;
      selfDeprecationBps: number;
      maxBuyOkb: string;
    };
  };
  abis: {
    factory: { entries: number };
    router: { entries: number };
    token: { entries: number };
    hook: { entries: number };
  };
}

export interface ApiStats {
  network: string;
  tokensLive: number;
  volume24hOkb: string;
  graduated: number;
  totalTrades: number;
}

export interface ApiTokenListItem {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  price?: number;
  priceOkb: string;
  progress: number;
  reserve: string;
  volume24h?: string;
  volume24hOkb: string;
  mintedAmount?: string;
  totalAmount?: string;
  curve?: {
    curveS: number;
    feeBps: number;
    maxBuyOkb: string;
  };
}

export interface ApiTokenDetail {
  token: {
    address: string;
    name: string;
    symbol: string;
    priceOkb: string;
    priceHistory: number[];
    mintedAmount: string;
    totalAmount: string;
  };
  hook: string;
  router: string;
  metadataURI: string;
  socialURI: string;
  satoData: {
    holders: number;
    marketPriceOkb: string;
    reserveOkb: string;
    volume24hOkb: string;
    txns24h: number;
  };
}

export interface ApiTokenSummary {
  token: string;
  holders: number;
  volume24hOkb: string;
  volume24hUsd: string;
  priceChange24hPct: number | null;
  sparkline: Array<{
    ts: number;
    priceOkb: string;
  }>;
}

export interface ApiChartPoint {
  range: string;
  interval: string;
  points: Array<{
    ts: number;
    okbCum: string;
    priceOkb: string;
    totalMinted: string;
    volumeOkb: string;
  }>;
}

export interface ApiTrade {
  txHash: string;
  logIndex: number;
  user: string;
  side: "buy" | "sell";
  grossOkb: string;
  netOkb: string;
  feeOkb: string;
  tokens: string;
  blockNumber: string;
  ts: number;
}

export interface ApiHolder {
  holder: string;
  balance: string;
  lastBlock: string;
}

export interface ApiQuoteTx {
  kind: "buy" | "sell" | "approve" | "createToken";
  to: string;
  value: string;
  data?: string;
}

export interface ApiQuoteResponse {
  network: string;
  chainId: number;
  side: "mint" | "burn";
  amountIn: string;
  amountOut: string;
  fee: string;
  minOut: string;
  priceImpactBps: number;
  maxBuyOkb?: string;
  mintPriceOkb?: string;
  burnPriceOkb?: string;
  router: string;
  blockNumber: string;
  txs: ApiQuoteTx[];
}

export interface ApiHolding {
  token: string;
  balance: string;
  avgCostOkb: string;
  costBasisOkb: string;
  realizedPnlOkb: string;
  name: string;
  symbol: string;
  currentPriceOkb: string;
  currentValueOkb: string;
  unrealizedPnlOkb: string;
  pnlPercent: string;
  explorerUrl: string;
  tradeUrl: string;
}

export interface ApiPortfolioResponse {
  wallet: string;
  holdings: ApiHolding[];
}

export interface ApiPortfolioHistoryItem {
  txHash: string;
  logIndex: number;
  ts: number;
  token: {
    address: string;
    name: string;
    symbol: string;
    avatarUrl: string | null;
  };
  type: "BUY" | "SELL";
  okb: string;
  okbAmount: string;
  tokenAmount: string;
  explorerUrl: string;
}

export interface ApiCreateValidateRequest {
  network: string;
  name: string;
  symbol: string;
  description?: string;
  metadataURI: string;
  socialURI: string;
  curveS: number;
}

export interface ApiCreateValidateResponse {
  valid: boolean;
  errors: Record<string, string>;
  normalized: {
    network: string;
    name: string;
    symbol: string;
    metadataURI: string;
    socialURI: string;
    curveS: number;
  };
}

export interface ApiCreateBuildRequest {
  network: string;
  name: string;
  symbol: string;
  description?: string;
  metadataURI: string;
  socialURI: string;
  curveS: number;
}

export interface ApiCreateBuildResponse {
  network: string;
  chainId: number;
  factory: string;
  tx: ApiQuoteTx;
}

export interface ApiMetadataUploadRequest {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
}

/** POST /api/metadata (backend requires EIP-191 signature over canonical payload). */
export type ApiMetadataUploadBody = ApiMetadataUploadRequest & {
  wallet: string;
  signature: string;
  message: string;
  nonce: string;
  expiresAt: number;
};

export interface ApiMetadataUploadResponse {
  id: string;
  metadataURI: string;
  url: string;
}

export interface ApiMetadataResponse {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  twitter: string;
  telegram: string;
  createdAt: number;
}

export interface ApiHealthResponse {
  ok: boolean;
  network: string;
  chainId: number;
  latestIndexedBlock: string;
  lagBlocks: string;
}
