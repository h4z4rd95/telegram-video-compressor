import type { NextAuthConfig } from "next-auth";
import type { CredentialInput, CredentialsConfig } from "@auth/core/providers/credentials";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";

const devAuthSecret = "development-auth-secret";
const devGoogleClientId = "google-client-id-placeholder";
const devGoogleClientSecret = "google-client-secret-placeholder";
const devEmailServer = "smtp://user:pass@127.0.0.1:1025";
const devEmailFrom = "noreply@example.com";

const telegramCredentials = {
  telegramId: {
    label: "Telegram ID",
    type: "text"
  },
  username: {
    label: "Username",
    type: "text"
  }
} satisfies Record<string, CredentialInput>;

const telegramProvider: CredentialsConfig<typeof telegramCredentials> = {
  id: "telegram",
  name: "Telegram",
  type: "credentials",
  credentials: telegramCredentials,
  async authorize(credentials) {
    const telegramId = typeof credentials?.telegramId === "string"
      ? credentials.telegramId.trim()
      : "";
    const username = typeof credentials?.username === "string"
      ? credentials.username.trim()
      : "";

    if (!telegramId) {
      return null;
    }

    return {
      id: `telegram:${telegramId}`,
      name: username || "Telegram user"
    };
  }
};

export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? devAuthSecret,
  pages: {
    signIn: "/auth/signin"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? devGoogleClientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? devGoogleClientSecret
    }),
    Email({
      server: process.env.EMAIL_SERVER ?? devEmailServer,
      from: process.env.EMAIL_FROM ?? devEmailFrom
    }),
    telegramProvider
  ]
} satisfies NextAuthConfig;
