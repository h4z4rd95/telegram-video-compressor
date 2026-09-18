import { buildZarinpalRequestPayload } from "@/lib/payments/zarinpal";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    amount?: number;
    callbackUrl?: string;
  };

  if (!body.amount || !body.callbackUrl) {
    return Response.json(
      {
        error: "Amount and callbackUrl are required."
      },
      { status: 400 }
    );
  }

  return Response.json({
    ok: true,
    payload: buildZarinpalRequestPayload({
      amount: body.amount,
      callbackUrl: body.callbackUrl
    })
  });
}
