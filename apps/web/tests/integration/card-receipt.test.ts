import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminPaymentsPage from "@/app/admin/payments/page";
import { POST as approvePayment } from "@/app/api/admin/payments/[id]/approve/route";
import { POST as rejectPayment } from "@/app/api/admin/payments/[id]/reject/route";
import { POST as uploadReceipt } from "@/app/api/payments/card-to-card/receipt/route";
import { validateReceiptUpload } from "@/lib/payments/card-to-card";
import {
  AUTH_USER_ID_HEADER,
  AUTH_USER_ROLE_HEADER
} from "@/lib/security";

describe("card receipt flow", () => {
  it("accepts image receipts only", () => {
    expect(() =>
      validateReceiptUpload({ contentType: "application/pdf" })
    ).toThrow(/image/i);
  });

  it("accepts image receipts in the upload route", async () => {
    const formData = new FormData();
    formData.set(
      "receipt",
      new File(["receipt-image"], "receipt.png", { type: "image/png" })
    );
    const request = new Request("http://localhost/api/payments/card-to-card/receipt", {
      method: "POST",
      headers: {
        [AUTH_USER_ID_HEADER]: "user_1"
      }
    });
    Object.defineProperty(request, "formData", {
      value: async () => formData
    });

    const response = await uploadReceipt(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      fileName: "receipt.png",
      contentType: "image/png"
    });
  });

  it("renders the admin manual review page", async () => {
    render(await AdminPaymentsPage());

    expect(
      screen.getByRole("heading", { name: /manual receipt review/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/approve or reject uploaded receipts/i)).toBeInTheDocument();
  });

  it("returns an approval payload from the admin approve route", async () => {
    const response = await approvePayment(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          [AUTH_USER_ID_HEADER]: "admin_1",
          [AUTH_USER_ROLE_HEADER]: "admin"
        }
      }),
      {
        params: Promise.resolve({ id: "payment_1" })
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      paymentId: "payment_1",
      status: "approved"
    });
  });

  it("returns a rejection payload from the admin reject route", async () => {
    const response = await rejectPayment(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          [AUTH_USER_ID_HEADER]: "admin_1",
          [AUTH_USER_ROLE_HEADER]: "admin"
        }
      }),
      {
        params: Promise.resolve({ id: "payment_1" })
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      paymentId: "payment_1",
      status: "rejected"
    });
  });
});
