"use client";

import React, { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: "0.75rem",
  padding: "0.875rem 1rem",
  font: "inherit"
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: "0.75rem",
  padding: "0.875rem 1rem",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer"
};

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = () => {
    setMessage(null);
    startTransition(() => {
      void signIn("google", { callbackUrl: "/dashboard" });
    });
  };

  const handleEmailSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("لینک ورود برای ایمیل ارسال می‌شود. در محیط توسعه این جریان با SMTP واقعی کامل نشده است.");
    startTransition(() => {
      void signIn("email", {
        email,
        callbackUrl: "/dashboard"
      });
    });
  };

  const handleTelegramSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("ورود تلگرام فعلاً به‌صورت اسکلت متصل است و بعداً با وبهوک و اعتبارسنجی تلگرام کامل می‌شود.");
    startTransition(() => {
      void signIn("telegram", {
        telegramId,
        username: telegramUsername,
        callbackUrl: "/dashboard"
      });
    });
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        style={{ ...buttonStyle, background: "#0f172a", color: "#ffffff" }}
      >
        ادامه با گوگل
      </button>

      <form onSubmit={handleEmailSignIn} style={{ display: "grid", gap: "0.75rem" }}>
        <label htmlFor="email" style={{ fontWeight: 600 }}>
          ایمیل
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          style={fieldStyle}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{ ...buttonStyle, background: "#e2e8f0", color: "#0f172a" }}
        >
          ارسال لینک ورود
        </button>
      </form>

      <form onSubmit={handleTelegramSignIn} style={{ display: "grid", gap: "0.75rem" }}>
        <label htmlFor="telegram-id" style={{ fontWeight: 600 }}>
          Telegram ID
        </label>
        <input
          id="telegram-id"
          type="text"
          value={telegramId}
          onChange={(event) => setTelegramId(event.target.value)}
          placeholder="123456789"
          required
          style={fieldStyle}
        />
        <label htmlFor="telegram-username" style={{ fontWeight: 600 }}>
          Telegram username
        </label>
        <input
          id="telegram-username"
          type="text"
          value={telegramUsername}
          onChange={(event) => setTelegramUsername(event.target.value)}
          placeholder="myusername"
          style={fieldStyle}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{ ...buttonStyle, background: "#38bdf8", color: "#082f49" }}
        >
          ادامه با تلگرام
        </button>
      </form>

      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.7 }}>
        برای محیط توسعه، مقادیر پیش‌فرض غیرواقعی استفاده می‌شود تا route و UI بدون secret واقعی بالا بیایند.
      </p>

      {message ? (
        <p style={{ margin: 0, color: "#0f766e", fontSize: "0.95rem", lineHeight: 1.7 }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
