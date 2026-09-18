import React from "react";

export type PaymentHistoryItem = {
  id: string;
  amountLabel: string;
  status: string;
  createdAt: string;
};

type PaymentHistoryProps = {
  items: PaymentHistoryItem[];
};

export function PaymentHistory({ items }: PaymentHistoryProps) {
  return (
    <section
      aria-label="Payment history"
      style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "#ffffff" }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Payment history</h2>
      {items.length === 0 ? (
        <p style={{ margin: 0 }}>No payments yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Reference</th>
              <th align="left">Amount</th>
              <th align="left">Status</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.75rem 0" }}>{item.id}</td>
                <td style={{ padding: "0.75rem 0" }}>{item.amountLabel}</td>
                <td style={{ padding: "0.75rem 0" }}>{item.status}</td>
                <td style={{ padding: "0.75rem 0" }}>{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
