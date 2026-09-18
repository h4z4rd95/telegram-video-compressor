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
import { PaymentHistory } from "@/components/dashboard/payment-history";
import { StorageProgress } from "@/components/dashboard/storage-progress";
import { SubscriptionSummary } from "@/components/dashboard/subscription-summary";

describe("dashboard ui", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("shows used and total storage in the storage progress widget", () => {
    render(<StorageProgress usedMb={250} totalMb={500} />);

    expect(screen.getByText("250 / 500 MB")).toBeInTheDocument();
    expect(screen.getByLabelText("Storage 50%")).toBeInTheDocument();
  });

  it("shows the plan name and expiration date in the subscription summary", () => {
    render(
      <SubscriptionSummary
        planName="Pro"
        expiresAt={new Date("2026-10-01T00:00:00.000Z")}
      />
    );

    expect(screen.getByText(/pro/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-10-01/i)).toBeInTheDocument();
  });

  it("renders payment history items", () => {
    render(
      <PaymentHistory
        items={[
          { id: "pay_1", amountLabel: "$9.99", status: "Paid", createdAt: "2026-09-18" }
        ]}
      />
    );

    expect(screen.getByText(/payment history/i)).toBeInTheDocument();
    expect(screen.getByText(/pay_1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$9\.99/i)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
  });

  it("renders the new dashboard widgets alongside recent jobs", async () => {
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
    expect(screen.getByText(/subscription summary/i)).toBeInTheDocument();
    expect(screen.getByText(/payment history/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/storage 50%|storage 100%|storage \d+%/i)).toBeInTheDocument();
    expect(screen.getByText(/recent jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/job_1/i)).toBeInTheDocument();
  });
});
