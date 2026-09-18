import { describe, expect, it } from "vitest";

import { buildCompressCommand } from "@/lib/video/compress";

describe("compress command", () => {
  it("uses libx264 and crf 32", () => {
    expect(buildCompressCommand("in.mp4", "out.mp4")).toEqual([
      "ffmpeg",
      "-y",
      "-i",
      "in.mp4",
      "-vcodec",
      "libx264",
      "-crf",
      "32",
      "out.mp4"
    ]);
  });
});
