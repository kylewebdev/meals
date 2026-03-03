import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? '';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_client) {
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 credentials are not configured');
    }
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }
  return _client;
}

export async function deleteR2Object(publicUrl: string): Promise<void> {
  if (!R2_PUBLIC_URL || !publicUrl.startsWith(R2_PUBLIC_URL)) return;
  const key = publicUrl.slice(R2_PUBLIC_URL.length + 1);
  await getR2Client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
