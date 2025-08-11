# Migration Guide: Supabase → PostgreSQL + Minio

This guide explains how to migrate from Supabase to a self-hosted PostgreSQL database with Minio object storage.

## 🚀 Quick Start

### 1. Start Local Development Environment

```bash
# Start PostgreSQL and Minio with Docker
npm run docker:dev

# Initialize database schema
npm run db:init

# Start the development server
npm run dev
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# PostgreSQL Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wee_adventure
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Minio Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=wee-adventure-photos
```

## 🔄 What Changed

### Database Migration
- **Before**: Supabase (hosted PostgreSQL)
- **After**: Self-hosted PostgreSQL
- **Schema**: Equivalent tables and functions migrated
- **API**: Compatible interface maintained

### Storage Migration
- **Before**: Cloudflare R2
- **After**: Minio (S3-compatible)
- **Files**: Photos and assets
- **URLs**: Now served via Minio presigned URLs

### Service Layer
- **Before**: `@supabase/supabase-js` client
- **After**: Custom database client with compatible API
- **RPC**: Stored procedures maintained
- **Real-time**: Manual polling (can be upgraded to PostgreSQL LISTEN/NOTIFY)

## 📁 Database Schema

The database includes these main tables:

### Core Tables
- `journal_entries` - Adventure journal entries
- `journal_comments` - Comments on entries
- `journal_likes` - Entry likes/reactions

### Milestones & Progress
- `milestone_categories` - Milestone groupings
- `milestones` - Achievement definitions
- `user_milestone_progress` - User progress tracking

### Statistics
- `adventure_stats` - Tracked statistics
- `app_settings` - Application configuration

### Locations & Activities
- `castles` - Scottish castles data
- `lochs` - Scottish lochs data
- `hidden_gems` - Hidden location discoveries
- `wishlist_items` - Adventure wishlist

### Views & Functions
- `journal_entry_stats` - Comment/like aggregations
- `milestone_leaderboard` - Progress summaries
- `adventure_stats_summary` - Statistics views
- Stored procedures for milestone updates

## 🐳 Docker Services

### PostgreSQL
- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Database**: `wee_adventure`
- **Auto-initializes**: Schema loaded on startup

### Minio
- **Image**: `minio/minio:latest`
- **Ports**: 9000 (API), 9001 (Console)
- **Bucket**: `wee-adventure-photos`
- **Admin UI**: http://localhost:9001

## 🔧 Development Workflow

### Start Services
```bash
npm run docker:dev        # Start PostgreSQL + Minio
```

### Database Operations
```bash
npm run db:init           # Initialize/reset database
npm run db:reset          # Alias for db:init
```

### Stop Services
```bash
npm run docker:down       # Stop all containers
```

## 📊 Monitoring & Admin

### Database Admin
Use any PostgreSQL client:
- **Host**: localhost:5432
- **Database**: wee_adventure
- **User**: postgres
- **Password**: postgres

Recommended tools:
- pgAdmin
- DBeaver
- TablePlus
- psql CLI

### Minio Console
Access the Minio web interface:
- **URL**: http://localhost:9001
- **Username**: minioadmin
- **Password**: minioadmin

## 🚀 Production Deployment

### Database Options
1. **Self-hosted PostgreSQL**
   - Docker container
   - Dedicated server
   - Cloud VM

2. **Managed PostgreSQL**
   - AWS RDS
   - Google Cloud SQL
   - DigitalOcean Managed Database
   - Azure Database

### Storage Options
1. **Self-hosted Minio**
   - Docker container
   - Kubernetes deployment
   - Dedicated server

2. **Cloud Storage**
   - AWS S3 (Minio compatible)
   - Google Cloud Storage
   - DigitalOcean Spaces

### Environment Variables
Set production values:
```bash
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=strong-password
MINIO_ENDPOINT=your-minio-host
MINIO_ACCESS_KEY=production-key
MINIO_SECRET_KEY=production-secret
MINIO_USE_SSL=true
```

## 🔒 Security Considerations

### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups
- Update PostgreSQL regularly

### Storage Security
- Use strong access keys
- Enable SSL/TLS
- Configure proper bucket policies
- Regular access key rotation
- Monitor access logs

### Application Security
- Validate all inputs
- Use parameterized queries (already implemented)
- Sanitize file uploads
- Rate limiting for uploads
- Monitor for suspicious activity

## 📈 Performance Optimization

### Database
- Connection pooling (already configured)
- Indexes on common queries (already created)
- Query optimization
- Regular VACUUM and ANALYZE

### Storage
- CDN for photo delivery
- Image optimization
- Compression settings
- Caching policies

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs wee-adventure-db

# Test connection
psql -h localhost -U postgres -d wee_adventure
```

### Minio Connection Issues
```bash
# Check if Minio is running
docker ps | grep minio

# Check logs
docker logs wee-adventure-minio

# Test connection
curl http://localhost:9000/minio/health/live
```

### Application Errors
- Check server logs for database errors
- Verify environment variables
- Ensure database schema is initialized
- Check Minio bucket exists

## 🔄 Migration from Existing Supabase

If you have existing data in Supabase:

### 1. Export Supabase Data
```sql
-- In Supabase SQL editor, export each table
COPY journal_entries TO '/tmp/journal_entries.csv' CSV HEADER;
COPY milestones TO '/tmp/milestones.csv' CSV HEADER;
-- ... repeat for all tables
```

### 2. Import to PostgreSQL
```bash
# Copy CSV files to local PostgreSQL
psql -h localhost -U postgres -d wee_adventure -c "
  COPY journal_entries FROM '/path/to/journal_entries.csv' CSV HEADER;
"
```

### 3. Migrate Photos
- Download photos from Cloudflare R2
- Upload to Minio bucket
- Update photo URLs in database

## 🎯 Next Steps

1. **Set up monitoring** with tools like Grafana + Prometheus
2. **Implement real-time features** using PostgreSQL LISTEN/NOTIFY
3. **Add backup automation** for database and storage
4. **Set up CI/CD** for deployments
5. **Configure CDN** for global photo delivery

---

## 📞 Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review Docker logs for specific errors
3. Verify environment variable configuration
4. Ensure all dependencies are installed

The new architecture provides more control and can be deployed anywhere while maintaining full compatibility with the existing application features.
