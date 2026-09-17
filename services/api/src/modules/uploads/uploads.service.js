import { randomUUID } from 'node:crypto';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { AppError, ForbiddenError } from '../../errors/AppError.js';
import { PUBLIC_BUCKETS } from './uploads.validation.js';

// §7.4: who may write to which logical bucket.
const BUCKET_ROLES = {
  avatars: ['customer', 'merchant', 'admin'],
  'shop-images': ['merchant', 'admin'],
  'product-images': ['merchant', 'admin'],
  'creator-images': ['admin'],
  'homepage-assets': ['admin'],
  'chat-attachments': ['customer', 'merchant', 'admin'],
  'verification-documents': ['merchant', 'admin'],
};

const PRESIGN_EXPIRES_IN = 900;

let cachedClient = null;

// §9 / .env.example: read only these exact env var names; when the required
// ones are unset the module is disabled and presign returns 503.
function readConfig() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  return {
    endpoint,
    region: process.env.S3_REGION || 'auto',
    accessKeyId,
    secretAccessKey,
    bucketPrefix: process.env.S3_BUCKET_PREFIX || 'growlocal-',
  };
}

function getClient(config) {
  if (!cachedClient) {
    cachedClient = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return cachedClient;
}

function extensionOf(filename) {
  const match = /\.([A-Za-z0-9]{1,10})$/.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : '';
}

// §7.4: presigned PUT so the browser uploads directly to object storage,
// never through the API process.
export async function presign(auth, { filename, contentType, bucket = 'avatars' }) {
  const config = readConfig();
  if (!config) {
    throw new AppError('File uploads are not configured', 503, 'UPLOADS_NOT_CONFIGURED');
  }
  if (!BUCKET_ROLES[bucket].includes(auth.type)) {
    throw new ForbiddenError(`Role '${auth.type}' may not upload to bucket '${bucket}'`);
  }

  const bucketName = `${config.bucketPrefix}${bucket}`;
  const key = `${new Date().getFullYear()}/${randomUUID()}${extensionOf(filename)}`;
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(getClient(config), command, {
    expiresIn: PRESIGN_EXPIRES_IN,
  });

  const upload = { uploadUrl, bucket, key, expiresIn: PRESIGN_EXPIRES_IN };
  if (PUBLIC_BUCKETS.includes(bucket)) {
    upload.publicUrl = `${config.endpoint.replace(/\/$/, '')}/${bucketName}/${key}`;
  }
  return upload;
}
