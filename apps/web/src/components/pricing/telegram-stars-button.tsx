import React from "react";
import { canUseTelegramStars } from "@/lib/payments/telegram-stars";

type TelegramStarsButtonProps = {
  telegramId: string | null;
};

export function TelegramStarsButton({ telegramId }: TelegramStarsButtonProps) {
  const eligible = canUseTelegramStars({ telegramId });

  return (
    <button
      type="button"
      disabled={!eligible}
      aria-label={eligible ? "Pay with Telegram Stars" : "Telegram Stars unavailable"}
    >
      {eligible ? "Pay with Telegram Stars" : "Telegram Stars unavailable"}
    </button>
  );
}
