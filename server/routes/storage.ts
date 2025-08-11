import { RequestHandler } from "express";
import { storage } from "../../client/lib/storage.js";

/**
 * Get storage status
 */
export const getStorageStatus: RequestHandler = async (req, res) => {
  try {
    const configured = Boolean(
      process.env.MINIO_ENDPOINT && 
      process.env.MINIO_ACCESS_KEY && 
      process.env.MINIO_SECRET_KEY
    );

    if (!configured) {
      return res.json({
        configured: false,
        message: "Minio storage not configured. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.",
      });
    }

    return res.json({
      configured: true,
      message: "Minio storage configured successfully",
      endpoint: process.env.MINIO_ENDPOINT,
    });
  } catch (error) {
    console.error("Storage status error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get storage status",
    });
  }
};

/**
 * Upload file via API
 */
export const uploadFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { folder = 'uploads' } = req.body;
    
    const result = await storage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.json(result);
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to upload file",
    });
  }
};

/**
 * List files in storage
 */
export const listFiles: RequestHandler = async (req, res) => {
  try {
    const { prefix = '' } = req.query;
    const files = await storage.listFiles(prefix as string);
    
    res.json({
      files,
      count: files.length,
    });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list files",
    });
  }
};

/**
 * Delete file from storage
 */
export const deleteFile: RequestHandler = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const deleted = await storage.deleteFile(fileName);
    
    if (!deleted) {
      return res.status(404).json({ error: "File not found or could not be deleted" });
    }

    res.json({
      message: "File deleted successfully",
      fileName,
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete file",
    });
  }
};

/**
 * Get file URL
 */
export const getFileUrl: RequestHandler = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { expiry = '604800' } = req.query; // Default 7 days
    
    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const url = await storage.getFileUrl(fileName, parseInt(expiry as string));
    
    res.json({
      url,
      fileName,
      expiry: parseInt(expiry as string),
    });
  } catch (error) {
    console.error("Get file URL error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get file URL",
    });
  }
};
