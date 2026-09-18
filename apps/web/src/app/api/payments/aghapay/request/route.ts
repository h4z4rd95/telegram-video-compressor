import { buildAghaPayRequestPayload } from "@/lib/payments/aghapay";

type RequestBody = {
  amount?: number;
  callbackUrl?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;

  if (typeof body.amount !== "number" || !body.callbackUrl) {
    return Response.json(
      { error: "Amount and callbackUrl are required." },
      { status: 400 }
    );
  }

  return Response.json({
    payload: buildAghaPayRequestPayload({
      amount: body.amount,
      callbackUrl: body.callbackUrl
    })
  });
}
