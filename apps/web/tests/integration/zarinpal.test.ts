import { describe, expect, it } from "vitest";

import { buildZarinpalRequestPayload } from "@/lib/payments/zarinpal";
import { POST as requestPayment } from "@/app/api/payments/zarinpal/request/route";
import { GET as handleCallback } from "@/app/api/payments/zarinpal/callback/route";

describe("zarinpal payment flow", () => {
  it("builds a request payload with amount and callback url", () => {
    const payload = buildZarinpalRequestPayload({
      amount: 100000,
      callbackUrl: "https://app.test/api/payments/zarinpal/callback"
    });

    expect(payload).toMatchObject({
      amount: 100000,
      callback_url: "https://app.test/api/payments/zarinpal/callback",
      description: "Video compressor plan purchase"
    });
  });

  it("returns the request payload from the request route", async () => {
    const response = await requestPayment(
      new Request("http://localhost/api/payments/zarinpal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: 250000,
          callbackUrl: "https://app.test/api/payments/zarinpal/callback"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      payload: {
        amount: 250000,
        callback_url: "https://app.test/api/payments/zarinpal/callback"
      }
    });
  });

  it("redirects failed callbacks back to pricing", async () => {
    const response = await handleCallback(
      new Request("http://localhost/api/payments/zarinpal/callback?Status=NOK")
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/pricing?payment=failed"
    );
  });

  it("redirects successful callbacks to the dashboard", async () => {
    const response = await handleCallback(
      new Request(
        "http://localhost/api/payments/zarinpal/callback?Status=OK&Authority=A000000000000000000000000001"
      )
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard?payment=success"
    );
  });
});
