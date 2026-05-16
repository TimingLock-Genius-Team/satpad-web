import assert from "node:assert/strict";
import test from "node:test";
import {
  CREATE_FLOW_CURVE_S_MAX,
  clampCurveSForCreateFlow,
  LAUNCH_BUY_MAX_MINT_BPS,
  maxLaunchBuyGrossWei,
  validateLaunchBuyWei,
  validateOptionalInitialBuyNativeInput,
} from "./launch-buy-limits.js";

test("launch buy limit is capped at 50% of supply", () => {
  assert.equal(LAUNCH_BUY_MAX_MINT_BPS, 5000);
});

test("validateLaunchBuyWei rejects a create-time buy that would mint more than 50%", () => {
  assert.match(validateLaunchBuyWei(BigInt("1000000000000000000"), 1) ?? "", /50%/);
});

test("validateLaunchBuyWei allows the largest gross amount that remains within 50%", () => {
  const maxGross = maxLaunchBuyGrossWei(1);

  assert.equal(validateLaunchBuyWei(maxGross, 1), null);
  assert.match(validateLaunchBuyWei(maxGross + BigInt(1), 1) ?? "", /50%/);
});

test("clampCurveSForCreateFlow keeps S in frontend range", () => {
  assert.equal(clampCurveSForCreateFlow(0), 1);
  assert.equal(clampCurveSForCreateFlow(99999), CREATE_FLOW_CURVE_S_MAX);
});

test("validateOptionalInitialBuyNativeInput surfaces parse failures", () => {
  assert.match(validateOptionalInitialBuyNativeInput("xyz", 25, 30) ?? "", /Invalid amount/);
});
