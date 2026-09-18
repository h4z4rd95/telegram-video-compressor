import { assertUploadAllowed } from "@/lib/quotas";

function bytesToMb(size: number) {
  return size / (1024 * 1024);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "File is required." }, { status: 400 });
  }

  const userType = request.headers.get("x-user-type");
  const remainingStorageHeader = request.headers.get("x-remaining-storage-mb");
  const remainingStorageMb = remainingStorageHeader ? Number(remainingStorageHeader) : undefined;

  try {
    assertUploadAllowed({
      isGuest: userType !== "registered",
      sizeMb: bytesToMb(file.size),
      remainingStorageMb: Number.isFinite(remainingStorageMb) ? remainingStorageMb : undefined
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload is not allowed.";
    return Response.json({ error: message }, { status: 413 });
  }

  return Response.json({
    ok: true,
    fileName: file.name,
    sizeBytes: file.size,
    contentType: file.type || "application/octet-stream"
  });
}
