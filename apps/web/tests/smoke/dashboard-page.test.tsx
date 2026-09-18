import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  db: {
    videoJob: {
      findMany
    }
  }
}));

import DashboardPage from "@/app/dashboard/page";
import DashboardVideosPage from "@/app/dashboard/videos/page";

describe("dashboard pages", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("shows quota cards and recent jobs on the dashboard", async () => {
    findMany.mockResolvedValue([
      {
        id: "job_1",
        status: "COMPLETED",
        inputKey: "uploads/source.mp4",
        outputKey: "outputs/source-compressed.mp4",
        sourceSizeBytes: 8_000_000,
        outputSizeBytes: 4_000_000,
        error: null,
        createdAt: new Date("2026-09-18T10:00:00.000Z"),
        updatedAt: new Date("2026-09-18T10:05:00.000Z")
      }
    ]);

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/storage used/i)).toBeInTheDocument();
    expect(screen.getByText(/videos processed/i)).toBeInTheDocument();
    expect(screen.getByText(/job_1/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("shows an empty state on the videos page when no jobs exist", async () => {
    findMany.mockResolvedValue([]);

    render(await DashboardVideosPage());

    expect(screen.getByRole("heading", { name: /video jobs/i })).toBeInTheDocument();
    expect(screen.getByText(/no video jobs yet/i)).toBeInTheDocument();
  });
});
