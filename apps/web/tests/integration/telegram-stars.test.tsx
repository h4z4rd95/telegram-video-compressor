import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { POST as webhookPOST } from "@/app/api/payments/telegram-stars/webhook/route";
import { TelegramStarsButton } from "@/components/pricing/telegram-stars-button";
import { canUseTelegramStars } from "@/lib/payments/telegram-stars";
import {
  createWebhookSignature,
  getTelegramWebhookSecret,
  TELEGRAM_SIGNATURE_HEADER
} from "@/lib/security";

describe("telegram stars", () => {
  it("requires linked telegram identity for eligibility", () => {
    expect(canUseTelegramStars({ telegramId: null })).toBe(false);
    expect(canUseTelegramStars({ telegramId: "123456" })).toBe(true);
  });

  it("accepts webhook settlement payloads", async () => {
    const payload = JSON.stringify({
      telegramPaymentChargeId: "tg_charge_1",
      invoicePayload: "plan:pro"
    });
    const response = await webhookPOST(
      new Request("http://localhost/api/payments/telegram-stars/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [TELEGRAM_SIGNATURE_HEADER]: createWebhookSignature(
            payload,
            getTelegramWebhookSecret()
          )
        },
        body: payload
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      settlement: {
        invoicePayload: "plan:pro",
        settled: true,
        telegramPaymentChargeId: "tg_charge_1"
      }
    });
  });

  it("renders a telegram stars checkout button for eligible users", () => {
    render(<TelegramStarsButton telegramId="123456" />);

    expect(
      screen.getByRole("button", { name: /pay with telegram stars/i })
    ).toBeEnabled();
  });

  it("disables telegram stars when telegram is not linked", () => {
    render(<TelegramStarsButton telegramId={null} />);

    expect(
      screen.getByRole("button", { name: /telegram stars unavailable/i })
    ).toBeDisabled();
  });
});
