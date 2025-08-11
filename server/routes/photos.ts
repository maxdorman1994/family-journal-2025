import { RequestHandler } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { storage } from "../lib/storage.js";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for Minio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/heic",
      "image/heif",
    ];
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".svg",
      ".bmp",
      ".tiff",
      ".heic",
      ".heif",
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only image files are allowed (JPEG, PNG, WebP, GIF, SVG, BMP, TIFF, HEIC, HEIF).",
        ),
      );
    }
  },
});

/**
 * Generate a unique filename for the uploaded photo
 */
function generatePhotoFileName(originalName: string, photoId: string): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();

  const fileExtension = path.extname(safeName) || '.jpg';
  const nameWithoutExt = path.basename(safeName, fileExtension);

  return `${timestamp}/${photoId}_${nameWithoutExt}${fileExtension}`;
}

/**
 * Upload a single photo to Minio storage
 */
export const uploadPhoto: RequestHandler = async (req, res) => {
  try {
    console.log("📨 Photo upload request received:", {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      body: req.body,
    });

    if (!req.file) {
      console.error("❌ No photo file provided in request");
      return res.status(400).json({ error: "No photo file provided" });
    }

    const { originalName, photoId } = req.body;

    if (!originalName || !photoId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: originalName, photoId" });
    }

    // Check if Minio storage is available
    await storage.ensureBucket();

    const fileName = generatePhotoFileName(originalName, photoId);

    // Convert buffer to a format Minio can handle
    const buffer = Buffer.from(req.file.buffer);

    // Upload to Minio
    const result = await storage.uploadFile(
      buffer,
      fileName,
      req.file.mimetype,
      'journal'
    );

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log(
      `✅ Photo uploaded successfully to Minio: ${fileName} -> ${result.url}`,
    );

    res.json({
      url: result.url,
      id: photoId,
      fileName: fileName,
      message: "Photo uploaded successfully to Minio storage",
    });
  } catch (error) {
    console.error("❌ Photo upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to upload photo",
    });
  }
};

/**
 * Get photo by ID (placeholder for development)
 */
export const getPlaceholderPhoto: RequestHandler = (req, res) => {
  const { photoId } = req.params;

  // Return a placeholder SVG
  const placeholderSvg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial" font-size="14" fill="#6b7280">
        Photo: ${photoId}
        (Development Placeholder)
      </text>
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(placeholderSvg);
};

/**
 * Middleware for handling photo uploads
 */
export const uploadPhotoMiddleware = upload.single("photo");

/**
 * List photos from Minio storage (for sync functionality)
 */
export const listPhotos: RequestHandler = async (req, res) => {
  try {
    const prefix = req.query.prefix as string || 'journal/';
    const files = await storage.listFiles(prefix);

    // Get file URLs for recent photos
    const recentPhotos = files
      .slice(-100) // Get last 100 files
      .map(async (fileName) => {
        try {
          const url = await storage.getFileUrl(fileName);
          const stats = await storage.getFileStats(fileName);
          
          return {
            id: path.basename(fileName, path.extname(fileName)),
            fileName: fileName,
            url: url,
            size: stats?.size || 0,
            lastModified: stats?.lastModified || new Date(),
          };
        } catch (error) {
          console.error(`Error getting photo info for ${fileName}:`, error);
          return null;
        }
      });

    const photos = (await Promise.all(recentPhotos)).filter(Boolean);

    res.json({
      photos: photos,
      total: photos.length,
      message: "Photos retrieved successfully from Minio storage",
    });
  } catch (error) {
    console.error("❌ List photos error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list photos",
    });
  }
};

/**
 * Delete a photo from Minio storage
 */
export const deletePhoto: RequestHandler = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      return res.status(400).json({ error: "Image ID is required" });
    }

    // Find the file by searching for files containing the imageId
    const allFiles = await storage.listFiles('journal/');
    const targetFile = allFiles.find(file => file.includes(imageId));

    if (!targetFile) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const deleted = await storage.deleteFile(targetFile);

    if (!deleted) {
      throw new Error("Failed to delete photo from storage");
    }

    console.log(`✅ Photo deleted successfully: ${targetFile}`);

    res.json({
      message: "Photo deleted successfully",
      imageId,
      fileName: targetFile,
    });
  } catch (error) {
    console.error("❌ Delete photo error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete photo",
    });
  }
};

/**
 * Upload multiple photos at once
 */
export const uploadMultiplePhotos: RequestHandler = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: "No photo files provided" });
    }

    const files = req.files as Express.Multer.File[];
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length !== files.length) {
      return res.status(400).json({ 
        error: "photoIds array must match the number of uploaded files" 
      });
    }

    await storage.ensureBucket();

    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = photoIds[i];
      
      try {
        const fileName = generatePhotoFileName(file.originalname, photoId);
        const buffer = Buffer.from(file.buffer);

        const result = await storage.uploadFile(
          buffer,
          fileName,
          file.mimetype,
          'journal'
        );

        uploadResults.push({
          photoId,
          success: result.success,
          url: result.url,
          fileName: fileName,
          error: result.error,
        });
      } catch (error) {
        uploadResults.push({
          photoId,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;

    res.json({
      results: uploadResults,
      successCount,
      totalCount: files.length,
      message: `${successCount}/${files.length} photos uploaded successfully`,
    });
  } catch (error) {
    console.error("❌ Multiple photo upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to upload photos",
    });
  }
};

// Configure multer for multiple file uploads
export const uploadMultiplePhotosMiddleware = upload.array("photos", 20); // Max 20 photos
