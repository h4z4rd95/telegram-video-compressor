import React from "react";

import { VideoJobsTable } from "@/components/dashboard/video-jobs-table";
import { db } from "@/lib/db";

async function listJobs() {
  try {
    return await db.videoJob.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch {
    return [];
  }
}

export default async function DashboardVideosPage() {
  const jobs = await listJobs();

  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Video Jobs</h1>
      <p>Inspect the latest uploads and their compression status.</p>
      <section style={{ marginTop: "2rem" }}>
        <VideoJobsTable jobs={jobs} />
      </section>
    </main>
  );
}
