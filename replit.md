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

- July 13, 2025: Reframed "What We're Building With You" section for collaborative messaging
  - Replaced feature-card grid with narrative-driven "How We're Building UGGA Together" section
  - Updated both Home and About pages with new collaborative process messaging
  - Added 5-point list emphasizing member input: Share Challenges, Co-Design Tools, Connect with Peers, Raise Your Voice, Preview What's Coming
  - Included direct link to Demo Dashboard for feature previews
  - Shifted focus from specific tools to collaborative building process
  - Maintained responsive design and consistent styling patterns
- July 13, 2025: Created publicly accessible Demo Dashboard
  - Added new `/demo` route accessible to all users without authentication
  - Created DemoDashboard component mirroring member dashboard layout and structure
  - Implemented same Member Tools grid with identical descriptions and "In Development" badges
  - Added demo banner explaining preview functionality with registration link
  - Disabled interactive features (forms, submissions) with helpful demo messaging
  - Added "Demo" link to public navigation between "About" and "Blog"
  - Auto-syncs with member dashboard changes through shared component structure
  - Provides mock user data for demo experience without exposing sensitive information
- July 13, 2025: Updated Sam Chronert's founding member biography
  - Replaced Sam's bio text on About page with new comprehensive content
  - Updated narrative to emphasize hands-on experience, collaborative learning, and practical expertise
  - New bio highlights progression from entry-level to production grower through direct farm experience
  - Maintains existing styling and layout structure for consistency with other founder bios
- July 13, 2025: Forum and navigation enhancements
  - Removed County filter from Forum page - simplified to State and Category filters only
  - Updated Forum page subtitle to: "Connect with fellow growers, share knowledge, organize bulk ordering."
  - Updated Member Forum widget description in Dashboard to match new messaging
  - Reordered Dashboard dropdown navigation menu to show 8 items in priority order:
    1. Overview, 2. Profile, 3. Resource Library, 4. Member Forum, 5. Find a Grower, 6. Farm Assessment, 7. Sales Hub, 8. Product Hub
  - Fixed console JavaScript errors related to undefined county filter variables
  - Cleaned up unused county-related code from ForumFilters component
  - Enhanced navigation consistency across desktop and mobile views
- July 13, 2025: Sales Hub and Product Hub implementation with dashboard modernization
  - Added Sales Hub with interactive US map using Leaflet and OpenStreetMap tiles
  - Implemented buyer/distributor filtering by state and category with sample data
  - Created Product Hub with search functionality and vendor testimonial system
  - Updated Member Tools grid to 3+4 layout (7 widgets total) with reordered priority
  - Enhanced all widget descriptions per specification requirements
  - Added InDevelopmentBanner component with dismissible functionality
  - Applied development banners to Find a Grower, Farm Assessment, Resource Library, Sales Hub, and Product Hub
  - Created database schemas for buyers_distributors and products tables
  - Implemented protected routes for /dashboard/saleshub and /dashboard/producthub
  - Fixed SelectItem value validation errors for proper form functionality
  - Reordered dashboard layout to place "Share Your Challenge" card above Member Tools section for better engagement flow
- July 13, 2025: Resources section secured for members-only access
  - Removed Resources from public navigation menu for logged-out users
  - Updated Resource Library widget in dashboard to link to protected /dashboard/resources route
  - Added redirect from legacy /resources path to /dashboard/resources for backward compatibility
  - Maintained existing protected /dashboard/resources route with AuthGuard requireMember
  - Resources content and functionality remain unchanged, only access control enhanced
- July 13, 2025: Dashboard UI refresh and forum access security implementation
  - Streamlined dashboard by removing Getting Started and Profile Summary sections
  - Updated Member Tools to 5-widget grid (3+2 layout): Find a Grower, Farm Assessment, Resource Library, Member Profile, Member Forum
  - Replaced Support widget with Member Forum widget linking to protected /dashboard/forum route
  - Applied modern styling: white cards with rounded-xl corners, subtle shadows, and smooth hover transitions
  - Implemented green accent theme: bg-green-600/10 backgrounds with text-green-700 icons for consistency
  - Added comprehensive dark mode support with proper contrast ratios
  - Enhanced accessibility with focus rings (ring-2 ring-green-500) and proper keyboard navigation
  - Created auth-protected /dashboard/forum route replacing public /forum access
  - Added automatic redirect from legacy /forum to /dashboard/forum for backward compatibility
  - Improved section spacing (space-y-10) and typography for better visual hierarchy
  - Cleaned up unused imports and code for better maintainability
- July 13, 2025: Enhanced password UX and comprehensive profile editor
  - Added password character counter (X/12 format) with green highlight when requirement met
  - Implemented show/hide password toggle with Eye/EyeOff icons for all password fields
  - Added success modal for password changes replacing toast notifications
  - Expanded profile editor to include ALL registration fields for comprehensive editing
  - Added member type selection in profile with conditional field rendering
  - Implemented multi-select crop types and climate control options in profile editor
  - Added proper validation for grower-specific requirements in profile updates
  - Enhanced accessibility with proper ARIA labels for password visibility toggles
  - Maintained consistent UX between registration and profile editing experiences
- July 13, 2025: Enhanced registration form with member type selection and conditional fields
  - Added "Grower Member" and "General Member" registration types with conditional form rendering
  - Implemented proper field ordering per member type specification
  - Added multi-select climate control with explanatory blurbs and removed N/A exclusivity logic
  - Enhanced greenhouse size options with acreage indicators
  - Added "Other" farm type with conditional text field requirement
  - Updated database schema with new fields: otherFarmType, climateControl array
  - Improved validation for grower-specific requirements and multi-select fields
  - Added inline italic explanations for all climate control options for better UX
  - Maintained backward compatibility with existing member data
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
  - Updated founding member profiles with comprehensive biographies for Sam Chronert, Dr. Melanie Yelton, and Neil Coppinger
  - Added professional photos for all three founding members with conditional rendering
  - Fixed mission section alignment to match other sections
- June 19, 2025: Fixed contact form email functionality and dashboard improvements
  - Corrected API request parameter order in contact form (method, URL, data)
  - Updated SendGrid integration to properly handle API key initialization
  - Added form validation and improved error handling for contact submissions
  - Made dashboard Getting Started section interactive with user-controlled step completion
  - Added Tools section to Resources page with proper filtering functionality
  - Updated Home page logo positioning to be left-aligned with lighter background
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