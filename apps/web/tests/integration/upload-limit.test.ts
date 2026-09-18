import { describe, expect, it } from "vitest";

import { assertUploadAllowed } from "@/lib/quotas";

describe("guest upload policy", () => {
  it("rejects guest uploads above 100 MB", () => {
    expect(() => assertUploadAllowed({ isGuest: true, sizeMb: 101 })).toThrow(/100 MB/);
  });
});
