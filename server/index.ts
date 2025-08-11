import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import {
  uploadPhoto,
  uploadPhotoMiddleware,
  getPlaceholderPhoto,
  listPhotos,
  deletePhoto,
  uploadMultiplePhotos,
  uploadMultiplePhotosMiddleware,
} from "./routes/photos";
import { executeQuery, executeRPC } from "./routes/database.js";
import { getStorageStatus, uploadFile, listFiles, deleteFile, getFileUrl } from "./routes/storage.js";
import { initializeDatabase, testDatabaseConnection } from "./db/init.js";
import { storage } from "./lib/storage.js";

// Fix for serverless environments where import.meta.url might be undefined
let __dirname: string;
try {
  __dirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  __dirname = process.cwd();
}

export async function createServer() {
  const app = express();

  // Initialize database and storage
  try {
    await initializeDatabase();
    console.log('✅ Database and storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database and storage:', error);
    // Continue anyway for development
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Photo upload routes
  app.post("/api/photos/upload", uploadPhotoMiddleware, uploadPhoto);
  app.post("/api/photos/upload-multiple", uploadMultiplePhotosMiddleware, uploadMultiplePhotos);
  app.get("/api/photos/placeholder/:photoId", getPlaceholderPhoto);
  app.get("/api/photos", listPhotos);
  app.delete("/api/photos/:imageId", deletePhoto);

  // Database API routes
  app.post("/api/database/query", executeQuery);
  app.post("/api/database/rpc", executeRPC);

  // Storage API routes
  app.get("/api/storage/files", listFiles);
  app.delete("/api/storage/files/:fileName", deleteFile);
  app.get("/api/storage/url/:fileName", getFileUrl);

  // Database and storage status endpoints
  app.get("/api/database/status", async (_req, res) => {
    const dbConnected = await testDatabaseConnection();
    res.json({
      configured: dbConnected,
      message: dbConnected ? "Database configured successfully" : "Database connection failed",
    });
  });

  app.get("/api/storage/status", async (_req, res) => {
    const storageConnected = await storage.testConnection();
    res.json({
      configured: storageConnected,
      message: storageConnected ? "Storage configured successfully" : "Storage connection failed",
      endpoint: process.env.MINIO_ENDPOINT,
    });
  });

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    const dbConnected = await testDatabaseConnection();
    const storageConnected = await storage.testConnection();

    res.json({
      status: dbConnected && storageConnected ? 'healthy' : 'partial',
      database: dbConnected,
      storage: storageConnected,
      timestamp: new Date().toISOString()
    });
  });

  // Log environment info
  const distPath = path.join(__dirname, "../dist/spa");
  console.log("🔧 Server Environment Check:", {
    NODE_ENV: process.env.NODE_ENV,
    distExists: fs.existsSync(distPath),
    distPath: distPath,
    cwd: process.cwd(),
    dirname: __dirname,
  });

  // Serve static files from dist/spa (force for all non-dev environments)
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasDistFolder = fs.existsSync(distPath);

  if (!isDevelopment && hasDistFolder) {
    console.log("✅ Serving static files from:", distPath);
    app.use(express.static(distPath));

    // Serve index.html for all non-API routes (SPA fallback)
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log("📄 Serving SPA fallback:", indexPath);
      res.sendFile(indexPath);
    });
  } else {
    console.log(
      "⚠️ Not serving static files - development mode or no dist folder",
    );
    console.log("📁 Checked path:", distPath);
    console.log("📁 Directory exists:", hasDistFolder);
  }

  return app;
}
