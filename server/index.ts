import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { uploadPhoto, uploadPhotoMiddleware, getPlaceholderPhoto, listPhotos, deletePhoto } from "./routes/photos";
import { logR2Status, getR2Status } from "./utils/r2Config";

export function createServer() {
  const app = express();

  // Log R2 configuration status
  logR2Status();

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
  app.get("/api/photos/placeholder/:photoId", getPlaceholderPhoto);
  app.get("/api/photos", listPhotos);
  app.delete("/api/photos/:imageId", deletePhoto);

  // R2 configuration status
  app.get("/api/photos/status", (_req, res) => {
    const status = getR2Status();
    res.json(status);
  });

  // Serve static files from dist/spa in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist/spa'));

    // Serve index.html for all non-API routes (SPA fallback)
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/spa/index.html'));
    });
  }

  return app;
}
