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
      burnTaxMinBps?: number;
      burnTaxMaxBps?: number;
      selfDeprecationBps: number;
      maxBuyOkb: string;
    };
  };
  abis: {
    factory: number;
    router: number;
    token: number;
    hook: number;
  };
}

export interface ApiStats {
  network: string;
  tokensLive: number;
  volume24hOkb: string;
  graduated: number;
  totalTrades: number;
}

export type ApiTokenTab = "trending" | "new" | "graduating" | "graduated" | "all";

export interface ApiTokenListItem {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  description?: string;
  avatarUrl?: string | null;
  price?: number;
  priceOkb: string;
  progress: number;
  reserve: string;
  isGraduated?: boolean;
  isMigrated?: boolean;
  createdAt?: number;
  mcap?: string | null;
  volume24h?: string;
  volume24hOkb: string;
  priceChange24h?: number | null;
  priceHistory?: number[];
  mintedAmount?: string;
  totalAmount?: string;
  curve?: {
    k?: string;
    s?: string;
    curveS: number;
    feeBps: number;
    burnTaxMinBps?: number;
    burnTaxMaxBps?: number;
    selfDeprecationBps?: number;
    maxBuyOkb: string;
  };
  taxBurnedTokens?: string;
}

export interface ApiTokenDetail {
  token: ApiTokenListItem & {
    priceHistory: number[];
    mintedAmount: string;
    totalAmount: string;
  };
  hook: string;
  router: string;
  metadataURI: string;
  socialURI: string;
  socials?: {
    website: string | null;
    twitter: string | null;
    telegram: string | null;
  };
  migration: {
    isMigrated: boolean;
    target: string | null;
    pool: string | null;
    liquidity: string | null;
    okbAmount: string | null;
    tokenAmount: string | null;
    blockNumber: string | null;
    txHash: string | null;
    logIndex: number | null;
  };
  satoData: {
    holders: number;
    maxSupply?: string;
    circulatingSupply?: string;
    marketPriceOkb: string;
    burnPriceOkb?: string | null;
    mintPriceOkb?: string | null;
    marketCapOkb?: string | null;
    reserveOkb: string;
    taxBurnedTokens?: string;
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
  token: string;
  user: string;
  recipient: string;
  side: "buy" | "sell";
  grossOkb: string;
  netOkb: string;
  feeOkb: string;
  tokens: string;
  burnTaxBps?: number;
  burnTaxTokens?: string;
  grossTokens?: string;
  effectiveTokens?: string;
  newOkbCum: string;
  blockNumber: string;
  ts: number;
}

export interface ApiHolder {
  holder: string;
  balance: string;
  lastBlock: string;
}

export interface ApiQuoteTx {
  kind: "buy" | "sell" | "approve" | "createToken" | "createTokenAndBuy";
  to: string;
  value: string;
  data: string;
}

export interface ApiQuoteResponse {
  network: string;
  chainId: number;
  token: string;
  side: "mint" | "burn";
  amountIn: string;
  amountOut: string;
  fee: string;
  burnTaxSupported?: boolean;
  burnTaxBps?: number;
  burnTaxTokens?: string;
  grossTokenAmount?: string;
  effectiveTokensIn?: string | null;
  taxBurnedTokens?: string;
  minOut: string;
  priceImpactBps: number;
  maxBuyOkb?: string;
  mintPriceOkb?: string | null;
  burnPriceOkb?: string | null;
  hook: string;
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
  avatarUrl?: string | null;
  currentPriceOkb: string;
  currentValueOkb: string;
  unrealizedPnlOkb: string;
  pnlPercent: string;
  taxMethod?: string;
  knownCostBasisOkb?: string;
  unknownBasisTokens?: string;
  lotCount?: number;
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
  type: "BUY" | "SELL" | "TRANSFER_IN" | "TRANSFER_OUT";
  okb: string;
  okbAmount: string;
  tokenAmount: string;
  explorerUrl: string;
}

export interface ApiPortfolioTaxLot {
  id: string;
  token: string;
  acquiredAt: number;
  acquiredBlock: string;
  sourceType: "buy" | "sell" | string;
  sourceTxHash: string;
  sourceLogIndex: number;
  originalQuantity: string;
  remainingQuantity: string;
  originalCostBasisOkb: string;
  remainingCostBasisOkb: string;
  basisStatus: "known" | "unknown" | string;
}

export interface ApiPortfolioTaxEvent {
  type: "DISPOSAL" | "TRANSFER";
  txHash: string;
  logIndex: number;
  ts: number;
  token: string;
  quantity: string;
  costBasisOkb: string;
  realizedPnlOkb: string | null;
  from: string | null;
  to: string | null;
  taxable: boolean;
}

export interface ApiPortfolioTaxSummary {
  wallet: string;
  network: string;
  method: string;
  realizedPnlOkb: string;
  knownProceedsOkb: string;
  costBasisDisposedOkb: string;
  feesOkb: string;
  disposals: number;
  unknownBasisTokens: string;
  openLots: number;
  openKnownCostBasisOkb: string;
  openUnknownBasisTokens: string;
}

export interface ApiCreateValidateRequest {
  network: string;
  name: string;
  symbol: string;
  description?: string;
  metadataURI: string;
  socialURI: string;
  curveS: number;
  feeBps?: number | null;
  burnTaxMinBps?: number | null;
  burnTaxMaxBps?: number | null;
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
  feeBps?: number | null;
  burnTaxMinBps?: number | null;
  burnTaxMaxBps?: number | null;
  /** Wei string; when set with recipient, backend builds atomic createTokenAndBuy */
  initialBuyWei?: string;
  recipient?: string;
  slippageBps?: number;
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
