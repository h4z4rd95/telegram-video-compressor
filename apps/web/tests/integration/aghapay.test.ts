import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAghaPayRequestPayload,
  normalizeAghaPayCallback
} from "@/lib/payments/aghapay";
import { GET as callbackGET } from "@/app/api/payments/aghapay/callback/route";
import { POST as requestPOST } from "@/app/api/payments/aghapay/request/route";

describe("aghapay", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds the request payload with callback url and api key", () => {
    vi.stubEnv("AGHAPAY_API_KEY", "aghapay_test_key");

    expect(
      buildAghaPayRequestPayload({
        amount: 100000,
        callbackUrl: "https://app.test/api/payments/aghapay/callback"
      })
    ).toEqual({
      api_key: "aghapay_test_key",
      amount: 100000,
      callback_url: "https://app.test/api/payments/aghapay/callback",
      description: "Video compressor plan purchase"
    });
  });

  it("maps authority and status from callback params", () => {
    expect(normalizeAghaPayCallback({ transid: "123", status: "1" })).toEqual({
      authority: "123",
      status: "success"
    });
  });

  it("returns a request payload from the request route", async () => {
    vi.stubEnv("AGHAPAY_API_KEY", "aghapay_test_key");

    const response = await requestPOST(
      new Request("http://localhost/api/payments/aghapay/request", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          amount: 100000,
          callbackUrl: "https://app.test/api/payments/aghapay/callback"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      payload: {
        api_key: "aghapay_test_key",
        amount: 100000,
        callback_url: "https://app.test/api/payments/aghapay/callback",
        description: "Video compressor plan purchase"
      }
    });
  });

  it("redirects successful callbacks to the dashboard", async () => {
    vi.stubEnv("APP_URL", "https://app.test");

    const response = await callbackGET(
      new Request(
        "http://localhost/api/payments/aghapay/callback?transid=123&status=1"
      )
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://app.test/dashboard?payment=success&authority=123"
    );
  });

  it("redirects failed callbacks to pricing", async () => {
    vi.stubEnv("APP_URL", "https://app.test");

    const response = await callbackGET(
      new Request(
        "http://localhost/api/payments/aghapay/callback?transid=123&status=0"
      )
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://app.test/pricing?payment=failed&authority=123"
    );
  });
});
