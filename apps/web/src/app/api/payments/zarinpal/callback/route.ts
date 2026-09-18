import { verifyZarinpalPayment } from "@/lib/payments/zarinpal";

function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  if (status !== "OK" || !authority) {
    return Response.redirect(`${getAppUrl()}/pricing?payment=failed`, 302);
  }

  await verifyZarinpalPayment(authority);

  return Response.redirect(`${getAppUrl()}/dashboard?payment=success`, 302);
}
