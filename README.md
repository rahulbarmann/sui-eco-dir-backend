# Sui Ecosystem Directory Backend

A Node.js TypeScript backend API for the Sui Ecosystem Project Directory, providing comprehensive project and category management with RESTful endpoints.

## 🚀 Features

- **RESTful API** with Express.js and TypeScript
- **Project Management** - CRUD operations for Sui ecosystem projects
- **Video Management** - Comprehensive video handling for projects
- **Static Categories** - Predefined categories based on SVG icons
- **Search & Filtering** - Advanced search and filtering capabilities
- **Pagination** - Efficient data pagination
- **Input Validation** - Zod schema validation
- **Error Handling** - Comprehensive error handling middleware
- **Security** - Helmet, CORS, rate limiting
- **Logging** - Request logging with Morgan
- **Health Checks** - API health monitoring endpoints
- **Database** - PostgreSQL with Prisma ORM

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm
- PostgreSQL database

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

3. **Set up database:**

   ```bash
   # Make sure PostgreSQL is running and create a database named 'sui_eco_dir'
   npm run db:setup
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding
├── scripts/
│   └── setup-db.js     # Database setup script
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Database Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Complete database setup (generate, push, seed)

## 🌐 API Endpoints

### Health Checks

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/status` - Detailed status

### Projects

- `GET /api/v1/projects` - Get all projects (with filtering & pagination)
- `GET /api/v1/projects/featured` - Get featured projects
- `GET /api/v1/projects/search?q=term` - Search projects
- `GET /api/v1/projects/category/:category` - Get projects by category
- `GET /api/v1/projects/:id` - Get project by ID
- `POST /api/v1/projects` - Create new project (Admin)
- `PUT /api/v1/projects/:id` - Update project (Admin)
- `DELETE /api/v1/projects/:id` - Delete project (Admin)

### Videos

- `GET /api/v1/videos` - Get all videos (with filtering & pagination)
- `GET /api/v1/videos/featured` - Get featured videos
- `GET /api/v1/videos/search?q=term` - Search videos
- `GET /api/v1/videos/project/:projectId` - Get videos by project
- `GET /api/v1/videos/:id` - Get video by ID
- `POST /api/v1/videos/project/:projectId` - Create new video (Admin)
- `PUT /api/v1/videos/:id` - Update video (Admin)
- `DELETE /api/v1/videos/:id` - Delete video (Admin)

## 📝 Query Parameters

### Projects Endpoint

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category` - Filter by category
- `featured` - Filter featured projects (true/false)
- `status` - Filter by status (active/inactive/coming-soon)
- `search` - Search in name, description, and tags
- `tags` - Filter by tags (comma-separated)
- `sortBy` - Sort field (name, createdAt, etc.)
- `sortOrder` - Sort order (asc/desc)

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Zod schema validation
- **Error Handling** - Secure error responses

## 🧪 Testing

```bash
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
```

## 📦 Production Build

```bash
npm run build         # Build TypeScript to JavaScript
npm run start         # Start production server
```

## 🔧 Configuration

Environment variables in `.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Configuration
API_PREFIX=/api/v1

# Logging
LOG_LEVEL=info

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/sui_eco_dir?schema=public"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
