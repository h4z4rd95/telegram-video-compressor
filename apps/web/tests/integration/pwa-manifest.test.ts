import { describe, expect, it } from "vitest";
import manifestRaw from "../../public/manifest.webmanifest?raw";

const manifest = JSON.parse(manifestRaw) as { display?: string };

describe("pwa manifest", () => {
  it("is installable", () => {
    expect(manifest.display).toBe("standalone");
  });
});
