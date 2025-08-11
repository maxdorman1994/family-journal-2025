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

  // Basic API routes (no /api prefix since Vite adds it)
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/demo", handleDemo);

  // Photo upload routes (simplified)
  app.post("/photos/upload", uploadPhotoMiddleware, uploadPhoto);
  app.get("/photos/placeholder/:photoId", getPlaceholderPhoto);
  app.get("/photos", listPhotos);
  app.delete("/photos/:imageId", deletePhoto);

  // Storage status endpoint
  app.get("/storage/status", async (_req, res) => {
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
