# A Wee Adventure - Scottish Family Journal

A production-ready full-stack React application for documenting Scottish family adventures. Recently migrated from Supabase to a self-hosted PostgreSQL + Minio architecture for greater control and flexibility.

## 🏗️ Architecture

- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server with PostgreSQL database
- **Storage**: Minio (S3-compatible) for photos and files
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd wee-adventure

# Install dependencies
npm install

# Start PostgreSQL and Minio services
npm run docker:dev

# Initialize database schema
npm run db:init

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Environment Setup

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

## 📁 Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── lib/                  # Services and utilities
├── App.tsx               # App entry point with SPA routing
└── global.css            # TailwindCSS 3 theming

server/                   # Express API backend
├── routes/               # API handlers
├── db/                   # Database configuration and schema
├── lib/                  # Server-side services
└── index.ts              # Main server setup

shared/                   # Types used by both client & server
└── api.ts                # Shared API interfaces
```

## 🗄️ Database & Storage

### PostgreSQL Database
- **Tables**: Journal entries, milestones, adventure stats, family data
- **Views**: Aggregated statistics and leaderboards  
- **Functions**: Stored procedures for complex operations
- **Indexes**: Optimized for common query patterns

### Minio Storage
- **Photos**: Original and processed adventure photos
- **Organization**: Date-based folder structure
- **URLs**: Presigned URLs for secure access
- **Bucket**: `wee-adventure-photos`

### Admin Interfaces
- **Database**: Any PostgreSQL client (pgAdmin, DBeaver, etc.)
  - Connect to `localhost:5432`, database `wee_adventure`
- **Storage**: Minio Console at `http://localhost:9001`
  - Login: `minioadmin` / `minioadmin`

## 🌟 Key Features

### Scottish Adventure Tracking
- **Munros**: Track climbed Scottish peaks
- **Castles**: Visit historic Scottish castles
- **Lochs**: Discover beautiful Scottish lochs
- **Hidden Gems**: Find and share secret locations

### Digital Journal
- **Rich Entries**: Photos, location, weather, mood tracking
- **Comments & Likes**: Family interaction features
- **Tags**: Categorize and search adventures
- **Stats**: Comprehensive adventure statistics

### Family Features
- **Multi-User**: Support for family members
- **Milestones**: Achievement tracking system
- **Wishlist**: Plan future adventures
- **Photo Sync**: Cross-device photo synchronization

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run test             # Run tests
npm run typecheck        # TypeScript validation

# Database
npm run db:init          # Initialize/reset database
npm run db:reset         # Alias for db:init

# Docker Services
npm run docker:dev       # Start PostgreSQL + Minio
npm run docker:down      # Stop all containers
```

### API Endpoints

#### Core APIs
- `GET /api/ping` - Health check
- `GET /api/health` - System status (database + storage)

#### Database APIs
- `POST /api/database/query` - Execute database queries
- `POST /api/database/rpc` - Call stored procedures
- `GET /api/database/status` - Database connection status

#### Storage APIs
- `POST /api/photos/upload` - Upload single photo
- `POST /api/photos/upload-multiple` - Upload multiple photos
- `GET /api/photos` - List photos
- `DELETE /api/photos/:id` - Delete photo
- `GET /api/storage/status` - Storage connection status

## 🐳 Docker Services

The development environment uses Docker for consistent database and storage:

### PostgreSQL
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Auto-initialization**: Schema loaded on startup

### Minio
- **Image**: minio/minio:latest  
- **Ports**: 9000 (API), 9001 (Console)
- **Auto-setup**: Bucket created automatically

## 🚀 Production Deployment

### Database Options
1. **Self-hosted**: Docker container, dedicated server
2. **Managed**: AWS RDS, Google Cloud SQL, DigitalOcean

### Storage Options  
1. **Self-hosted**: Minio deployment
2. **Cloud**: AWS S3, Google Cloud Storage (S3-compatible)

### Deployment Platforms
- **Traditional**: VPS with Docker
- **Container**: Kubernetes, Docker Swarm
- **Serverless**: Adapt for platforms like Vercel + external DB
- **Cloud**: AWS, GCP, Azure with managed services

## 📈 Performance & Scaling

### Database Optimizations
- Connection pooling (configured)
- Indexes on common queries
- Stored procedures for complex operations
- Read replicas for scaling

### Storage Optimizations
- CDN integration for global delivery
- Image compression and optimization
- Presigned URLs for direct access
- Automatic cleanup policies

## 🔒 Security

### Database Security
- Parameterized queries (SQL injection protection)
- Connection encryption (SSL/TLS)
- Role-based access control
- Regular security updates

### Storage Security
- Presigned URLs with expiration
- Bucket policies and ACLs
- Access key rotation
- Upload validation and sanitization

### Application Security
- Input validation (Zod schemas)
- XSS protection
- CSRF protection
- Rate limiting

## 🔄 Migration from Supabase

This application was migrated from Supabase to provide:
- **Control**: Full control over database and storage
- **Cost**: Predictable, lower costs at scale
- **Performance**: Optimized for specific use case
- **Flexibility**: Deploy anywhere, any cloud provider

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed migration information.

## 🛠️ Development Guidelines

### Code Style
- TypeScript throughout
- Functional components with hooks
- Tailwind for styling
- Component composition over inheritance

### Database Patterns
- Services layer for database operations
- Consistent error handling
- Transaction support where needed
- Optimistic updates for UI

### File Organization
- Feature-based organization
- Shared utilities in `/lib`
- Reusable components in `/components/ui`
- Types in dedicated files

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs wee-adventure-db

# Restart services
npm run docker:down && npm run docker:dev
```

#### Storage Connection Failed
```bash
# Check if Minio is running
docker ps | grep minio

# Check logs  
docker logs wee-adventure-minio

# Access admin console
open http://localhost:9001
```

#### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run typecheck`
- Clear cache: `rm -rf node_modules dist && npm install`

### Debug Mode
Visit `/debug` in the application to check:
- API connectivity
- Database status
- Storage status
- Environment configuration

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for setup help
3. Check Docker container logs for specific errors
4. Verify environment variable configuration

## 🎯 Roadmap

- [ ] Real-time features with PostgreSQL LISTEN/NOTIFY
- [ ] Advanced photo processing and AI tagging
- [ ] Mobile app with React Native
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support for other regions
- [ ] Offline-first capabilities with sync

---

**Built with ❤️ for Scottish adventure families**

*Explore Scotland, document memories, share the journey.*
