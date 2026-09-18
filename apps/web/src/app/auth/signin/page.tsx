import React from "react";
import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  return (
    <main style={{ maxWidth: "32rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "1rem",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          padding: "2rem"
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "0.75rem" }}>ورود به حساب</h1>
        <p style={{ marginTop: 0, marginBottom: "1.5rem", color: "#475569", lineHeight: 1.7 }}>
          برای شروع می‌توانید با گوگل، لینک یک‌بارمصرف ایمیل، یا اسکلت ورود تلگرام وارد شوید.
        </p>
        <SignInForm />
      </div>
    </main>
  );
}
