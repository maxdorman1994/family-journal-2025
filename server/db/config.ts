import pkg from 'pg';
const { Pool } = pkg;
import { Client as MinioClient } from 'minio';

// PostgreSQL configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'wee_adventure',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create PostgreSQL pool
export const db = new Pool(dbConfig);

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = await db.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = await db.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

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
