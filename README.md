# UGGA Platform

United Greenhouse Growers Association (UGGA) web application - A comprehensive digital platform empowering agricultural professionals through intelligent resource management, community networking, and data-driven insights.

## Overview

The United Greenhouse Growers Association (UGGA) is a nonprofit, grower-first network in its pilot phase, aiming to connect greenhouse growers nationwide, facilitate knowledge sharing, and amplify growers' voices in research and policy. The platform provides tools for grower networking, decision-making assistance, and a curated resource library, all co-designed with founding members based on direct grower feedback. The project's vision is to address fragmentation in the greenhouse industry by fostering community, providing practical solutions, and empowering growers.

## Core Features

### 🔐 Authentication & User Management
- **Three-tier role system**: Guest, Member, Admin access levels
- **Secure JWT authentication** with HTTP-only cookies (7-day tokens)
- **Password security**: 12-character minimum, bcrypt hashing (12 salt rounds)
- **Profile management**: Extended user information with grower-specific fields
- **Member type distinction**: Grower vs. general member workflows

### 📚 Comprehensive Resource Library
**8 Resource Type Categories:**
- **Universities** - Academic programs, research centers, extension services
- **Organizations** - Industry associations, cooperatives, advocacy groups
- **Grants** - Funding opportunities with amount and deadline tracking
- **Tax Incentives** - Tax credits, deductions, and financial benefits
- **Tools & Templates** - Calculators, forms, spreadsheets with format tracking
- **Learning** - Courses, webinars, educational content
- **Blogs & Bulletins** - Industry publications and newsletters
- **Industry News** - Latest market updates and regulatory changes

**Advanced Resource Features:**
- **Smart filtering**: By type, tags, crop, system type, region, cost
- **Quality scoring**: UGGA-verified resources with quality rankings
- **Location mapping**: Geographic visualization with lat/long coordinates
- **Favorites system**: Personal resource bookmarking
- **Search functionality**: Full-text search across all resource content

### 🤖 AI-Powered Intelligence
- **Find-a-Grower Matching**: OpenAI GPT-4o powered grower connections
- **Farm Assessment Tool**: AI-driven greenhouse operation analysis
- **Rate limiting**: Intelligent rate limiting for AI endpoints
- **Conversation logging**: Chat history for assessment and matching

### 🛠️ Admin Management System
**Complete CRUD Operations:**
- **Resource Management**: Create, edit, delete resources with type-specific forms
- **CSV Import/Export**: Bulk operations with column mapping and validation
- **Dynamic Forms**: Type-aware input fields (grants: amount/deadline, etc.)
- **Analytics Dashboard**: Resource counts, usage statistics
- **Content Moderation**: Review and approval workflows

### 💬 Community Features
- **Forum System**: Category-based discussions (Bulk Ordering, Plant Health, etc.)
- **Grower Challenges**: Issue tracking and admin flagging
- **Member Networking**: Location and expertise-based connections
- **Knowledge Sharing**: Peer-to-peer collaboration tools

### 📊 Analytics & Insights
- **User Analytics**: Session tracking, interaction monitoring
- **Resource Analytics**: Usage patterns, popular content
- **Event Logging**: Comprehensive activity tracking
- **Performance Metrics**: Platform usage and engagement data

### 🎨 User Experience
- **Responsive Design**: Mobile-first, adaptive layouts
- **Dark Mode Support**: System preference and manual toggle
- **Accessibility**: WCAG 2.1 AA compliance with manual audit tools
- **Progressive Enhancement**: Works without JavaScript
- **Loading States**: Skeleton screens and optimistic updates

## System Architecture

### Frontend Stack
- **React 18** with TypeScript and ES modules
- **Wouter** for client-side routing and navigation
- **TanStack Query (React Query v5)** for server state management and caching
- **Tailwind CSS** with shadcn/ui component library
- **React Hook Form** with Zod validation and type safety
- **Vite** for fast development and optimized builds
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent iconography

### Backend Stack
- **Node.js 20** runtime with Express.js framework
- **TypeScript** with strict type checking and ES modules
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** as the primary database
- **Express Rate Limiting** for API protection
- **Compression** middleware for response optimization
- **Cookie Parser** for secure session management

### Database Schema
**Core Tables:**
- `users` - Authentication and role management
- `profiles` - Extended user information with grower-specific fields
- `resources` - Resource library with JSONB for type-specific data
- `blog_posts` - Content management system
- `chat_logs` - AI conversation history
- `grower_challenges` - Issue tracking and support
- `forum_posts` & `forum_comments` - Community discussions
- `favorites` - User bookmarking system
- `analytics_events` - Comprehensive activity tracking
- `buyers_distributors` - Supply chain connections
- `products` - Product catalog with testimonials

