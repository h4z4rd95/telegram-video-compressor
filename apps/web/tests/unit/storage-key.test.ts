import { describe, expect, it } from "vitest";

import { buildStorageKey } from "@/lib/storage";

describe("storage key", () => {
  it("names uploads by user and job", () => {
    expect(buildStorageKey("user_1", "job_1", "video.mp4")).toBe(
      "users/user_1/jobs/job_1/source-video.mp4"
    );
  });
});
