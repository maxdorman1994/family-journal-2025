// Minio storage service to replace Cloudflare R2
import { v4 as uuidv4 } from 'uuid';

// Note: These will be set via API calls since client can't import server modules directly
let minio: any = null;
let MINIO_BUCKET = process.env.MINIO_BUCKET || 'wee-adventure-photos';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

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
        // Browser File object
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

  // Upload multiple files
  async uploadFiles(
    files: (File | Buffer)[], 
    fileNames: string[], 
    contentTypes?: string[],
    folder: string = 'journal'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = fileNames[i];
      const contentType = contentTypes?.[i];
      
      const result = await this.uploadFile(file, fileName, contentType, folder);
      results.push(result);
    }
    
    return results;
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
}

// Create default storage instance
export const storage = new StorageService();

// Utility functions for photo processing (replacing Cloudflare R2 logic)
export async function uploadPhotos(photos: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const photo of photos) {
    try {
      const result = await storage.uploadFile(photo, photo.name, photo.type, 'journal');
      if (result.success && result.url) {
        uploadedUrls.push(result.url);
      } else {
        console.error('Photo upload failed:', result.error);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
    }
  }
  
  return uploadedUrls;
}

// Configuration check
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.MINIO_ENDPOINT && 
    process.env.MINIO_ACCESS_KEY && 
    process.env.MINIO_SECRET_KEY
  );
}

export function getStorageStatus(): {
  configured: boolean;
  message: string;
  endpoint?: string;
} {
  if (!isStorageConfigured()) {
    return {
      configured: false,
      message: "Minio storage not configured. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.",
    };
  }

  return {
    configured: true,
    message: "Minio storage configured successfully",
    endpoint: process.env.MINIO_ENDPOINT,
  };
}
