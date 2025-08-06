import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedPhoto {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  isProcessing: boolean;
  uploadProgress: number;
  cloudflareUrl?: string;
  error?: string;
}

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1, // Compress to max 1MB
  maxWidthOrHeight: 1920, // Max dimension 1920px
  useWebWorker: true,
  quality: 0.8 // 80% quality
};

/**
 * Convert HEIC file to JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob;

    return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error(`Failed to convert HEIC image: ${file.name}`);
  }
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File, 
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const compressionOptions = { ...defaultCompressionOptions, ...options };
  
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Create a new file with a compressed suffix for clarity
    const newName = file.name.replace(/(\.[^.]+)$/, '_compressed$1');
    
    return new File([compressedFile], newName, {
      type: compressedFile.type,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error(`Failed to compress image: ${file.name}`);
  }
}

/**
 * Process a single photo: convert HEIC if needed, compress, and create preview
 */
export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  const id = uuidv4();
  let processedFile = file;
  
  try {
    // Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      console.log(`Converting HEIC file: ${file.name}`);
      processedFile = await convertHeicToJpeg(file);
    }

    // Compress the image
    console.log(`Compressing image: ${processedFile.name}`);
    const compressedFile = await compressImage(processedFile);

    // Create preview URL
    const preview = URL.createObjectURL(compressedFile);

    console.log(`Photo processed: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) -> ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);

    return {
      id,
      file: compressedFile,
      originalFile: file,
      preview,
      isProcessing: false,
      uploadProgress: 0
    };
  } catch (error) {
    console.error('Photo processing failed:', error);
    return {
      id,
      file,
      originalFile: file,
      preview: URL.createObjectURL(file),
      isProcessing: false,
      uploadProgress: 0,
      error: error instanceof Error ? error.message : 'Unknown processing error'
    };
  }
}

/**
 * Process multiple photos
 */
export async function processPhotos(files: File[]): Promise<ProcessedPhoto[]> {
  const processedPhotos: ProcessedPhoto[] = [];
  
  for (const file of files) {
    try {
      const processed = await processPhoto(file);
      processedPhotos.push(processed);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Add failed photo with error state
      processedPhotos.push({
        id: uuidv4(),
        file,
        originalFile: file,
        preview: URL.createObjectURL(file),
        isProcessing: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Processing failed'
      });
    }
  }
  
  return processedPhotos;
}

/**
 * Upload photo to Cloudflare Images via our API
 */
export async function uploadPhotoToCloudflare(
  photo: ProcessedPhoto,
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', photo.file);
  formData.append('originalName', photo.originalFile.name);
  formData.append('photoId', photo.id);

  try {
    // Create XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', '/api/photos/upload');
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Photo upload failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Upload failed');
  }
}

/**
 * Validate file type and size for Cloudflare Images
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB limit for Cloudflare Images
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/gif',
    'image/svg+xml'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif', '.svg'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Cloudflare Images supports up to ${maxSize / 1024 / 1024}MB`
    };
  }

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please use JPEG, PNG, WebP, HEIC, GIF, or SVG images'
    };
  }

  return { valid: true };
}

/**
 * Cleanup preview URLs to prevent memory leaks
 */
export function cleanupPreviewUrls(photos: ProcessedPhoto[]) {
  photos.forEach(photo => {
    if (photo.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photo.preview);
    }
  });
}
