import React from "react";

type SubscriptionSummaryProps = {
  planName: string;
  expiresAt?: Date | null;
};

function formatDate(value?: Date | null) {
  if (!value) {
    return "No expiration";
  }

  return value.toISOString().slice(0, 10);
}

export function SubscriptionSummary({ planName, expiresAt }: SubscriptionSummaryProps) {
  return (
    <section
      aria-label="Subscription summary"
      style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "#ffffff" }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Subscription summary</h2>
      <p style={{ margin: 0 }}>
        <strong>Plan:</strong> {planName}
      </p>
      <p style={{ marginBottom: 0, marginTop: "0.5rem" }}>
        <strong>Expires:</strong> {formatDate(expiresAt)}
      </p>
    </section>
  );
}
