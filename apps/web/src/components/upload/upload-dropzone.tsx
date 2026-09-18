"use client";

import React, { useMemo, useState, useTransition } from "react";

import { GUEST_UPLOAD_LIMIT_MB } from "@/lib/quotas";

const panelStyle: React.CSSProperties = {
  border: "1px dashed #94a3b8",
  borderRadius: "1rem",
  padding: "1.5rem",
  background: "#f8fafc",
  display: "grid",
  gap: "1rem"
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: "0.75rem",
  padding: "0.875rem 1rem",
  font: "inherit",
  fontWeight: 600,
  background: "#0f172a",
  color: "#ffffff",
  cursor: "pointer"
};

export function UploadDropzone() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedSizeMb = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return (selectedFile.size / (1024 * 1024)).toFixed(2);
  }, [selectedFile]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage("اول یک فایل ویدیویی انتخاب کنید.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const payload = await response.json();
      setMessage(response.ok ? `آپلود آماده است: ${payload.fileName}` : payload.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} style={panelStyle}>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Upload your video</h2>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
          این scaffold فعلاً فایل را به route آپلود می‌فرستد و برای مهمان‌ها سقف {GUEST_UPLOAD_LIMIT_MB} MB را
          نمایش می‌دهد.
        </p>
      </div>

      <label
        htmlFor="upload-file"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "0.75rem",
          padding: "1rem",
          background: "#ffffff",
          cursor: "pointer"
        }}
      >
        <span style={{ display: "block", fontWeight: 600 }}>انتخاب فایل ویدیو</span>
        <span style={{ display: "block", marginTop: "0.5rem", color: "#64748b" }}>
          MP4, MOV, MKV یا هر فایل ویدیویی که بعداً وارد pipeline فشرده‌سازی می‌شود.
        </span>
      </label>

      <input
        id="upload-file"
        type="file"
        accept="video/*"
        onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
      />

      <div style={{ color: "#334155", minHeight: "1.5rem" }}>
        {selectedFile ? `${selectedFile.name} (${selectedSizeMb} MB)` : "هنوز فایلی انتخاب نشده است."}
      </div>

      <button type="submit" disabled={isPending} style={buttonStyle}>
        {isPending ? "در حال بررسی..." : "شروع آپلود"}
      </button>

      {message ? (
        <p style={{ margin: 0, color: "#0f766e", lineHeight: 1.7 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
