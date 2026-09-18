export type AghaPayRequestPayloadInput = {
  amount: number;
  callbackUrl: string;
};

export type AghaPayCallbackInput = {
  transid?: string;
  status?: string;
};

export type NormalizedAghaPayCallback = {
  authority: string;
  status: "success" | "failed";
};

export function buildAghaPayRequestPayload(
  input: AghaPayRequestPayloadInput
) {
  return {
    api_key: process.env.AGHAPAY_API_KEY ?? "",
    amount: input.amount,
    callback_url: input.callbackUrl,
    description: "Video compressor plan purchase"
  };
}

export function normalizeAghaPayCallback(
  input: AghaPayCallbackInput
): NormalizedAghaPayCallback {
  return {
    authority: input.transid ?? "",
    status: input.status === "1" ? "success" : "failed"
  };
}
