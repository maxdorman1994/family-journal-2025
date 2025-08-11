// Database client - migrated from Supabase to PostgreSQL + Minio
import { database, isDatabaseConfigured, getDatabaseStatus } from "./database.js";
import { storage, isStorageConfigured, getStorageStatus } from "./storage.js";

// Re-export types for compatibility
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  weather: string;
  mood: string;
  miles_traveled: number;
  parking: string;
  dog_friendly: boolean;
  paid_activity: boolean;
  adult_tickets: string;
  child_tickets: string;
  other_tickets: string;
  pet_notes: string;
  tags: string[];
  photos: string[]; // Minio URLs
  created_at?: string;
  updated_at?: string;
}

export interface ProcessedPhoto {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  isProcessing: boolean;
  uploadProgress: number;
  cloudflareUrl?: string; // Now Minio URL
  error?: string;
}

// Main database client - compatible with Supabase interface
export const supabase = database;

console.log("🔧 Database Configuration Check:", {
  database: isDatabaseConfigured(),
  storage: isStorageConfigured(),
});

if (!isDatabaseConfigured()) {
  console.warn(
    "⚠️ Database configuration missing. Please set DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD",
  );
}

if (!isStorageConfigured()) {
  console.warn(
    "⚠️ Storage configuration missing. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY",
  );
}

/**
 * Check if database is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return isDatabaseConfigured();
}

/**
 * Get database configuration status
 */
export function getSupabaseStatus(): {
  configured: boolean;
  message: string;
  host?: string;
} {
  const dbStatus = getDatabaseStatus();
  const storageStatus = getStorageStatus();
  
  if (!dbStatus.configured || !storageStatus.configured) {
    return {
      configured: false,
      message: `Configuration missing: ${!dbStatus.configured ? 'Database' : ''} ${!storageStatus.configured ? 'Storage' : ''}`,
    };
  }

  return {
    configured: true,
    message: "Database and storage configured successfully",
    host: dbStatus.host,
  };
}
