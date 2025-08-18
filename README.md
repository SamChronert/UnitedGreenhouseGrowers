# UGGA Platform

United Greenhouse Growers Association (UGGA) web application - A collaborative platform connecting and empowering agricultural professionals through innovative technology and networking solutions.

## Overview

The United Greenhouse Growers Association (UGGA) is a nonprofit, grower-first network in its pilot phase, aiming to connect greenhouse growers nationwide, facilitate knowledge sharing, and amplify growers' voices in research and policy. The platform provides tools for grower networking, decision-making assistance, and a curated resource library, all co-designed with founding members based on direct grower feedback.

## Features

- **Member Authentication & Profiles** - Secure registration and member management
- **AI-Powered Find a Grower** - Connect with relevant growers based on expertise and location
- **Farm Assessment Tool** - AI-powered greenhouse operation analysis and recommendations
- **Resource Library** - Curated resources with state and farm type filtering
- **Blog & News** - Industry updates and member-generated content
- **Admin Dashboard** - Complete member and content management
- **Responsive Design** - Works on all devices with accessibility features

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **Vite** for build tooling

### Backend
- **Node.js 20** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **JWT** authentication with HTTP-only cookies
- **OpenAI GPT-4o** for AI features
- **SendGrid** for email services

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key (optional, for AI features)
- SendGrid API key (optional, for email features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ugga-platform.git
cd ugga-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

See `.env.example` for all required and optional environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `OPENAI_API_KEY` - For AI features
- `SENDGRID_API_KEY` - For email functionality
- `JWT_SECRET` - Authentication secret (uses secure default)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## Deployment

The application is optimized for deployment on Replit with comprehensive error handling and fallbacks for missing services. See `DEPLOYMENT.md` for detailed deployment instructions.

### Health Check

The application includes a health check endpoint at `/health` for monitoring deployment status.

## Architecture

- **Frontend**: React SPA with client-side routing
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for intelligent features
- **Authentication**: JWT tokens with role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to the United Greenhouse Growers Association.

## Support

For technical support or questions, please contact the development team.