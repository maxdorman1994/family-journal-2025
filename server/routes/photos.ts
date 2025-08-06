import { RequestHandler } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for Cloudflare Images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'image/svg+xml'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif', '.svg'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, HEIC, GIF, and SVG files are allowed.'));
    }
  }
});

// Cloudflare Images configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CLOUDFLARE_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN || "";
const CLOUDFLARE_IMAGES_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

/**
 * Generate a unique filename for the uploaded photo
 */
function generatePhotoKey(originalName: string, photoId: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const extension = path.extname(originalName).toLowerCase();
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_');
  
  return `journal/${timestamp}/${photoId}_${safeName}${extension}`;
}

/**
 * Upload a single photo to Cloudflare R2
 */
export const uploadPhoto: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo file provided" });
    }

    const { originalName, photoId } = req.body;
    
    if (!originalName || !photoId) {
      return res.status(400).json({ error: "Missing required fields: originalName, photoId" });
    }

    // Check if R2 is configured
    if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
      console.warn("Cloudflare R2 not configured, using local storage simulation");
      // For development, return a placeholder URL
      const localUrl = `/api/photos/placeholder/${photoId}`;
      return res.json({ 
        url: localUrl,
        message: "Photo uploaded to local storage (R2 not configured)"
      });
    }

    const photoKey = generatePhotoKey(originalName, photoId);
    
    // Upload to Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: photoKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        originalName: originalName,
        photoId: photoId,
        uploadDate: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Construct the public URL
    const publicUrl = PUBLIC_URL_BASE 
      ? `${PUBLIC_URL_BASE}/${photoKey}`
      : `https://${BUCKET_NAME}.r2.dev/${photoKey}`;

    console.log(`Photo uploaded successfully: ${photoKey} -> ${publicUrl}`);

    res.json({ 
      url: publicUrl,
      key: photoKey,
      message: "Photo uploaded successfully"
    });

  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to upload photo" 
    });
  }
};

/**
 * Get photo by ID (for development when R2 is not configured)
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
        (R2 Storage Not Configured)
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(placeholderSvg);
};

/**
 * Middleware for handling photo uploads
 */
export const uploadPhotoMiddleware = upload.single('photo');

/**
 * List photos (for future sync functionality)
 */
export const listPhotos: RequestHandler = async (req, res) => {
  try {
    // This would typically list photos from R2 and return metadata
    // For now, return empty array
    res.json({ photos: [] });
  } catch (error) {
    console.error("List photos error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to list photos" 
    });
  }
};
