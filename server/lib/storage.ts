// Server-side Minio storage service
import { Client as MinioClient } from 'minio';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Minio configuration
const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  pathStyle: true, // Important for MinIO
  s3ForcePathStyle: true, // Additional path style enforcement
  signatureVersion: 'v4', // Use signature version v4
});

const MINIO_BUCKET = process.env.MINIO_BUCKET || 'wee-adventure-photos';

export class StorageService {
  private bucketName: string;

  constructor(bucketName: string = MINIO_BUCKET) {
    this.bucketName = bucketName;
  }

  // Upload a file to Minio
  async uploadFile(
    file: File | Buffer, 
    fileName: string, 
    contentType?: string,
    folder: string = 'journal'
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${folder}/${new Date().toISOString().split('T')[0]}/${uuidv4()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`;

      let buffer: Buffer;
      let size: number;
      let mimeType: string;

      if (file instanceof File) {
        // Browser File object (shouldn't happen on server, but handle anyway)
        buffer = Buffer.from(await file.arrayBuffer());
        size = file.size;
        mimeType = file.type || contentType || 'application/octet-stream';
      } else {
        // Node.js Buffer
        buffer = file;
        size = buffer.length;
        mimeType = contentType || 'application/octet-stream';
      }

      // Upload to Minio
      const result = await minio.putObject(
        this.bucketName,
        uniqueFileName,
        buffer,
        size,
        {
          'Content-Type': mimeType,
          'Content-Length': size.toString()
        }
      );

      // Generate URL for the uploaded file
      const url = await this.getFileUrl(uniqueFileName);

      return {
        success: true,
        url: url
      };
    } catch (error) {
      console.error('Minio upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Get a presigned URL for a file
  async getFileUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await minio.presignedGetObject(this.bucketName, fileName, expiry);
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw error;
    }
  }

  // Delete a file from Minio
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      await minio.removeObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // List files in a folder
  async listFiles(prefix: string = ''): Promise<string[]> {
    try {
      const files: string[] = [];
      const stream = minio.listObjects(this.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });
        
        stream.on('end', () => {
          resolve(files);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Check if bucket exists and create if not
  async ensureBucket(): Promise<boolean> {
    try {
      const exists = await minio.bucketExists(this.bucketName);
      if (!exists) {
        await minio.makeBucket(this.bucketName, 'us-east-1');
        console.log(`✅ Created Minio bucket: ${this.bucketName}`);
      }
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }

  // Get file stats
  async getFileStats(fileName: string) {
    try {
      return await minio.statObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await minio.listBuckets();
      console.log('✅ Minio connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Minio connection failed:', error);
      return false;
    }
  }
}

// Create default storage instance
export const storage = new StorageService();
