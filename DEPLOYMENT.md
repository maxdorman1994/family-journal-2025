# Deployment Guide - Minio + Cloudflare Only

Simple deployment guide for Family Journal with only Minio storage (no database).

## 🚀 Quick Deployment to FastHost

### 1. Environment Variables

Set these in your FastHost deployment:

```bash
# Minio Storage (your current setup)
MINIO_ENDPOINT=192.168.1.214
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=maxdorman
MINIO_SECRET_KEY=Summer07max
MINIO_BUCKET=family-journal

# App Settings
NODE_ENV=production
PING_MESSAGE=pong
```

### 2. Build Commands

```bash
# Install
npm install

# Build
npm run build

# Start
npm start
```

### 3. File Structure

```
dist/spa/          # Frontend build
server.js          # Production server
package.json       # Dependencies
```

### 4. Cloudflare Integration

For Cloudflare deployment:

- Use `dist/spa` folder for static files
- Set up Functions for API routes
- Configure R2 if you want Cloudflare storage instead

### 5. Local Testing

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Minio settings

# Start development
npm run dev

# Build for production
npm run build
npm start
```

### 6. Production Checklist

- ✅ Minio endpoint accessible from production server
- ✅ Bucket `family-journal` exists
- ✅ Environment variables set
- ✅ Build process completes
- ✅ Static files served correctly

## 📁 Files Needed for Deployment

- `package.json` - Dependencies and scripts
- `server.js` - Production server
- `dist/spa/` - Built frontend files
- `.env` - Environment variables (not committed)

## 🔧 Troubleshooting

- **Minio connection failed**: Check endpoint and credentials
- **Photos not uploading**: Verify bucket exists and permissions
- **Static files not served**: Check `dist/spa` folder exists after build
