import crypto from "node:crypto";

export const AUTH_USER_ID_HEADER = "x-user-id";
export const AUTH_USER_ROLE_HEADER = "x-user-role";
export const TELEGRAM_SIGNATURE_HEADER = "x-telegram-signature";

const signaturePrefix = "sha256=";
const devTelegramWebhookSecret = "development-telegram-webhook-secret";

export type RequestUser = {
  id: string;
  role: string;
};

function normalizeSignature(signature: string) {
  if (signature.startsWith(signaturePrefix)) {
    return signature.slice(signaturePrefix.length);
  }

  return signature;
}

export function createWebhookSignature(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(
  signature: string,
  payload: string,
  secret: string
) {
  if (!signature || !payload || !secret) {
    return false;
  }

  const received = Buffer.from(normalizeSignature(signature), "utf8");
  const expected = Buffer.from(createWebhookSignature(payload, secret), "utf8");

  if (received.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, expected);
}

export function getTelegramWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET ?? devTelegramWebhookSecret;
}

export function getRequestUser(request: Request): RequestUser | null {
  const id = request.headers.get(AUTH_USER_ID_HEADER)?.trim();

  if (!id) {
    return null;
  }

  return {
    id,
    role: request.headers.get(AUTH_USER_ROLE_HEADER)?.trim() || "user"
  };
}

export function requireAuthenticatedUser(request: Request) {
  if (!getRequestUser(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function requireAdminUser(request: Request) {
  const user = getRequestUser(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
