import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST as approvePayment } from "@/app/api/admin/payments/[id]/approve/route";
import { POST as rejectPayment } from "@/app/api/admin/payments/[id]/reject/route";
import { POST as uploadReceipt } from "@/app/api/payments/card-to-card/receipt/route";
import { POST as telegramWebhook } from "@/app/api/payments/telegram-stars/webhook/route";
import { verifyWebhookSignature } from "@/lib/security";
import { config, middleware } from "../../middleware";

describe("webhook signature", () => {
  it("rejects invalid signatures", () => {
    expect(verifyWebhookSignature("bad", "payload", "secret")).toBe(false);
  });

  it("requires an authenticated admin for admin payment approval routes", async () => {
    const unauthenticated = await approvePayment(new Request("http://localhost"), {
      params: Promise.resolve({ id: "payment_1" })
    });
    expect(unauthenticated.status).toBe(401);

    const forbidden = await rejectPayment(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          "x-user-id": "user_1",
          "x-user-role": "user"
        }
      }),
      {
        params: Promise.resolve({ id: "payment_1" })
      }
    );
    expect(forbidden.status).toBe(403);
  });

  it("requires an authenticated user for card receipt uploads", async () => {
    const formData = new FormData();
    formData.set(
      "receipt",
      new File(["receipt-image"], "receipt.png", { type: "image/png" })
    );
    const request = new Request("http://localhost/api/payments/card-to-card/receipt", {
      method: "POST"
    });
    Object.defineProperty(request, "formData", {
      value: async () => formData
    });

    const response = await uploadReceipt(request);
    expect(response.status).toBe(401);
  });

  it("rejects telegram webhook requests with an invalid signature", async () => {
    const response = await telegramWebhook(
      new Request("http://localhost/api/payments/telegram-stars/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-signature": "bad"
        },
        body: JSON.stringify({
          telegramPaymentChargeId: "tg_charge_1",
          invoicePayload: "plan:pro"
        })
      })
    );

    expect(response.status).toBe(401);
  });

  it("guards admin routes in middleware", () => {
    const response = middleware(new NextRequest("http://localhost/api/admin/payments/payment_1/approve"));
    expect(response.status).toBe(401);
    expect(config.matcher).toContain("/api/admin/:path*");
  });
});
