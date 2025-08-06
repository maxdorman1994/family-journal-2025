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
 * Generate a unique ID for the uploaded photo
 */
function generatePhotoId(originalName: string, photoId: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  return `wee-adventure-${timestamp}-${photoId}-${safeName}`;
}

/**
 * Upload a single photo to Cloudflare Images
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

    // Check if Cloudflare Images is configured
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGES_TOKEN) {
      console.warn("Cloudflare Images not configured, using local storage simulation");
      // For development, return a placeholder URL
      const localUrl = `/api/photos/placeholder/${photoId}`;
      return res.json({
        url: localUrl,
        message: "Photo uploaded to local storage (Cloudflare Images not configured)"
      });
    }

    const customId = generatePhotoId(originalName, photoId);

    // Create FormData for Cloudflare Images API
    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), originalName);
    formData.append('id', customId);
    formData.append('metadata', JSON.stringify({
      originalName: originalName,
      photoId: photoId,
      uploadDate: new Date().toISOString(),
      journalApp: 'wee-adventure'
    }));

    // Upload to Cloudflare Images
    const response = await fetch(CLOUDFLARE_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.message || `Cloudflare Images API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Upload failed');
    }

    // Get the delivery URL - Cloudflare Images provides multiple variants
    const deliveryUrl = data.result.variants[0]; // Use first variant (original)

    console.log(`Photo uploaded successfully to Cloudflare Images: ${customId} -> ${deliveryUrl}`);

    res.json({
      url: deliveryUrl,
      id: customId,
      variants: data.result.variants,
      message: "Photo uploaded successfully to Cloudflare Images"
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
