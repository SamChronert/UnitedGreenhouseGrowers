# UGGA Platform - Replit Development Guide

## Overview

The United Greenhouse Growers Association (UGGA) platform is a full-stack web application designed to connect greenhouse professionals nationwide. It features AI-powered tools for member matching, farm assessments, and resource recommendations, built with a modern tech stack optimized for Replit deployment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for Replit

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with conventional endpoints
- **Authentication**: JWT tokens with HTTP-only cookies
- **Password Security**: bcrypt with 12 salt rounds
- **Rate Limiting**: Express rate limiting for AI endpoints

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL 16 (configured via Replit modules)
- **Schema Location**: `shared/schema.ts` with proper indexing
- **Migrations**: Managed through Drizzle Kit

### Core Data Models
- **Users**: Authentication and role management (GUEST, MEMBER, ADMIN)
- **Profiles**: Extended user information with location and farm details
- **Blog Posts**: Content management with markdown support
- **Resources**: Curated resources with tag-based filtering

### Authentication System
- **Multi-factor**: Email/username + password authentication
- **Session Management**: 7-day JWT tokens in HTTP-only cookies
- **Role-based Access**: Three-tier permission system
- **Password Policy**: Minimum 12 characters required

### AI Integration
- **Provider**: OpenAI GPT-4o model
- **Features**: 
  - Find-a-Grower matching system
  - Farm assessment and recommendations
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **Error Handling**: Graceful fallbacks for API failures

## Data Flow

### User Registration Flow
1. User submits registration form with profile data
2. Password hashed with bcrypt (12 salt rounds)
3. User and profile records created atomically
4. JWT token generated and set as HTTP-only cookie
5. Redirect to dashboard with authenticated session

### AI-Powered Matching Flow
1. User submits query through chat interface
2. System retrieves relevant member profiles based on filters
3. OpenAI API processes query with member data context
4. Response formatted and returned via streaming interface
5. Chat history logged for session continuity

### Resource Management Flow
- Admin creates/updates resources with tags
- System filters resources based on user's profile (state, farm type)
- Search functionality across titles, URLs, and tags
- Real-time updates via TanStack Query invalidation

## External Dependencies

### Core Services
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Email**: SendGrid for transactional emails (optional)
- **AI Services**: OpenAI API for intelligent features

### Development Tools
- **Replit Integration**: Cartographer plugin for development
- **Error Handling**: Runtime error overlay for debugging
- **Hot Reload**: Vite HMR with Express middleware integration

### UI Components
- **shadcn/ui**: Complete component library with Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Styling**: Custom CSS variables for UGGA brand colors

## Deployment Strategy

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build` (Vite + esbuild bundle)
- **Start Command**: `npm run start` (production Node.js server)
- **Development**: `npm run dev` (concurrent Vite + Express development)

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-provisioned)
- `JWT_SECRET`: Token signing secret (defaults provided)
- `SENDGRID_API_KEY`: Email service key (optional)
- `OPENAI_API_KEY`: AI service key (required for AI features)

### Build Process
1. Vite builds React frontend to `dist/public`
2. esbuild bundles Express server to `dist/index.js`
3. Static assets served from built frontend
4. API routes handle backend functionality

## Changelog

Changelog:
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.