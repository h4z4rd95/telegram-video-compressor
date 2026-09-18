import React from "react";

import { getAvailablePlans } from "@/lib/plans";

export default function PricingPage() {
  const plans = getAvailablePlans().filter((plan) => plan.price > 0);

  return (
    <main style={{ maxWidth: "64rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1>Choose a plan</h1>
      <p>Upgrade for more storage, more video jobs, and longer subscription time.</p>
      <section
        aria-label="Pricing plans"
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginTop: "2rem"
        }}
      >
        {plans.map((plan) => (
          <article
            key={plan.name}
            style={{ border: "1px solid #d4d4d8", borderRadius: "0.75rem", padding: "1.25rem" }}
          >
            <h2 style={{ marginTop: 0, textTransform: "capitalize" }}>{plan.name}</h2>
            <p>{plan.price.toLocaleString("en-US")} IRR</p>
            <p>{plan.storageMb} MB storage</p>
            <p>{plan.videoLimit} videos</p>
            <p>{plan.durationDays} days</p>
          </article>
        ))}
      </section>
    </main>
  );
}
