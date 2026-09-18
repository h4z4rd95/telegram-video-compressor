import React from "react";

export default async function AdminPaymentsPage() {
  return (
    <main style={{ maxWidth: "64rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Manual receipt review</h1>
      <p>Approve or reject uploaded receipts before activating a subscription.</p>
      <section
        aria-label="Pending receipt reviews"
        style={{ marginTop: "2rem", border: "1px solid #d4d4d8", borderRadius: "0.75rem", padding: "1rem" }}
      >
        <p>No pending receipts yet.</p>
      </section>
    </main>
  );
}
