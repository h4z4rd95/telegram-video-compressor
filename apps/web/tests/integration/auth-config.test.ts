import { describe, expect, it } from "vitest";
import { authConfig } from "@/lib/auth";

describe("auth config", () => {
  it("enables google, email, and telegram providers", () => {
    expect(authConfig.providers).toHaveLength(3);
    expect(authConfig.providers.map((provider) => provider.id)).toEqual([
      "google",
      "email",
      "telegram"
    ]);
  });
});
