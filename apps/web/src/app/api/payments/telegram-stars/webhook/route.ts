import { settleTelegramStarsPayment } from "@/lib/payments/telegram-stars";
import {
  getTelegramWebhookSecret,
  TELEGRAM_SIGNATURE_HEADER,
  verifyWebhookSignature
} from "@/lib/security";

export async function POST(request: Request) {
  const signature = request.headers.get(TELEGRAM_SIGNATURE_HEADER) ?? "";
  const payload = await request.text();

  if (!verifyWebhookSignature(signature, payload, getTelegramWebhookSecret())) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const body = JSON.parse(payload) as {
    telegramPaymentChargeId?: string;
    invoicePayload?: string;
  };

  if (!body.telegramPaymentChargeId || !body.invoicePayload) {
    return Response.json(
      {
        error: "telegramPaymentChargeId and invoicePayload are required."
      },
      { status: 400 }
    );
  }

  const settlement = await settleTelegramStarsPayment({
    telegramPaymentChargeId: body.telegramPaymentChargeId,
    invoicePayload: body.invoicePayload
  });

  return Response.json({
    ok: true,
    settlement
  });
}
