import React from "react";

export type VideoJobRow = {
  id: string;
  status: string;
  inputKey: string;
  outputKey: string | null;
  sourceSizeBytes: number;
  outputSizeBytes: number | null;
  createdAt: Date;
};

type VideoJobsTableProps = {
  jobs: VideoJobRow[];
};

function bytesToMb(value: number | null) {
  if (value === null) {
    return "Pending";
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoJobsTable({ jobs }: VideoJobsTableProps) {
  if (jobs.length === 0) {
    return <p>No video jobs yet.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th align="left">Job</th>
          <th align="left">Status</th>
          <th align="left">Input</th>
          <th align="left">Output</th>
          <th align="left">Created</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} style={{ borderTop: "1px solid #e5e7eb" }}>
            <td style={{ padding: "0.75rem 0" }}>{job.id}</td>
            <td style={{ padding: "0.75rem 0" }}>{job.status}</td>
            <td style={{ padding: "0.75rem 0" }}>{bytesToMb(job.sourceSizeBytes)}</td>
            <td style={{ padding: "0.75rem 0" }}>{bytesToMb(job.outputSizeBytes)}</td>
            <td style={{ padding: "0.75rem 0" }}>{job.createdAt.toISOString().slice(0, 10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
