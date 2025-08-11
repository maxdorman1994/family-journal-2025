// Client-side storage service that communicates with server via API
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class StorageService {
  // Upload a file via API
  async uploadFile(
    file: File,
    fileName: string,
    contentType?: string,
    folder: string = "journal",
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("originalName", fileName);
      formData.append("photoId", uuidv4());
      formData.append("folder", folder);

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
      };
    } catch (error) {
      console.error("Storage upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Get file URL via API
  async getFileUrl(
    fileName: string,
    expiry: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    try {
      const response = await fetch(
        `/api/storage/url/${encodeURIComponent(fileName)}?expiry=${expiry}`,
      );

      if (!response.ok) {
        throw new Error("Failed to get file URL");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error generating file URL:", error);
      throw error;
    }
  }

  // Delete a file via API
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/storage/files/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // List files via API
  async listFiles(prefix: string = ""): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/storage/files?prefix=${encodeURIComponent(prefix)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to list files");
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }

  // Upload multiple files
  async uploadFiles(
    files: File[],
    fileNames: string[],
    contentTypes?: string[],
    folder: string = "journal",
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
}

// Create default storage instance
export const storage = new StorageService();

// Utility functions for photo processing
export async function uploadPhotos(photos: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const photo of photos) {
    try {
      const result = await storage.uploadFile(
        photo,
        photo.name,
        photo.type,
        "journal",
      );
      if (result.success && result.url) {
        uploadedUrls.push(result.url);
      } else {
        console.error("Photo upload failed:", result.error);
      }
    } catch (error) {
      console.error("Photo upload error:", error);
    }
  }

  return uploadedUrls;
}

// Configuration check (client-side)
export function isStorageConfigured(): boolean {
  // This will be checked server-side via API
  return true; // Assume configured for client
}

export async function getStorageStatus(): Promise<{
  configured: boolean;
  message: string;
  endpoint?: string;
}> {
  try {
    const response = await fetch("/api/storage/status");

    if (!response.ok) {
      throw new Error("Failed to get storage status");
    }

    return await response.json();
  } catch (error) {
    return {
      configured: false,
      message: "Failed to check storage configuration",
    };
  }
}
