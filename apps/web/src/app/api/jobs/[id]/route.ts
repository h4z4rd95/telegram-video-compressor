import { db } from "@/lib/db";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = await db.videoJob.findUnique({
    where: { id }
  });

  if (!job) {
    return Response.json({ error: "Job not found." }, { status: 404 });
  }

  return Response.json(job);
}
