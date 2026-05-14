export const MAX_BUY_OKB = 10;

export const POLLING_INTERVAL = {
  okbCum: 3_000,
  tokenList: 5_000,
  userHoldings: 10_000,
} as const;

export const DEBOUNCE_MS = 300;

export const PAGE_SIZE = 12;

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const IMAGE_DIMENSIONS = {
  width: 512,
  height: 512,
} as const;
