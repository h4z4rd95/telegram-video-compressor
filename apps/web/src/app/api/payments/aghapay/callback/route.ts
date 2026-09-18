import { normalizeAghaPayCallback } from "@/lib/payments/aghapay";

function getAppUrl(req: Request) {
  return process.env.APP_URL ?? new URL(req.url).origin;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const callback = normalizeAghaPayCallback(Object.fromEntries(url.searchParams));
  const appUrl = getAppUrl(req);

  if (callback.status === "success") {
    return Response.redirect(
      `${appUrl}/dashboard?payment=success&authority=${callback.authority}`,
      302
    );
  }

  return Response.redirect(
    `${appUrl}/pricing?payment=failed&authority=${callback.authority}`,
    302
  );
}
