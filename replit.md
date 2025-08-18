# UGGA Platform - Replit Development Guide

## Overview
The United Greenhouse Growers Association (UGGA) is a nonprofit, grower-first network in its pilot phase, aiming to connect greenhouse growers nationwide, facilitate knowledge sharing, and amplify growers' voices in research and policy. The platform provides tools for grower networking, decision-making assistance, and a curated resource library, all co-designed with founding members based on direct grower feedback. The project's vision is to address fragmentation in the greenhouse industry by fostering community, providing practical solutions, and empowering growers.

## User Preferences
- Communication style: Friendly, conversational, plainspoken language that farmers relate to
- Tone: Warm, honest, non-corporate, grounded and helpful
- Avoid: Highlighting "AI" directly, flashy tech-forward language
- Emphasize: Community, usefulness, grower empowerment, peer collaboration

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API
- **Authentication**: JWT tokens with HTTP-only cookies, bcrypt for password hashing (12 salt rounds)
- **Rate Limiting**: Express rate limiting for AI endpoints

### Core Data Models
- **Users**: Authentication and role management (GUEST, MEMBER, ADMIN)
- **Profiles**: Extended user information
- **Blog Posts**: Content management
- **Resources**: Curated resources with tag-based filtering

### Core Features
- **Authentication System**: Email/username + password, 7-day JWT tokens, role-based access (three-tier), 12-character minimum password.
- **AI Integration**: OpenAI GPT-4o for Find-a-Grower matching and farm assessment, with rate limiting.
- **Data Flow**: Includes user registration, AI-powered matching, and resource management.
- **UI/UX Decisions**: Green accent theme, dark mode support, accessibility (WCAG 2.1 AA compliant), consistent component styling, and a focus on collaborative messaging.
- **Deployment Strategy**: Optimized for Replit with specific build and start commands, and environment variable management.

## External Dependencies

### Core Services
- **Database**: PostgreSQL (via DATABASE_URL)
- **AI Services**: OpenAI API (for intelligent features)
- **Email**: SendGrid (optional, for transactional emails)

### Development Tools
- **Replit Integration**: Cartographer plugin
- **Error Handling**: Runtime error overlay

### UI Components
- **shadcn/ui**: Component library with Radix UI primitives
- **Icons**: Lucide React
- **Styling**: Custom CSS variables for UGGA brand colors