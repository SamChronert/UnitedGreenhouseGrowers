# UGGA Platform

The United Greenhouse Growers Association (UGGA) is a nonprofit, grower-first network designed to connect greenhouse growers nationwide, share vetted knowledge, and give growers a stronger voice in research and policy.

## Overview

This platform features tools for grower networking, decision-making assistance, and a curated resource library, all co-designed with founding members based on real grower feedback. The system is currently in its pilot phase with active member input on development.

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 20 with Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **AI Integration**: OpenAI GPT-4 for member matching and farm assessments

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- OpenAI API key (for AI features)

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
SENDGRID_API_KEY=your_sendgrid_key_optional
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SamChronert/UnitedGreenhouseGrowers.git
cd UnitedGreenhouseGrowers
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── hooks/       # Custom hooks
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication logic
│   ├── storage.ts       # Database operations
│   └── openai.ts        # AI integration
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── README.md
```

## Features

### Core Features
- **Member Authentication**: Secure registration and login system
- **Member Directory**: Search and connect with other growers
- **Resource Library**: Curated, grower-reviewed resources
- **Forum**: Community discussion platform
- **Blog**: Industry insights and updates

### AI-Powered Tools
- **Find-a-Grower**: AI matching system to connect with relevant members
- **Farm Assessment**: Comprehensive analysis and recommendations

### Admin Features
- **Member Management**: View and manage member profiles
- **Content Management**: Create and manage blog posts and resources
- **Challenge Tracking**: Monitor and flag member-submitted challenges

## Mission

UGGA exists to solve fragmentation in the greenhouse industry by:
- Connecting growers to share practical, tested solutions
- Providing peer-reviewed resources over corporate marketing
- Building community and knowledge sharing networks
- Empowering growers in research and policy decisions

## Contributing

This project is in pilot phase with active development based on founding member feedback. Please contact the development team for contribution guidelines.

## License

This project is proprietary to the United Greenhouse Growers Association.

## Contact

For questions about the platform or membership, please contact:
- Email: info@ugga.org
- Phone: (555) 123-4567

---

*Connecting growers, sharing knowledge, strengthening greenhouses.*