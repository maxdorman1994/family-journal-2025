// Simplified configuration - Minio only, no PostgreSQL
import { Client as MinioClient } from 'minio';

// Minio configuration
export const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || '192.168.1.214',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'maxdorman',
  secretKey: process.env.MINIO_SECRET_KEY || 'Summer07max',
  pathStyle: true, // Important for MinIO
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'family-journal';

// Test Minio connection
export async function testMinioConnection() {
  try {
    await minio.listBuckets();
    console.log('✅ Minio connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Minio connection failed:', error);
    return false;
  }
}

// Initialize Minio bucket
export async function initializeMinio() {
  try {
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) {
      await minio.makeBucket(MINIO_BUCKET, 'us-east-1');
      console.log(`✅ Created Minio bucket: ${MINIO_BUCKET}`);
    } else {
      console.log(`✅ Minio bucket exists: ${MINIO_BUCKET}`);
    }
  } catch (error) {
    console.error('❌ Error initializing Minio:', error);
  }
}
