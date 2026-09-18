export type TelegramLinkRequest = {
  userId: string;
  telegramId: string;
  username?: string | null;
};

export type TelegramLinkResult = {
  status: "scaffolded";
  userId: string;
  telegramId: string;
  username: string | null;
  botUrl: string | null;
  note: string;
};

export function buildTelegramBotUrl(startToken?: string): string | null {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim();

  if (!botUsername) {
    return null;
  }

  const url = new URL(`https://t.me/${botUsername}`);

  if (startToken) {
    url.searchParams.set("start", startToken);
  }

  return url.toString();
}

export async function linkTelegramAccount(request: TelegramLinkRequest): Promise<TelegramLinkResult> {
  return {
    status: "scaffolded",
    userId: request.userId,
    telegramId: request.telegramId,
    username: request.username ?? null,
    botUrl: buildTelegramBotUrl(request.userId),
    note: "Telegram persistence is not wired yet. Add the TelegramProfile Prisma model and webhook validation in a follow-up task."
  };
}
