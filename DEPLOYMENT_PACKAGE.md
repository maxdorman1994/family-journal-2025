# Family Journal 2025 - Deployment Package

## 📦 Files to Upload to GitHub

### Core Application Files
```
package.json                    # Dependencies and scripts
server.js                      # Production server (from build)
.env.example                   # Environment template
DEPLOYMENT.md                  # This deployment guide

# Frontend (client/)
client/App.tsx                 # Main React app
client/pages/                  # All page components
client/components/             # UI components
client/lib/                    # Services and utilities
client/global.css              # Styles

# Backend (server/)
server/routes/                 # API routes
server/config/simple.ts        # Minio configuration
server/simple-server.ts        # Simplified server
server/lib/storage.ts          # Storage service

# Configuration
vite.config.ts                 # Build configuration
tailwind.config.ts             # Styling configuration
tsconfig.json                  # TypeScript config
```

### Environment Variables for FastHost
```bash
MINIO_ENDPOINT=192.168.1.214
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=maxdorman
MINIO_SECRET_KEY=Summer07max
MINIO_BUCKET=family-journal
NODE_ENV=production
```

### FastHost Deploy Commands
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

## 🎯 What This Setup Gives You
- ✅ Photo uploads to your Minio server
- ✅ Simple file-based storage (no database)
- ✅ Fast deployment to FastHost
- ✅ Cloudflare compatible
- ✅ All your custom Minio configuration

## 📱 Features Available
- Photo uploads to Minio
- Journal entries (stored locally)
- Adventure tracking
- Family photo sharing
- Scottish location features

All data will be stored in your Minio bucket: `family-journal`
