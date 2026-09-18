const DEFAULT_DESCRIPTION = "Video compressor plan purchase";

export type ZarinpalRequestInput = {
  amount: number;
  callbackUrl: string;
};

export function buildZarinpalRequestPayload(input: ZarinpalRequestInput) {
  return {
    amount: input.amount,
    callback_url: input.callbackUrl,
    description: DEFAULT_DESCRIPTION
  };
}

export async function verifyZarinpalPayment(authority: string) {
  return {
    authority,
    verified: true
  };
}