**Data Models:**
- **Hybrid resource model**: Core fields + type-specific JSONB data
- **Role-based access**: Three-tier permission system
- **Soft deletes**: Preservation of forum content integrity
- **Optimized indexing**: Performance-tuned for common queries
- **Geographic data**: Lat/long coordinates for location features

### Security & Authentication
- **JWT tokens**: 7-day expiration with HTTP-only cookies
- **Password hashing**: bcrypt with 12 salt rounds
- **Role-based authorization**: Middleware for protected routes
- **CORS configuration**: Secure cross-origin requests
- **Rate limiting**: Protection against abuse and DoS
- **Input validation**: Zod schemas on both client and server
- **SQL injection protection**: Parameterized queries via Drizzle ORM

### API Architecture
**RESTful Endpoints:**
- `GET /api/auth/*` - Authentication and session management
- `GET /api/resources` - Resource library with filtering and pagination
- `POST /api/admin/resources` - Admin resource creation (auth required)
- `PUT /api/admin/resources/:id` - Resource updates (admin only)
- `DELETE /api/admin/resources/:id` - Resource deletion with cascade cleanup
- `GET /api/admin/resources/counts` - Analytics and dashboard data
- `POST /api/chat/*` - AI-powered features (rate limited)
- `GET /api/blog` - Content management system
- `POST /api/analytics/*` - Usage tracking and metrics

**Data Flow:**
- **Client-side caching**: TanStack Query with intelligent invalidation
- **Optimistic updates**: Immediate UI feedback with rollback on failure
- **Paginated responses**: Cursor-based pagination for large datasets
- **Error boundaries**: Comprehensive error handling with user-friendly messages
- **Type safety**: End-to-end TypeScript from database to UI

### External Integrations
**OpenAI GPT-4o:**
- **Find-a-Grower**: Intelligent matching based on location, crops, and expertise
- **Farm Assessment**: AI-driven analysis of greenhouse operations
- **Rate limiting**: 10 requests per minute per user
- **Error handling**: Graceful degradation when API unavailable
- **Cost optimization**: Efficient prompt engineering and caching

**SMTP Email Services:**
- **DreamHost SMTP** (forms@greenhousegrowers.org): Admin notifications sent to admins@greenhousegrowers.org
- **Brevo SMTP** (noreply@greenhousegrowers.org): User transactional emails (password resets, welcome emails)
- **Reliable delivery**: Dedicated SMTP providers for different email types
- **Graceful fallback**: Platform works without email service configured

**PostgreSQL Cloud:**
- **Connection pooling**: Optimized for Replit deployment
- **Backup strategy**: Automated daily backups
- **Migration management**: Schema versioning with Drizzle
- **Performance monitoring**: Query optimization and indexing

### Performance & Scalability
**Frontend Optimization:**
- **Code splitting**: Route-based lazy loading
- **Asset optimization**: Vite's built-in bundling and minification
- **Image optimization**: Responsive images with proper formats
- **Caching strategy**: Service worker for offline functionality
- **Tree shaking**: Elimination of unused code

**Backend Optimization:**
- **Database indexing**: Strategic indices for common queries
- **Response compression**: Gzip compression for all responses
- **Connection pooling**: Efficient database connection management
- **Memory optimization**: Efficient data structures and garbage collection
- **Query optimization**: Drizzle ORM with optimized SQL generation

## Development Workflow

### Prerequisites
- **Node.js 20+** (recommended for optimal performance)
- **PostgreSQL 14+** database instance
- **OpenAI API key** (optional, for AI features)
- **SMTP credentials** (optional, for email features):
  - DreamHost SMTP for admin notifications
  - Brevo SMTP for user transactional emails

### Quick Start

1. **Clone and setup:**
```bash
git clone https://github.com/your-username/ugga-platform.git
cd ugga-platform
npm install
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Configure your environment variables
```

3. **Database setup:**
```bash
npm run db:push --force
# Syncs schema and creates all required tables
```

4. **Start development:**
```bash
npm run dev
# Starts both backend (port 5000) and frontend (Vite dev server)
```

### Environment Variables

**Core Configuration:**
```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database

# AI Features (Optional)
OPENAI_API_KEY=sk-your-openai-key

# Email Services (Optional)
# DreamHost SMTP for admin notifications
DREAMHOST_SMTP_USER=forms@greenhousegrowers.org
DREAMHOST_SMTP_PASS=your-dreamhost-password

# Brevo SMTP for user transactional emails
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_PASS=your-brevo-password

# Security (Auto-generated if not provided)
JWT_SECRET=your-secret-key-minimum-32-characters

# Development
NODE_ENV=development
```

### Available Scripts

**Development:**
- `npm run dev` - Start development server with hot reload
- `npm run check` - TypeScript type checking without compilation
- `npm run lint` - ESLint code quality checks

