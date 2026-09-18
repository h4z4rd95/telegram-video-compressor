export type ReceiptUploadInput = {
  contentType: string;
};

export function validateReceiptUpload(input: ReceiptUploadInput) {
  if (!input.contentType.startsWith("image/")) {
    throw new Error("Receipt must be an image.");
  }
}
