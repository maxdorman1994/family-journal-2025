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
 * Check if HEIC conversion is supported in this browser
 */
async function isHeicSupported(): Promise<boolean> {
  try {
    // Try a minimal test to see if heic2any is working
    await heic2any({
      blob: new Blob(['test'], { type: 'image/heic' }),
      toType: 'image/jpeg'
    });
    return true;
  } catch (error) {
    console.warn('HEIC conversion not supported in this browser:', error);
    return false;
  }
}

/**
 * Convert HEIC file to JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log(`Starting HEIC conversion for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Check if HEIC is supported first
    const supported = await isHeicSupported();
    if (!supported) {
      throw new Error('HEIC conversion not supported in this browser. Browser lacks HEIF decoder support.');
    }

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob;

    const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    console.log(`HEIC conversion successful: ${file.name} -> ${convertedFile.name}`);
    return convertedFile;
  } catch (error) {
    console.error('HEIC conversion failed for:', file.name);
    console.error('Error details:', error);

    // Extract more detailed error information
    let errorMessage = 'Unknown HEIC conversion error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      if ('code' in error && 'message' in error) {
        errorMessage = `${error.message} (code: ${error.code})`;
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else {
      errorMessage = String(error);
    }

    console.error('Detailed error:', errorMessage);

    // Provide specific error messages based on common issues
    if (errorMessage.includes('ERR_LIBHEIF') || errorMessage.includes('format not supported')) {
      throw new Error(`Browser doesn't support HEIC format. Please convert to JPEG first or use a different browser.`);
    } else if (errorMessage.includes('not supported in this browser')) {
      throw new Error(`HEIC conversion not available in this browser. Please convert to JPEG first.`);
    } else {
      throw new Error(`HEIC conversion failed: ${errorMessage}. Try converting to JPEG first.`);
    }
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
    console.log(`Starting compression for: ${file.name} (${file.type})`);

    const compressedFile = await imageCompression(file, compressionOptions);

    // Create a new file with a compressed suffix for clarity
    const newName = file.name.replace(/(\.[^.]+)$/, '_compressed$1');

    const result = new File([compressedFile], newName, {
      type: compressedFile.type,
      lastModified: Date.now()
    });

    console.log(`Compression successful: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) -> ${result.name} (${(result.size / 1024 / 1024).toFixed(2)}MB)`);
    return result;
  } catch (error) {
    console.error('Image compression failed for:', file.name);
    console.error('Compression error details:', error);

    // Extract meaningful error information
    let errorMessage = 'Unknown compression error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error instanceof Event) {
      errorMessage = 'Browser event error during compression';
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }

    console.error('Detailed compression error:', errorMessage);
    throw new Error(`Failed to compress image: ${file.name}. Error: ${errorMessage}`);
  }
}

/**
 * Process a single photo: convert HEIC if needed, compress, and create preview
 */
export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  const id = uuidv4();
  let processedFile = file;
  let conversionAttempted = false;
  let compressionAttempted = false;
  const warnings: string[] = [];

  try {
    // Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      console.log(`Attempting HEIC conversion for: ${file.name}`);
      conversionAttempted = true;

      try {
        processedFile = await convertHeicToJpeg(file);
        console.log(`HEIC conversion successful for: ${file.name}`);
      } catch (heicError) {
        console.warn(`HEIC conversion failed for ${file.name}:`, heicError);
        warnings.push('HEIC conversion failed - uploading original file');

        // Keep the original file but change the name for clarity
        processedFile = new File([file], file.name.replace(/\.heic$/i, '.heic'), {
          type: file.type,
          lastModified: file.lastModified
        });
      }
    }

    // Try to compress the image
    console.log(`Attempting compression for: ${processedFile.name}`);
    compressionAttempted = true;

    try {
      const compressedFile = await compressImage(processedFile);
      processedFile = compressedFile;
      console.log(`Compression successful for: ${file.name}`);
    } catch (compressionError) {
      console.warn(`Compression failed for ${processedFile.name}:`, compressionError);
      warnings.push('Compression failed - using original size');
      // Keep the uncompressed file
    }

    // Create preview URL
    let preview: string;
    try {
      preview = URL.createObjectURL(processedFile);
    } catch (previewError) {
      console.warn('Failed to create preview, using placeholder');
      preview = '/placeholder.svg';
      warnings.push('Preview generation failed');
    }

    console.log(`Photo processing completed: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) -> ${processedFile.name} (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`);

    return {
      id,
      file: processedFile,
      originalFile: file,
      preview,
      isProcessing: false,
      uploadProgress: 0,
      error: warnings.length > 0 ? warnings.join('; ') : undefined
    };
  } catch (error) {
    console.error('Photo processing failed completely:', error);

    // Ultimate fallback: return the original file with detailed error
    let fallbackPreview = '/placeholder.svg';
    try {
      fallbackPreview = URL.createObjectURL(file);
    } catch (previewError) {
      console.warn('Even fallback preview failed');
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      id,
      file,
      originalFile: file,
      preview: fallbackPreview,
      isProcessing: false,
      uploadProgress: 0,
      error: `Processing failed: ${errorMessage}. Uploading original file.`
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
export function validatePhotoFile(file: File): { valid: boolean; error?: string; warning?: string } {
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

  // Add warning for HEIC files
  if (file.type === 'image/heic' || fileExtension === '.heic') {
    return {
      valid: true,
      warning: 'HEIC file detected. If conversion fails, consider converting to JPEG first.'
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
