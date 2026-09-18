# Web Video Compressor SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Telegram-only Python bot with a production-ready web application and installable PWA that lets guests and registered users upload videos, compress them, manage quotas, and pay for upgrades.

**Architecture:** Build a Next.js web app with App Router for frontend and BFF-style API routes, backed by PostgreSQL for users, plans, orders, quotas, and jobs. Use S3-compatible object storage for source/output videos, Redis + BullMQ workers for compression jobs, FFmpeg on the worker, and NextAuth/Auth.js for Google, Telegram, and email-based signup/login. Add a separate Telegram bot/webhook channel only for Telegram login deep-linking and Telegram Stars payments, while keeping the product itself web-first and PWA-capable.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Auth.js, Prisma, PostgreSQL, Redis, BullMQ, FFmpeg, MinIO/S3, Workbox or `next-pwa`, Zarinpal, AghaPay, Nodemailer/Resend, Telegram Bot API.

---

## Target Repository Shape

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/dashboard/page.tsx`
- Create: `apps/web/src/app/pricing/page.tsx`
- Create: `apps/web/src/app/auth/signin/page.tsx`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/app/api/upload/route.ts`
- Create: `apps/web/src/app/api/jobs/[id]/route.ts`
- Create: `apps/web/src/app/api/payments/zarinpal/callback/route.ts`
- Create: `apps/web/src/app/api/payments/aghapay/callback/route.ts`
- Create: `apps/web/src/app/api/payments/card-to-card/receipt/route.ts`
- Create: `apps/web/src/app/api/payments/telegram-stars/webhook/route.ts`
- Create: `apps/web/src/app/api/telegram/webhook/route.ts`
- Create: `apps/web/src/components/*`
- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icons/*`
- Create: `apps/web/src/sw.ts`
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/prisma/seed.ts`
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/lib/db.ts`
- Create: `apps/web/src/lib/storage.ts`
- Create: `apps/web/src/lib/quotas.ts`
- Create: `apps/web/src/lib/plans.ts`
- Create: `apps/web/src/lib/payments/zarinpal.ts`
- Create: `apps/web/src/lib/payments/aghapay.ts`
- Create: `apps/web/src/lib/payments/card-to-card.ts`
- Create: `apps/web/src/lib/payments/telegram-stars.ts`
- Create: `apps/web/src/lib/jobs/queue.ts`
- Create: `apps/web/src/lib/jobs/enqueue-compression.ts`
- Create: `apps/web/src/lib/video/ffprobe.ts`
- Create: `apps/web/src/lib/video/compress.ts`
- Create: `apps/web/src/server/worker.ts`
- Create: `apps/web/src/server/telegram-bot.ts`
- Create: `apps/web/src/types/*`
- Create: `apps/web/tests/*`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `README.md`
- Keep: `bot.py` only as legacy reference until cutover, then archive or remove in final cleanup task

## Domain Model

**Core tables:**
- `User`: identity, role, auth source, storage usage, active plan
- `Account`: Auth.js provider accounts
- `Session` and `VerificationToken`: email auth/session flow
- `Plan`: package definition with `storageMb`, `videoLimit`, `durationDays`, `price`
- `Subscription`: user-plan lifecycle, start/end, counters, status
- `VideoJob`: uploaded source, compressed output, size before/after, status, error, timestamps
- `QuotaLedger`: auditable storage/video/time consumption events
- `Payment`: gateway, authority/ref, status, amount, plan, proof image, manual approval fields
- `TelegramProfile`: telegram id, username, stars eligibility
- `AdminAction`: manual receipt approval/rejection logs

**Quota rules:**
- Guest: max single upload `100 MB`, no dashboard persistence, no saved history beyond processing lifecycle
- Registered free user: `500 MB` total storage quota
- Paid plan: three enforceable factors
  - `storageMb`
  - `videoLimit`
  - `durationDays`
- Subscription becomes unusable when any one factor is exhausted

## Phase Strategy

- Phase 1: Foundation, auth, DB, file storage, dashboard shell
- Phase 2: Compression pipeline, job tracking, guest vs user limits
- Phase 3: Pricing, subscriptions, quota enforcement
- Phase 4: Payments: Zarinpal, AghaPay, card-to-card receipt upload, manual admin approval
- Phase 5: Telegram login binding and Telegram Stars for Telegram-linked users
- Phase 6: PWA polish, install prompts, iPhone-friendly behavior, QA, deployment

### Task 1: Bootstrap Monorepo-Ready Web App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`
- Modify: `README.md`
- Test: `apps/web/tests/smoke/homepage.test.ts`

- [ ] **Step 1: Write the failing smoke test**

```ts
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("homepage", () => {
  it("shows the product headline", () => {
    render(<HomePage />);
    expect(screen.getByText(/compress videos on the web/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- homepage`
Expected: FAIL with missing Next.js app files or missing component export

- [ ] **Step 3: Write minimal implementation**

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Compress videos on the web</h1>
      <p>Upload, compress, and manage your quota from any device.</p>
    </main>
  );
}
```

- [ ] **Step 4: Add project scripts and base dependencies**

```json
{
  "name": "web-video-compressor",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "lint": "next lint"
  }
}
```

- [ ] **Step 5: Run the smoke test again**

Run: `cd /workspace/apps/web && npm test -- homepage`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web README.md
git commit -m "feat(web): bootstrap nextjs application"
```

### Task 2: Add Database Schema And Prisma

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/src/lib/db.ts`
- Create: `apps/web/prisma/seed.ts`
- Create: `apps/web/tests/unit/plans.test.ts`

- [ ] **Step 1: Write the failing quota plan test**

```ts
import { describe, expect, it } from "vitest";
import { getDefaultFreePlan } from "@/lib/plans";

describe("free plan", () => {
  it("grants 500 MB storage", () => {
    expect(getDefaultFreePlan().storageMb).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- plans`
Expected: FAIL with module not found

- [ ] **Step 3: Create Prisma schema**

```prisma
model Plan {
  id          String   @id @default(cuid())
  name        String   @unique
  price       Int
  storageMb   Int
  videoLimit  Int
  durationDays Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  subscriptions Subscription[]
}
```

- [ ] **Step 4: Add the plan helper**

```ts
export function getDefaultFreePlan() {
  return {
    name: "free",
    price: 0,
    storageMb: 500,
    videoLimit: 10,
    durationDays: 30,
  };
}
```

- [ ] **Step 5: Generate Prisma client and run tests**

Run: `cd /workspace/apps/web && npx prisma generate && npm test -- plans`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/prisma apps/web/src/lib apps/web/tests
git commit -m "feat(db): add prisma schema and free plan model"
```

### Task 3: Implement Authentication With Google, Telegram, And Email

**Files:**
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/app/auth/signin/page.tsx`
- Create: `apps/web/src/components/auth/signin-form.tsx`
- Create: `apps/web/src/server/telegram-bot.ts`
- Create: `apps/web/tests/integration/auth-config.test.ts`

- [ ] **Step 1: Write the failing auth provider test**

```ts
import { describe, expect, it } from "vitest";
import { authConfig } from "@/lib/auth";

describe("auth providers", () => {
  it("enables google, email, and telegram", () => {
    expect(authConfig.providers).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- auth-config`
Expected: FAIL with missing auth config

- [ ] **Step 3: Implement Auth.js providers**

```ts
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Email({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
    {
      id: "telegram",
      name: "Telegram",
      type: "oauth",
    },
  ],
};
```

- [ ] **Step 4: Add Telegram login binding flow**

```ts
export async function linkTelegramAccount(userId: string, telegramId: string) {
  return db.telegramProfile.upsert({
    where: { telegramId },
    update: { userId },
    create: { telegramId, userId },
  });
}
```

- [ ] **Step 5: Run auth tests**

Run: `cd /workspace/apps/web && npm test -- auth-config`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/auth.ts apps/web/src/app/api/auth apps/web/src/server/telegram-bot.ts
git commit -m "feat(auth): add google email and telegram auth flows"
```

### Task 4: Build Upload API And Quota Gate

**Files:**
- Create: `apps/web/src/app/api/upload/route.ts`
- Create: `apps/web/src/lib/storage.ts`
- Create: `apps/web/src/lib/quotas.ts`
- Create: `apps/web/src/components/upload/upload-dropzone.tsx`
- Create: `apps/web/tests/integration/upload-limit.test.ts`

- [ ] **Step 1: Write the failing guest upload limit test**

```ts
import { describe, expect, it } from "vitest";
import { assertUploadAllowed } from "@/lib/quotas";

describe("guest upload policy", () => {
  it("rejects guest uploads above 100 MB", () => {
    expect(() => assertUploadAllowed({ isGuest: true, sizeMb: 101 })).toThrow(/100 MB/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- upload-limit`
Expected: FAIL with missing quota module

- [ ] **Step 3: Implement quota assertion**

```ts
export function assertUploadAllowed(input: { isGuest: boolean; sizeMb: number; remainingStorageMb?: number }) {
  if (input.isGuest && input.sizeMb > 100) {
    throw new Error("Guest uploads cannot exceed 100 MB.");
  }
  if (!input.isGuest && input.remainingStorageMb !== undefined && input.sizeMb > input.remainingStorageMb) {
    throw new Error("Upload exceeds remaining storage quota.");
  }
}
```

- [ ] **Step 4: Add upload route skeleton**

```ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "File is required" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Run upload tests**

Run: `cd /workspace/apps/web && npm test -- upload-limit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/api/upload apps/web/src/lib/quotas.ts apps/web/tests/integration/upload-limit.test.ts
git commit -m "feat(upload): enforce guest and user upload limits"
```

### Task 5: Add Object Storage Integration

**Files:**
- Create: `apps/web/src/lib/storage.ts`
- Create: `apps/web/tests/unit/storage-key.test.ts`

- [ ] **Step 1: Write the failing storage key test**

```ts
import { describe, expect, it } from "vitest";
import { buildStorageKey } from "@/lib/storage";

describe("storage key", () => {
  it("names uploads by user and job", () => {
    expect(buildStorageKey("user_1", "job_1", "video.mp4")).toBe("users/user_1/jobs/job_1/source-video.mp4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- storage-key`
Expected: FAIL with missing storage helper

- [ ] **Step 3: Implement storage key helper**

```ts
export function buildStorageKey(userId: string, jobId: string, fileName: string) {
  const normalized = fileName.replace(/\s+/g, "-").toLowerCase();
  return `users/${userId}/jobs/${jobId}/source-${normalized}`;
}
```

- [ ] **Step 4: Add S3 adapter wrapper**

```ts
export async function putObject(params: { key: string; body: Buffer; contentType: string }) {
  return s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
  }));
}
```

- [ ] **Step 5: Run storage tests**

Run: `cd /workspace/apps/web && npm test -- storage-key`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/storage.ts apps/web/tests/unit/storage-key.test.ts
git commit -m "feat(storage): add s3 object storage adapter"
```

### Task 6: Add Compression Queue And Worker

**Files:**
- Create: `apps/web/src/lib/jobs/queue.ts`
- Create: `apps/web/src/lib/jobs/enqueue-compression.ts`
- Create: `apps/web/src/lib/video/ffprobe.ts`
- Create: `apps/web/src/lib/video/compress.ts`
- Create: `apps/web/src/server/worker.ts`
- Create: `apps/web/tests/unit/compress-command.test.ts`

- [ ] **Step 1: Write the failing FFmpeg command test**

```ts
import { describe, expect, it } from "vitest";
import { buildCompressCommand } from "@/lib/video/compress";

describe("compress command", () => {
  it("uses libx264 and crf 32", () => {
    expect(buildCompressCommand("in.mp4", "out.mp4")).toEqual([
      "ffmpeg",
      "-y",
      "-i",
      "in.mp4",
      "-vcodec",
      "libx264",
      "-crf",
      "32",
      "out.mp4",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- compress-command`
Expected: FAIL with missing module

- [ ] **Step 3: Implement command builder**

```ts
export function buildCompressCommand(inputPath: string, outputPath: string) {
  return ["ffmpeg", "-y", "-i", inputPath, "-vcodec", "libx264", "-crf", "32", outputPath];
}
```

- [ ] **Step 4: Add BullMQ worker handler**

```ts
worker.process("compress-video", async (job) => {
  await markJobProcessing(job.data.jobId);
  const result = await compressVideo(job.data);
  await markJobCompleted(job.data.jobId, result);
});
```

- [ ] **Step 5: Run queue and worker tests**

Run: `cd /workspace/apps/web && npm test -- compress-command`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/jobs apps/web/src/lib/video apps/web/src/server/worker.ts
git commit -m "feat(worker): add compression queue and ffmpeg worker"
```

### Task 7: Persist Video Jobs And Dashboard

**Files:**
- Create: `apps/web/src/app/dashboard/page.tsx`
- Create: `apps/web/src/app/dashboard/videos/page.tsx`
- Create: `apps/web/src/components/dashboard/quota-cards.tsx`
- Create: `apps/web/src/components/dashboard/video-jobs-table.tsx`
- Create: `apps/web/src/app/api/jobs/[id]/route.ts`
- Create: `apps/web/tests/integration/jobs-api.test.ts`

- [ ] **Step 1: Write the failing job status API test**

```ts
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/jobs/[id]/route";

describe("jobs api", () => {
  it("returns a job payload", async () => {
    const response = await GET(new Request("http://localhost"), { params: { id: "job_1" } });
    expect(response.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- jobs-api`
Expected: FAIL with missing route

- [ ] **Step 3: Implement job status route**

```ts
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = await db.videoJob.findUnique({ where: { id } });
  return Response.json(job);
}
```

- [ ] **Step 4: Render dashboard quotas**

```tsx
<QuotaCards
  storageUsedMb={subscription.storageUsedMb}
  storageLimitMb={subscription.storageMb}
  videosUsed={subscription.videoCount}
  videoLimit={subscription.videoLimit}
  expiresAt={subscription.endsAt}
/>
```

- [ ] **Step 5: Run jobs API test**

Run: `cd /workspace/apps/web && npm test -- jobs-api`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/dashboard apps/web/src/app/api/jobs apps/web/src/components/dashboard
git commit -m "feat(dashboard): add user quota panel and jobs api"
```

### Task 8: Add Subscription Logic And Plan Enforcement

**Files:**
- Create: `apps/web/src/lib/plans.ts`
- Create: `apps/web/src/lib/quotas.ts`
- Create: `apps/web/src/app/pricing/page.tsx`
- Create: `apps/web/tests/unit/subscription-enforcement.test.ts`

- [ ] **Step 1: Write the failing subscription enforcement test**

```ts
import { describe, expect, it } from "vitest";
import { isSubscriptionUsable } from "@/lib/quotas";

describe("subscription usability", () => {
  it("expires when any factor is exhausted", () => {
    expect(isSubscriptionUsable({
      storageRemainingMb: 100,
      videosRemaining: 0,
      endsAt: new Date(Date.now() + 86400000),
    })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- subscription-enforcement`
Expected: FAIL with missing helper

- [ ] **Step 3: Implement plan enforcement**

```ts
export function isSubscriptionUsable(input: {
  storageRemainingMb: number;
  videosRemaining: number;
  endsAt: Date;
}) {
  return input.storageRemainingMb > 0 &&
    input.videosRemaining > 0 &&
    input.endsAt.getTime() > Date.now();
}
```

- [ ] **Step 4: Render pricing cards**

```tsx
<PricingCard
  name={plan.name}
  price={plan.price}
  storageMb={plan.storageMb}
  videoLimit={plan.videoLimit}
  durationDays={plan.durationDays}
/>
```

- [ ] **Step 5: Run subscription tests**

Run: `cd /workspace/apps/web && npm test -- subscription-enforcement`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/plans.ts apps/web/src/lib/quotas.ts apps/web/src/app/pricing/page.tsx
git commit -m "feat(plans): add package limits and subscription checks"
```

### Task 9: Implement Zarinpal Payment Flow

**Files:**
- Create: `apps/web/src/lib/payments/zarinpal.ts`
- Create: `apps/web/src/app/api/payments/zarinpal/request/route.ts`
- Create: `apps/web/src/app/api/payments/zarinpal/callback/route.ts`
- Create: `apps/web/tests/integration/zarinpal.test.ts`

- [ ] **Step 1: Write the failing authority builder test**

```ts
import { describe, expect, it } from "vitest";
import { buildZarinpalRequestPayload } from "@/lib/payments/zarinpal";

describe("zarinpal payload", () => {
  it("includes callback url and amount", () => {
    const payload = buildZarinpalRequestPayload({ amount: 100000, callbackUrl: "https://app.test/callback" });
    expect(payload.callback_url).toBe("https://app.test/callback");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- zarinpal`
Expected: FAIL with missing payment helper

- [ ] **Step 3: Implement request payload helper**

```ts
export function buildZarinpalRequestPayload(input: { amount: number; callbackUrl: string }) {
  return {
    amount: input.amount,
    callback_url: input.callbackUrl,
    description: "Video compressor plan purchase",
  };
}
```

- [ ] **Step 4: Add callback verification route**

```ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  if (status !== "OK" || !authority) {
    return Response.redirect(`${process.env.APP_URL}/pricing?payment=failed`);
  }
  await verifyZarinpalPayment(authority);
  return Response.redirect(`${process.env.APP_URL}/dashboard?payment=success`);
}
```

- [ ] **Step 5: Run payment tests**

Run: `cd /workspace/apps/web && npm test -- zarinpal`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/payments/zarinpal.ts apps/web/src/app/api/payments/zarinpal
git commit -m "feat(payments): add zarinpal purchase flow"
```

### Task 10: Implement AghaPay Payment Flow

**Files:**
- Create: `apps/web/src/lib/payments/aghapay.ts`
- Create: `apps/web/src/app/api/payments/aghapay/request/route.ts`
- Create: `apps/web/src/app/api/payments/aghapay/callback/route.ts`
- Create: `apps/web/tests/integration/aghapay.test.ts`

- [ ] **Step 1: Write the failing callback signature test**

```ts
import { describe, expect, it } from "vitest";
import { normalizeAghaPayCallback } from "@/lib/payments/aghapay";

describe("aghapay callback", () => {
  it("maps authority and status", () => {
    expect(normalizeAghaPayCallback({ transid: "123", status: "1" })).toEqual({
      authority: "123",
      status: "success",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- aghapay`
Expected: FAIL with missing callback normalizer

- [ ] **Step 3: Implement callback normalizer**

```ts
export function normalizeAghaPayCallback(input: { transid?: string; status?: string }) {
  return {
    authority: input.transid ?? "",
    status: input.status === "1" ? "success" : "failed",
  };
}
```

- [ ] **Step 4: Add callback route**

```ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const callback = normalizeAghaPayCallback(Object.fromEntries(url.searchParams));
  await handleAghaPayCallback(callback);
  return Response.redirect(`${process.env.APP_URL}/dashboard`);
}
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- aghapay`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/payments/aghapay.ts apps/web/src/app/api/payments/aghapay
git commit -m "feat(payments): add aghapay purchase flow"
```

### Task 11: Add Card-To-Card Receipt Upload And Manual Approval

**Files:**
- Create: `apps/web/src/lib/payments/card-to-card.ts`
- Create: `apps/web/src/app/api/payments/card-to-card/receipt/route.ts`
- Create: `apps/web/src/app/admin/payments/page.tsx`
- Create: `apps/web/src/app/api/admin/payments/[id]/approve/route.ts`
- Create: `apps/web/src/app/api/admin/payments/[id]/reject/route.ts`
- Create: `apps/web/tests/integration/card-receipt.test.ts`

- [ ] **Step 1: Write the failing receipt validation test**

```ts
import { describe, expect, it } from "vitest";
import { validateReceiptUpload } from "@/lib/payments/card-to-card";

describe("receipt upload", () => {
  it("accepts image receipts only", () => {
    expect(() => validateReceiptUpload({ contentType: "application/pdf" })).toThrow(/image/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- card-receipt`
Expected: FAIL with missing receipt validator

- [ ] **Step 3: Implement receipt validation**

```ts
export function validateReceiptUpload(input: { contentType: string }) {
  if (!input.contentType.startsWith("image/")) {
    throw new Error("Receipt must be an image.");
  }
}
```

- [ ] **Step 4: Add manual approval endpoint**

```ts
export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.payment.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date() },
  });
  await activateSubscriptionFromPayment(id);
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- card-receipt`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/payments/card-to-card.ts apps/web/src/app/api/payments/card-to-card apps/web/src/app/admin/payments
git commit -m "feat(payments): add manual receipt review flow"
```

### Task 12: Add Telegram Stars For Telegram-Linked Users

**Files:**
- Create: `apps/web/src/lib/payments/telegram-stars.ts`
- Create: `apps/web/src/app/api/payments/telegram-stars/webhook/route.ts`
- Create: `apps/web/src/components/pricing/telegram-stars-button.tsx`
- Create: `apps/web/tests/integration/telegram-stars.test.ts`

- [ ] **Step 1: Write the failing eligibility test**

```ts
import { describe, expect, it } from "vitest";
import { canUseTelegramStars } from "@/lib/payments/telegram-stars";

describe("telegram stars", () => {
  it("requires linked telegram identity", () => {
    expect(canUseTelegramStars({ telegramId: null })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- telegram-stars`
Expected: FAIL with missing module

- [ ] **Step 3: Implement eligibility logic**

```ts
export function canUseTelegramStars(input: { telegramId: string | null }) {
  return Boolean(input.telegramId);
}
```

- [ ] **Step 4: Add webhook settlement handler**

```ts
export async function POST(req: Request) {
  const payload = await req.json();
  await settleTelegramStarsPayment(payload);
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- telegram-stars`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/payments/telegram-stars.ts apps/web/src/app/api/payments/telegram-stars
git commit -m "feat(payments): add telegram stars for linked users"
```

### Task 13: Turn The Web App Into A PWA

**Files:**
- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icons/icon-192.png`
- Create: `apps/web/public/icons/icon-512.png`
- Create: `apps/web/src/sw.ts`
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/tests/integration/pwa-manifest.test.ts`

- [ ] **Step 1: Write the failing manifest test**

```ts
import { describe, expect, it } from "vitest";
import manifest from "../../public/manifest.webmanifest";

describe("pwa manifest", () => {
  it("is installable", () => {
    expect(manifest.display).toBe("standalone");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- pwa-manifest`
Expected: FAIL with missing manifest

- [ ] **Step 3: Add manifest**

```json
{
  "name": "Web Video Compressor",
  "short_name": "Compressor",
  "display": "standalone",
  "start_url": "/",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Add offline strategy**

```ts
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  );
});
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- pwa-manifest`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/public/manifest.webmanifest apps/web/src/sw.ts apps/web/next.config.ts
git commit -m "feat(pwa): make the app installable on ios and modern browsers"
```

### Task 14: Add User Dashboard UX And History

**Files:**
- Create: `apps/web/src/components/dashboard/storage-progress.tsx`
- Create: `apps/web/src/components/dashboard/subscription-summary.tsx`
- Create: `apps/web/src/components/dashboard/payment-history.tsx`
- Create: `apps/web/tests/ui/dashboard.test.tsx`

- [ ] **Step 1: Write the failing dashboard UI test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StorageProgress } from "@/components/dashboard/storage-progress";

describe("storage progress", () => {
  it("shows used and total storage", () => {
    render(<StorageProgress usedMb={250} totalMb={500} />);
    expect(screen.getByText(/250/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- dashboard`
Expected: FAIL with missing component

- [ ] **Step 3: Implement dashboard component**

```tsx
export function StorageProgress({ usedMb, totalMb }: { usedMb: number; totalMb: number }) {
  const percent = Math.min(100, Math.round((usedMb / totalMb) * 100));
  return <div aria-label={`Storage ${percent}%`}>{usedMb} / {totalMb} MB</div>;
}
```

- [ ] **Step 4: Render payment history and package summary**

```tsx
<SubscriptionSummary planName={plan.name} expiresAt={subscription.endsAt} />
<PaymentHistory items={payments} />
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- dashboard`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/dashboard apps/web/tests/ui/dashboard.test.tsx
git commit -m "feat(ui): add dashboard quota and payment history widgets"
```

### Task 15: Secure Webhooks, Admin, And Background Services

**Files:**
- Create: `apps/web/src/lib/security.ts`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/tests/integration/webhook-signature.test.ts`
- Modify: `apps/web/src/app/api/payments/*`
- Modify: `apps/web/src/app/api/telegram/*`

- [ ] **Step 1: Write the failing webhook signature test**

```ts
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/lib/security";

describe("webhook signature", () => {
  it("rejects invalid signature", () => {
    expect(verifyWebhookSignature("bad", "payload", "secret")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /workspace/apps/web && npm test -- webhook-signature`
Expected: FAIL with missing security helper

- [ ] **Step 3: Implement security helper**

```ts
import crypto from "node:crypto";

export function verifyWebhookSignature(signature: string, payload: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

- [ ] **Step 4: Apply auth/role checks to admin routes**

```ts
if (session.user.role !== "admin") {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

- [ ] **Step 5: Run tests**

Run: `cd /workspace/apps/web && npm test -- webhook-signature`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/security.ts apps/web/middleware.ts apps/web/tests/integration/webhook-signature.test.ts
git commit -m "feat(security): secure payment and telegram webhooks"
```

### Task 16: Deployment, Local Infra, And Cutover

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `README.md`
- Modify: `bot.py`

- [ ] **Step 1: Add local infrastructure compose file**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: compressor
      POSTGRES_USER: compressor
      POSTGRES_PASSWORD: compressor
    ports:
      - "5432:5432"
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: miniostorage
    ports:
      - "9000:9000"
      - "9001:9001"
```

- [ ] **Step 2: Add environment example**

```env
DATABASE_URL="postgresql://compressor:compressor@localhost:5432/compressor"
REDIS_URL="redis://localhost:6379"
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="videos"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-me"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EMAIL_SERVER=""
EMAIL_FROM=""
TELEGRAM_BOT_TOKEN=""
ZARINPAL_MERCHANT_ID=""
AGHAPAY_API_KEY=""
```

- [ ] **Step 3: Archive legacy bot entrypoint**

```python
raise SystemExit(
    "Legacy Telegram bot has been superseded by the web app. Run apps/web instead."
)
```

- [ ] **Step 4: Validate production build**

Run: `cd /workspace/apps/web && npm run build`
Expected: PASS with generated Next.js production output

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml .env.example README.md bot.py
git commit -m "chore(deploy): add local infra and deprecate legacy bot"
```

## Acceptance Checklist

- [ ] Guest users can upload a single video up to `100 MB`
- [ ] Email signup/login works
- [ ] Google login works
- [ ] Telegram account linking/login works
- [ ] Logged-in users receive a free `500 MB` quota
- [ ] Paid plans support `storageMb`, `videoLimit`, and `durationDays`
- [ ] Quota consumption blocks further usage when any factor is exhausted
- [ ] Users can see quota, videos, subscription, and payment history in dashboard
- [ ] Zarinpal payments activate subscriptions
- [ ] AghaPay payments activate subscriptions
- [ ] Card-to-card receipt upload enters manual approval queue
- [ ] Admin can approve or reject manual receipts
- [ ] Telegram-linked users can pay with Telegram Stars
- [ ] Uploaded videos are stored safely and processed asynchronously
- [ ] PWA installs on Android and iPhone browsers with proper manifest/icons
- [ ] Background jobs and webhooks are authenticated and auditable

## Risks And Notes

- iPhone PWA support is installable but not equivalent to native iOS apps; background uploads and large file handling must be tested on real Safari devices.
- Telegram login and Telegram Stars both require Telegram bot/webhook flows and product-policy verification; keep them isolated in integration modules.
- Card-to-card approval is an operational workflow, not just a technical feature; admin audit logs are mandatory.
- Video compression must run in a worker service, not inside the web request lifecycle.
- For large uploads, prefer pre-signed multipart upload flow in a follow-up optimization task if direct server upload becomes a bottleneck.

## Recommended Execution Order

1. Complete Tasks 1-4 to make the product web-capable.
2. Complete Tasks 5-8 to make uploads, dashboard, and plans usable.
3. Complete Tasks 9-12 to add payment channels.
4. Complete Tasks 13-16 to ship as PWA with secure deployment and legacy cutover.

Plan complete and saved to `docs/superpowers/plans/2026-09-18-web-video-compressor-saas.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
