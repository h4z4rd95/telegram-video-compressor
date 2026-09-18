import { requireAdminUser } from "@/lib/security";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const authError = requireAdminUser(request);

  if (authError) {
    return authError;
  }

  const { id } = await ctx.params;

  return Response.json({
    ok: true,
    paymentId: id,
    status: "rejected"
  });
}
