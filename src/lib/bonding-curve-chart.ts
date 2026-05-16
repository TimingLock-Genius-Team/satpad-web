export type BondingCurveInput = {
  k?: string;
  s?: string;
  maxBuyOkb?: string;
};

export type BondingCurvePoint = {
  reserveOkb: number;
  supplyTokens: number;
  priceOkb: number;
};

export type BondingCurveChartModel = {
  points: BondingCurvePoint[];
  current: BondingCurvePoint;
  maxSupplyTokens: number;
  maxReserveOkb: number;
  maxPriceOkb: number;
};

const WAD = 1e18;
const DEFAULT_MAX_SUPPLY = 21_000_000;
const DEFAULT_CURVE_S = 100;

export function weiToUnits(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value) / WAD;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCompactTokenAmount(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const match = value.trim().replace(/,/g, "").match(/^(\d*\.?\d+)\s*([kmb])?$/i);
  if (!match) return fallback;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return fallback;
  const suffix = match[2]?.toLowerCase();
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
  return amount * multiplier;
}

function derivePoint(reserveOkb: number, maxSupplyTokens: number, curveSOkb: number): BondingCurvePoint {
  const safeS = curveSOkb > 0 ? curveSOkb : DEFAULT_CURVE_S;
  const exponentInput = reserveOkb / safeS;
  const clampedExponentInput = Math.min(exponentInput, 40);
  const exp = Math.exp(clampedExponentInput);
  return {
    reserveOkb,
    supplyTokens: maxSupplyTokens * (1 - Math.exp(-clampedExponentInput)),
    priceOkb: (safeS / maxSupplyTokens) * exp,
  };
}

export function buildBondingCurveChartModel(input: {
  curve?: BondingCurveInput;
  reserveOkbWei?: string | null;
  marketPriceOkbWei?: string | null;
  mintedAmount?: string;
  totalAmount?: string;
  pointCount?: number;
}): BondingCurveChartModel {
  const maxSupplyTokens = weiToUnits(input.curve?.k, parseCompactTokenAmount(input.totalAmount, DEFAULT_MAX_SUPPLY));
  const curveSOkb = weiToUnits(input.curve?.s, DEFAULT_CURVE_S);
  const reserveOkb = weiToUnits(input.reserveOkbWei);
  const maxBuyOkb = weiToUnits(input.curve?.maxBuyOkb);
  const pointCount = Math.max(16, input.pointCount ?? 96);
  const maxReserveOkb = Math.max(maxBuyOkb, reserveOkb * 1.35, curveSOkb * 6, 1);

  const points = Array.from({ length: pointCount }, (_, index) => {
    const t = index / (pointCount - 1);
    return derivePoint(maxReserveOkb * t, maxSupplyTokens, curveSOkb);
  });

  const current = derivePoint(reserveOkb, maxSupplyTokens, curveSOkb);
  const explicitSupply = parseCompactTokenAmount(input.mintedAmount, current.supplyTokens);
  const explicitPrice = weiToUnits(input.marketPriceOkbWei, current.priceOkb);
  const normalizedCurrent = {
    ...current,
    supplyTokens: explicitSupply,
    priceOkb: explicitPrice,
  };

  return {
    points,
    current: normalizedCurrent,
    maxSupplyTokens,
    maxReserveOkb,
    maxPriceOkb: Math.max(...points.map((point) => point.priceOkb), normalizedCurrent.priceOkb),
  };
}

export function formatCompactTokenAmount(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const amount = value / 1_000_000;
    return `${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(1)}m`;
  }
  if (abs >= 1_000) {
    const amount = value / 1_000;
    return `${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(1)}k`;
  }
  return value.toFixed(0);
}

export function formatOkbAmount(value: number): string {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  if (Math.abs(value) >= 1) return value.toFixed(3);
  return value.toPrecision(3);
}

export function formatOkbPrice(value: number): string {
  if (!Number.isFinite(value)) return "--";
  if (value === 0) return "0";
  if (Math.abs(value) < 0.0001) return value.toPrecision(3);
  if (Math.abs(value) < 1) return value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}
