import { describe, expect, it } from "vitest";

import { getDefaultFreePlan } from "@/lib/plans";

describe("free plan", () => {
  it("grants 500 MB storage", () => {
    expect(getDefaultFreePlan().storageMb).toBe(500);
  });
});
