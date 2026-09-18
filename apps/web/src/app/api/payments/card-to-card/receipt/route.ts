import { validateReceiptUpload } from "@/lib/payments/card-to-card";
import { requireAuthenticatedUser } from "@/lib/security";

export async function POST(request: Request) {
  const authError = requireAuthenticatedUser(request);

  if (authError) {
    return authError;
  }

  const formData = await request.formData();
  const receipt = formData.get("receipt");

  if (!(receipt instanceof File)) {
    return Response.json({ error: "Receipt image is required." }, { status: 400 });
  }

  try {
    validateReceiptUpload({
      contentType: receipt.type || "application/octet-stream"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt is invalid.";
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({
    ok: true,
    fileName: receipt.name,
    contentType: receipt.type || "application/octet-stream"
  });
}
