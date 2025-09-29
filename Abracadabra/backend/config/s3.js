import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Yandex Object Storage configuration (S3-compatible)
export const s3Client = new S3Client({
  region: 'ru-central1', // Yandex Cloud region
  endpoint: 'https://storage.yandexcloud.net', // Yandex Object Storage endpoint
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs
});

export const BUCKET_NAME = process.env.YANDEX_BUCKET_NAME || 'domli-properties';
export const PHOTOS_PREFIX = 'property-photos/'; // Folder structure in bucket 