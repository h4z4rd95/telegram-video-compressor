import React from "react";

import { PaymentHistory } from "@/components/dashboard/payment-history";
import { QuotaCards } from "@/components/dashboard/quota-cards";
import { StorageProgress } from "@/components/dashboard/storage-progress";
import { SubscriptionSummary } from "@/components/dashboard/subscription-summary";
import { VideoJobsTable } from "@/components/dashboard/video-jobs-table";
import { db } from "@/lib/db";

async function listRecentJobs() {
  try {
    return await db.videoJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
  } catch {
    return [];
  }
}

function calculateStorageUsedMb(
  jobs: Array<{ outputSizeBytes: number | null; sourceSizeBytes: number }>
) {
  const totalBytes = jobs.reduce((sum, job) => {
    return sum + (job.outputSizeBytes ?? job.sourceSizeBytes);
  }, 0);

  return totalBytes / (1024 * 1024);
}

export default async function DashboardPage() {
  const jobs = await listRecentJobs();
  const storageUsedMb = calculateStorageUsedMb(jobs);

  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Dashboard</h1>
      <p>Track your latest compression jobs and current free-plan quota.</p>
      <div style={{ marginTop: "2rem" }}>
        <QuotaCards
          storageUsedMb={storageUsedMb}
          storageLimitMb={500}
          videosUsed={jobs.length}
          videoLimit={10}
        />
      </div>
      <section
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
        }}
      >
        <StorageProgress usedMb={Math.round(storageUsedMb)} totalMb={500} />
        <SubscriptionSummary planName="Free" expiresAt={null} />
        <PaymentHistory items={[]} />
      </section>
      <section style={{ marginTop: "2rem" }}>
        <h2>Recent jobs</h2>
        <VideoJobsTable jobs={jobs} />
      </section>
    </main>
  );
}
