import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo.js";
import {
  uploadPhoto,
  uploadPhotoMiddleware,
  getPlaceholderPhoto,
  listPhotos,
  deletePhoto,
} from "./routes/photos.js";
import { testMinioConnection, initializeMinio } from "./config/simple.js";

// Fix for serverless environments
let __dirname: string;
try {
  __dirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  __dirname = process.cwd();
}

export async function createServer() {
  const app = express();

  // Initialize Minio storage
  try {
    await initializeMinio();
    console.log('✅ Minio storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Minio storage:', error);
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Photo upload routes
  app.post("/api/photos/upload", uploadPhotoMiddleware, uploadPhoto);
  app.get("/api/photos/placeholder/:photoId", getPlaceholderPhoto);
  app.get("/api/photos", listPhotos);
  app.delete("/api/photos/:imageId", deletePhoto);

  // Storage status endpoint
  app.get("/api/storage/status", async (_req, res) => {
    const storageConnected = await testMinioConnection();
    res.json({
      configured: storageConnected,
      message: storageConnected ? "Minio storage connected successfully" : "Minio storage connection failed",
      endpoint: process.env.MINIO_ENDPOINT,
    });
  });

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    const storageConnected = await testMinioConnection();
    
    res.json({
      status: storageConnected ? 'healthy' : 'partial',
      storage: storageConnected,
      timestamp: new Date().toISOString()
    });
  });

  // Serve static files from dist/spa (production mode)
  const distPath = path.join(__dirname, "../dist/spa");
  console.log("🔧 Server Environment Check:", {
    NODE_ENV: process.env.NODE_ENV,
    distExists: fs.existsSync(distPath),
    distPath: distPath,
    cwd: process.cwd(),
    dirname: __dirname,
  });

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
