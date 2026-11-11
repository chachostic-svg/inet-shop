import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const RECEIPT_BUCKET = process.env.NEON_STORAGE_BUCKET || "assets";

const s3 = new S3Client({ forcePathStyle: true });

export async function readReceiptFile(file) {
  if (!file || typeof file.size !== "number" || file.size === 0) {
    return { error: "receipt_required" };
  }
  if (file.size > MAX_BYTES) return { error: "receipt_large" };
  const ext = TYPES[file.type];
  if (!ext) return { error: "receipt_type" };
  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, ext, type: file.type };
}

export function receiptKey(orderId, ext) {
  return `receipts/${orderId}.${ext}`;
}

export function normalizeReceiptKey(value) {
  if (!value || typeof value !== "string") return null;
  const key = value.startsWith("receipts/") ? value : `receipts/${value}`;
  if (key.includes("..") || key.includes("\\")) return null;
  return key;
}

export async function saveReceiptFile(orderId, buffer, ext) {
  const key = receiptKey(orderId, ext);
  await s3.send(
    new PutObjectCommand({
      Bucket: RECEIPT_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: CONTENT_TYPES[ext] || "application/octet-stream",
      CacheControl: "private, max-age=3600",
    })
  );
  return key;
}

export async function getReceiptObject(receiptImage) {
  const key = normalizeReceiptKey(receiptImage);
  if (!key) return null;
  try {
    return await s3.send(new GetObjectCommand({ Bucket: RECEIPT_BUCKET, Key: key }));
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NoSuchKey") return null;
    throw error;
  }
}
