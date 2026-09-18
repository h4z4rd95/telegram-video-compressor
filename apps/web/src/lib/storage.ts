type StorageBody = ArrayBuffer | Buffer | string | Uint8Array;

type PutObjectParams = {
  key: string;
  body: StorageBody;
  contentType: string;
};

type PutObjectResult = {
  bucket: string;
  key: string;
  url: string;
};

type S3AdapterConfig = {
  endpoint?: string;
  bucket?: string;
  forcePathStyle?: boolean;
};

function normalizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() ?? fileName;

  return baseName.trim().replace(/\s+/g, "-").toLowerCase();
}

export function buildStorageKey(userId: string, jobId: string, fileName: string): string {
  return `users/${userId}/jobs/${jobId}/source-${normalizeFileName(fileName)}`;
}

function buildObjectUrl(endpoint: string, bucket: string, key: string, forcePathStyle: boolean): string {
  const url = new URL(endpoint);
  const normalizedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  if (forcePathStyle) {
    url.pathname = `/${bucket}/${normalizedKey}`;
    return url.toString();
  }

  url.hostname = `${bucket}.${url.hostname}`;
  url.pathname = `/${normalizedKey}`;
  return url.toString();
}

function normalizeBody(body: StorageBody): BodyInit {
  if (typeof body === "string") {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return new Blob([Uint8Array.from(body).buffer]);
  }

  if (body instanceof ArrayBuffer) {
    return new Blob([body]);
  }

  return new Blob([Uint8Array.from(body).buffer]);
}

export function createS3Adapter(config: S3AdapterConfig = {}) {
  return {
    async putObject(params: PutObjectParams): Promise<PutObjectResult> {
      const endpoint = config.endpoint ?? process.env.S3_ENDPOINT;
      const bucket = config.bucket ?? process.env.S3_BUCKET;

      if (!endpoint || !bucket) {
        throw new Error("Missing S3 storage configuration.");
      }

      const url = buildObjectUrl(endpoint, bucket, params.key, config.forcePathStyle ?? true);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "content-type": params.contentType
        },
        body: normalizeBody(params.body)
      });

      if (!response.ok) {
        throw new Error(`S3 putObject failed with status ${response.status}.`);
      }

      return {
        bucket,
        key: params.key,
        url
      };
    }
  };
}

const s3 = createS3Adapter();

export async function putObject(params: PutObjectParams): Promise<PutObjectResult> {
  return s3.putObject(params);
}
