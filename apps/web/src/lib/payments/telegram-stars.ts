export type TelegramStarsEligibilityInput = {
  telegramId: string | null;
};

export type TelegramStarsSettlementPayload = {
  telegramPaymentChargeId: string;
  invoicePayload: string;
};

export function canUseTelegramStars(input: TelegramStarsEligibilityInput) {
  return Boolean(input.telegramId);
}

export async function settleTelegramStarsPayment(
  payload: TelegramStarsSettlementPayload
) {
  return {
    telegramPaymentChargeId: payload.telegramPaymentChargeId,
    invoicePayload: payload.invoicePayload,
    settled: true as const
  };
}
