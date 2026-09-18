import React from "react";

type QuotaCardsProps = {
  storageUsedMb: number;
  storageLimitMb: number;
  videosUsed: number;
  videoLimit: number;
  expiresAt?: Date | null;
};

function formatDate(value?: Date | null) {
  if (!value) {
    return "Free plan";
  }

  return value.toISOString().slice(0, 10);
}

export function QuotaCards({
  storageUsedMb,
  storageLimitMb,
  videosUsed,
  videoLimit,
  expiresAt
}: QuotaCardsProps) {
  const cards = [
    {
      label: "Storage used",
      value: `${storageUsedMb.toFixed(1)} / ${storageLimitMb} MB`
    },
    {
      label: "Videos processed",
      value: `${videosUsed} / ${videoLimit}`
    },
    {
      label: "Plan expires",
      value: formatDate(expiresAt)
    }
  ];

  return (
    <section
      aria-label="Quota overview"
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
      }}
    >
      {cards.map((card) => (
        <article
          key={card.label}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "1rem",
            backgroundColor: "#ffffff"
          }}
        >
          <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem" }}>{card.label}</p>
          <strong style={{ display: "block", marginTop: "0.5rem", fontSize: "1.1rem" }}>
            {card.value}
          </strong>
        </article>
      ))}
    </section>
  );
}
