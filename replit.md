# UGGA Platform - Replit Development Guide

## Overview

The United Greenhouse Growers Association (UGGA) is a nonprofit, grower-first network in its pilot phase designed to connect greenhouse growers nationwide, share vetted knowledge, and give growers a stronger voice in research and policy. The platform features tools for grower networking, decision-making assistance, and a curated resource library, all co-designed with founding members based on real grower feedback.

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

- June 19, 2025: Added password change functionality to user profile settings
  - Created secure password change API endpoint with current password verification
  - Added comprehensive frontend form with password visibility toggles
  - Implemented proper validation (12 character minimum, confirmation matching)
  - Enhanced profile settings page with dedicated password change section
- June 16, 2025: Initial UGGA platform setup with authentication and database
- June 16, 2025: Updated entire site messaging to reflect nonprofit, grower-first mission
  - Homepage redesigned with new tagline "Connecting growers, sharing knowledge, strengthening greenhouses"
  - Added development banner highlighting pilot program status
  - About page updated with founding members Sam Chronert and Dr. Melanie Yelton
  - Resources page restructured with grower-reviewed library concept
  - Created foundational blog post "Fragmented Yet Full of Potential" addressing industry challenges
  - Registration updated to welcome "founding members" rather than generic users
  - Removed corporate AI-focused language in favor of practical, peer-to-peer messaging
  - Enhanced homepage messaging to emphasize collaboration over isolation: "Greenhouse growers shouldn't have to solve the same problems in isolation. We're building a place to connect, share, and lead — together."
  - Updated footer description to reflect grower-first values: "Bringing greenhouse growers together to share hard-earned knowledge, tackle real-world challenges, and strengthen the industry — together."
  - Added custom SVG banner images to feature boxes for better visual engagement
  - Refined problem statement messaging on About page to be more personal and empathetic: "Greenhouse growers are solving the same problems alone" replacing corporate "fragmentation" language
  - Removed statistics cards from dashboard to align with pilot program status
  - Simplified contact page to single horizontal layout with email and phone only
  - Removed AI references from dashboard in favor of "member tools" language
- June 19, 2025: Fixed About page layout alignment and founding members display
  - Applied consistent center alignment with max-w-3xl (48rem) container across all sections
  - Converted founding members from card grid to horizontal list format for better responsive behavior
  - Updated founding member profiles with comprehensive biographies for Sam Chronert and Dr. Melanie Yelton
  - Added Dr. Melanie Yelton's LinkedIn photo with conditional rendering
  - Fixed mission section alignment to match other sections
- June 19, 2025: Complete accessibility and performance enhancement pass
  - Achieved WCAG 2.1 AA compliance with proper contrast ratios, ARIA labels, focus states, and keyboard navigation
  - Fixed all missing buttons, broken routes, and blank admin pages across Member and Admin Dashboards
  - Enhanced form accessibility with proper labels, error messaging, and semantic HTML structure
  - Implemented performance optimizations including WebP image conversion, lazy loading, and robots.txt for SEO
  - Fixed text alignment issues on About page ensuring left-aligned content for improved readability
  - All changes committed and pushed to GitHub repository

## Mission & Voice

UGGA is a nonprofit, grower-first network solving fragmentation in the greenhouse industry. We exist to help growers connect, share knowledge, and have a stronger voice in research and innovation. The site emphasizes:

- Practical solutions tested by real growers
- Peer-reviewed resources over corporate marketing
- Community building and knowledge sharing
- Grower empowerment in research and policy decisions
- Pilot program status with active member input on development

## User Preferences

- Communication style: Friendly, conversational, plainspoken language that farmers relate to
- Tone: Warm, honest, non-corporate, grounded and helpful
- Avoid: Highlighting "AI" directly, flashy tech-forward language
- Emphasize: Community, usefulness, grower empowerment, peer collaboration