**Database:**
- `npm run db:push` - Sync schema changes to database
- `npm run db:push --force` - Force sync (for breaking changes)
- `npm run db:studio` - Launch Drizzle Studio for database management

**Production:**
- `npm run build` - Production build with optimizations
- `npm start` - Start production server
- `npm run preview` - Preview production build locally

## Deployment

### Replit Deployment (Recommended)
The application is optimized for Replit with:
- **Zero-config setup**: Automatic environment detection
- **Health monitoring**: `/health` endpoint for status checks
- **Error boundaries**: Graceful handling of service failures
- **Resource optimization**: Memory and CPU efficient design

### Production Deployment
1. **Build the application:**
```bash
npm run build
```

2. **Set production environment:**
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
```

3. **Start the server:**
```bash
npm start
```

### Platform Architecture
**Single-Port Design:**
- **Backend**: Express server on port 5000
- **Frontend**: Served as static assets from Express
- **WebSocket**: Real-time features (future enhancement)
- **Health Check**: `/health` endpoint for monitoring

**Scalability Considerations:**
- **Horizontal scaling**: Stateless design allows multiple instances
- **Database optimization**: Indexed queries and connection pooling
- **CDN integration**: Static asset delivery optimization
- **Monitoring**: Comprehensive logging and analytics

## Quality Assurance

### Testing Strategy
- **Type Safety**: End-to-end TypeScript validation
- **Runtime Validation**: Zod schemas for all API endpoints
- **Error Boundaries**: React error boundaries for graceful failures
- **Database Constraints**: PostgreSQL constraints and foreign keys
- **Manual Testing**: Comprehensive admin and user workflow testing

### Code Quality
- **ESLint**: Consistent code style and best practices
- **TypeScript**: Strict type checking with no implicit any
- **Drizzle Schema**: Type-safe database operations
- **React Hook Form**: Client-side validation with server validation
- **Accessibility**: WCAG 2.1 AA compliance with axe-core integration

### Monitoring & Logging
- **Health Endpoint**: `/health` for deployment monitoring
- **Error Logging**: Comprehensive server-side error tracking
- **Analytics Events**: User interaction and feature usage tracking
- **Performance Metrics**: Response times and resource utilization

## Development Guidelines

### Code Organization
```
├── client/src/           # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-based page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and configurations
├── server/              # Express backend
│   ├── routes.ts        # API endpoint definitions
│   ├── storage.ts       # Database operations layer
│   └── middleware/      # Authentication and validation
├── shared/              # Shared type definitions
│   └── schema.ts        # Drizzle ORM schema and types
└── database/            # Database configuration
```

### Contributing

**Development Workflow:**
1. **Fork** and clone the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Install** dependencies: `npm install`
4. **Setup** environment: Copy `.env.example` to `.env`
5. **Database** sync: `npm run db:push --force`
6. **Develop** with hot reload: `npm run dev`
7. **Test** thoroughly across all user roles
8. **Commit** with descriptive messages
9. **Submit** a pull request with detailed description

**Commit Message Format:**
```
type(scope): description

fix(auth): resolve JWT token expiration handling
feat(resources): add CSV import functionality for admin
docs(readme): update deployment instructions
```

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen readers, keyboard navigation
- **Progressive Enhancement**: Core functionality without JavaScript

## Project Status

### Current Version: 1.0.0 (Pilot Phase)
**✅ Completed Features:**
- ✓ Complete authentication and authorization system
- ✓ Comprehensive resource library with 8 category types
- ✓ Full admin CRUD operations with CSV import/export
- ✓ AI-powered Find-a-Grower and Farm Assessment tools
- ✓ Community forum and grower challenge tracking
- ✓ Analytics and favorites system
- ✓ Responsive design with dark mode support
- ✓ WCAG 2.1 AA accessibility compliance

**🚧 In Development:**
- Real-time notifications system
- Advanced search with AI-powered recommendations
- Mobile app companion
- Advanced analytics dashboard

**📋 Planned Features:**
- Multi-language support
- Advanced forum moderation tools
- Integration with agricultural data providers
- Marketplace for grower-to-grower commerce

## License & Usage

This project is proprietary to the **United Greenhouse Growers Association (UGGA)**.

**Usage Rights:**
- Licensed for UGGA members and authorized developers
- Modifications must be approved by UGGA technical committee
- Commercial redistribution prohibited without explicit permission

## Support & Contact

**Technical Support:**
- **Documentation**: Full API and setup documentation in `/docs`
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Development Team**: Contact through UGGA official channels

**Community:**
- **UGGA Members**: Access member-only support channels
- **Developers**: Technical discussions in project repository
- **Feature Requests**: Submit through official UGGA channels

---

**Built with ❤️ for the greenhouse growing community**  
*Empowering growers through technology and collaboration*