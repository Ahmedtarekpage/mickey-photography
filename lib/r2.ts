/**
 * Cloudflare R2 access (S3-compatible), used only on the server (API routes).
 *
 * One bucket holds everything:
 *   - `data.json`   — the whole site content (settings, categories, media URLs…)
 *   - `media/*`     — uploaded photos & videos
 *
 * Media files are uploaded straight from the browser via presigned PUT URLs
 * (so large videos don't hit the serverless request-body limit), then served
 * from the bucket's public base URL.
 *
 * Configure via env (Vercel → Settings → Environment Variables):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET, R2_PUBLIC_BASE_URL
 */
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET || "";
export const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || "").replace(
  /\/$/,
  ""
);

const DATA_KEY = "data.json";

/** True only when every required R2 env var is present. */
export function r2Configured(): boolean {
  return !!(accountId && accessKeyId && secretAccessKey && R2_BUCKET && R2_PUBLIC_BASE_URL);
}

let _client: S3Client | null = null;
function r2(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
  }
  return _client;
}

/** Read the content document. Returns null when it doesn't exist yet. */
export async function getDataJson(): Promise<string | null> {
  try {
    const res = await r2().send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: DATA_KEY })
    );
    return (await res.Body?.transformToString()) ?? null;
  } catch (e) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw e;
  }
}

/** Overwrite the content document (kept uncached so reads are always fresh). */
export async function putDataJson(json: string): Promise<void> {
  await r2().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: DATA_KEY,
      Body: json,
      ContentType: "application/json",
      CacheControl: "no-store",
    })
  );
}

/**
 * Mint a short-lived presigned PUT URL for a new media object, plus the public
 * URL the file will be reachable at once uploaded.
 */
export async function presignMediaUpload(
  contentType: string
): Promise<{ uploadUrl: string; url: string }> {
  const ext = EXT[contentType] || "bin";
  const key = `media/${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}.${ext}`;
  const uploadUrl = await getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 600 }
  );
  return { uploadUrl, url: `${R2_PUBLIC_BASE_URL}/${key}` };
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
