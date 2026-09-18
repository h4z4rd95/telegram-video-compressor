import React from "react";

type StorageProgressProps = {
  usedMb: number;
  totalMb: number;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function StorageProgress({ usedMb, totalMb }: StorageProgressProps) {
  const percent = totalMb > 0 ? clampPercent((usedMb / totalMb) * 100) : 0;

  return (
    <section
      aria-label="Storage progress"
      style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "#ffffff" }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Storage progress</h2>
      <div
        aria-label={`Storage ${percent}%`}
        style={{
          width: "100%",
          height: "0.75rem",
          borderRadius: "9999px",
          backgroundColor: "#e5e7eb",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: "#2563eb"
          }}
        />
      </div>
      <p style={{ marginBottom: 0, marginTop: "0.75rem" }}>
        {usedMb} / {totalMb} MB
      </p>
    </section>
  );
}
