import { parseEther } from "viem";

const WAD = BigInt("1000000000000000000");
const BPS_DENOMINATOR = BigInt(10_000);
/** ln(2) scaled by 10^18; matches on-chain sizing for mint ≤ 50% at reserve = S·ln 2 OKB wei. */
const LN_2_WAD = BigInt("693147180559945309");

export const LAUNCH_BUY_MAX_MINT_BPS = 5000;

export const CREATE_FLOW_CURVE_S_MIN = 1;
/** Frontend create flow clamps S to match the Curve step input (contracts allow up to 1000). */
export const CREATE_FLOW_CURVE_S_MAX = 100;

export function clampCurveSForCreateFlow(curveS: unknown): number {
  const raw = typeof curveS === "number" || typeof curveS === "string" ? Number(curveS) : NaN;
  let v = Number.isFinite(raw) ? Math.trunc(raw) : 25;
  if (v < CREATE_FLOW_CURVE_S_MIN) v = CREATE_FLOW_CURVE_S_MIN;
  if (v > CREATE_FLOW_CURVE_S_MAX) v = CREATE_FLOW_CURVE_S_MAX;
  return v;
}
export function grossWeiToReserveWei(grossWei: bigint, feeBps: number): bigint {
  return grossWei - (grossWei * BigInt(feeBps)) / BPS_DENOMINATOR;
}

/** Smallest gross such that deposited reserve wei is ≥ target (fee taken from gross). */
export function minGrossWeiForReserveWei(targetReserveWei: bigint, feeBps: number): bigint {
  const den = BPS_DENOMINATOR - BigInt(feeBps);
  if (den <= BigInt(0)) return targetReserveWei;
  return (targetReserveWei * BPS_DENOMINATOR + den - BigInt(1)) / den;
}

/** Max bonding-curve cumulative reserve wei from zero that still mints at most half of fixed supply (∝ S). */
export function maxLaunchReserveWei(curveS: number): bigint {
  return BigInt(curveS) * LN_2_WAD;
}

export function maxLaunchBuyGrossWei(curveS: number, feeBps = 30): bigint {
  if (!Number.isInteger(curveS) || curveS < 1) {
    throw new Error(`Invalid curveS: ${curveS}`);
  }
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps >= Number(BPS_DENOMINATOR)) {
    throw new Error(`Invalid feeBps: ${feeBps}`);
  }

  const maxNetWei = maxLaunchReserveWei(curveS);
  let lo = BigInt(0);
  let hi = (maxNetWei * BPS_DENOMINATOR) / (BPS_DENOMINATOR - BigInt(feeBps)) + WAD;

  while (lo < hi) {
    const mid = (lo + hi + BigInt(1)) / BigInt(2);
    if (grossWeiToReserveWei(mid, feeBps) <= maxNetWei) {
      lo = mid;
    } else {
      hi = mid - BigInt(1);
    }
  }

  return lo;
}

export function validateLaunchBuyWei(buyWei: bigint, curveS: number, feeBps = 30): string | null {
  if (buyWei <= BigInt(0)) return null;

  const maxGrossWei = maxLaunchBuyGrossWei(curveS, feeBps);
  if (buyWei <= maxGrossWei) return null;

  return `Initial purchase can mint at most ${LAUNCH_BUY_MAX_MINT_BPS / 100}% of supply.`;
}

/**
 * Validates optional create-step "native" gross amount: parse OK, strictly positive if set, mint ≤50% vs S.
 */
export function validateOptionalInitialBuyNativeInput(
  amountTrimmed: string,
  curveSRaw: unknown,
  feeBps: number
): string | null {
  if (amountTrimmed.length === 0) return null;
  let wei: bigint;
  try {
    wei = parseEther(amountTrimmed as `${bigint}`);
  } catch {
    return "Invalid amount — use a decimal number only (e.g. 0.01).";
  }
  if (wei <= BigInt(0)) {
    return "Initial purchase must be greater than zero.";
  }
  const s = clampCurveSForCreateFlow(curveSRaw);
  try {
    return validateLaunchBuyWei(wei, s, feeBps);
  } catch {
    return "Curve parameters are invalid; refresh and try again.";
  }
}
