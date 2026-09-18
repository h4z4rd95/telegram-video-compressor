import { describe, expect, it, vi, beforeEach } from "vitest";

const { findUnique } = vi.hoisted(() => ({
  findUnique: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  db: {
    videoJob: {
      findUnique
    }
  }
}));

import { GET } from "@/app/api/jobs/[id]/route";

describe("jobs api", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns the requested job payload", async () => {
    findUnique.mockResolvedValue({
      id: "job_1",
      status: "COMPLETED",
      inputKey: "uploads/source.mp4",
      outputKey: "outputs/source-compressed.mp4",
      sourceSizeBytes: 8_000_000,
      outputSizeBytes: 4_000_000,
      error: null,
      createdAt: new Date("2026-09-18T10:00:00.000Z"),
      updatedAt: new Date("2026-09-18T10:05:00.000Z")
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "job_1" })
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "job_1",
      status: "COMPLETED",
      outputKey: "outputs/source-compressed.mp4"
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "job_1" } });
  });

  it("returns 404 when the job does not exist", async () => {
    findUnique.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing_job" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Job not found."
    });
  });
});
