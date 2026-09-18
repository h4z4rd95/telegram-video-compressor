import { describe, expect, it } from "vitest";

import { isSubscriptionUsable } from "@/lib/quotas";

describe("subscription usability", () => {
  it("becomes unusable when any factor is exhausted", () => {
    expect(
      isSubscriptionUsable({
        storageRemainingMb: 100,
        videosRemaining: 0,
        endsAt: new Date(Date.now() + 86_400_000)
      })
    ).toBe(false);
  });

  it("stays usable only when storage, videos, and time remain", () => {
    expect(
      isSubscriptionUsable({
        storageRemainingMb: 250,
        videosRemaining: 3,
        endsAt: new Date(Date.now() + 86_400_000)
      })
    ).toBe(true);
  });
});
