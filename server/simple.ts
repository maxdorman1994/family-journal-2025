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

// Fix for serverless environments
let __dirname: string;
try {
  __dirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  __dirname = process.cwd();
}

export function createSimpleServer() {
  const app = express();

  console.log("🚀 Creating simple server (Minio only)...");

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Photo upload routes (simplified)
  app.post("/api/photos/upload", uploadPhotoMiddleware, uploadPhoto);
  app.get("/api/photos/placeholder/:photoId", getPlaceholderPhoto);
  app.get("/api/photos", listPhotos);
  app.delete("/api/photos/:imageId", deletePhoto);

  // Storage status endpoint
  app.get("/api/storage/status", async (_req, res) => {
    const configured = Boolean(
      process.env.MINIO_ENDPOINT &&
        process.env.MINIO_ACCESS_KEY &&
        process.env.MINIO_SECRET_KEY,
    );

    res.json({
      configured,
      message: configured
        ? "Minio storage configured"
        : "Minio storage not configured",
      endpoint: process.env.MINIO_ENDPOINT,
    });
  });

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    res.json({
      status: "healthy",
      storage: true,
      timestamp: new Date().toISOString(),
    });
  });

  console.log("✅ Simple server created successfully");
  return app;
}
