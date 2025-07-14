# UGGA Platform Deployment Guide

## Overview
This guide covers deploying the UGGA Platform to Replit Deployments with proper error handling and environment configuration.

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these environment variables are configured in your deployment:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`

**Optional (with graceful fallbacks):**
- `OPENAI_API_KEY` - For AI features (Find a Grower, Farm Assessment)
- `SENDGRID_API_KEY` - For email functionality
- `JWT_SECRET` - Authentication secret (defaults to secure fallback)

### 2. Build Process
The application uses a two-step build process:
1. **Frontend Build:** `vite build` → `dist/public/`
2. **Backend Build:** `esbuild server/index.ts` → `dist/index.js`

### 3. Health Check
The application includes a health check endpoint at `/health` that returns:
- Application status
- Environment mode
- Timestamp
- Version information

## Deployment Features

### Graceful Error Handling
- **Missing OpenAI API Key:** AI features show helpful messages instead of crashing
- **Missing SendGrid API Key:** Email features disabled with console warnings
- **Database Connection Issues:** Proper error logging and connection testing
- **Static File Serving:** Fallback handling for missing build files

### Production Configuration
- **Error Messages:** Generic messages in production, detailed in development
- **Graceful Shutdown:** Proper SIGTERM/SIGINT handling
- **Static File Caching:** Optimized static file serving with caching headers
- **Environment Logging:** Startup checks for all required services

### Rate Limiting
- AI endpoints limited to 10 requests per 15 minutes per IP
- Prevents abuse and manages API costs

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Set Environment Variables
Configure the following in your deployment environment:
- `DATABASE_URL` (required)
- `OPENAI_API_KEY` (optional)
- `SENDGRID_API_KEY` (optional)
- `JWT_SECRET` (optional - uses secure default)

### 3. Start the Application
```bash
npm start
```

### 4. Verify Deployment
- Check health endpoint: `https://your-app.replit.app/health`
- Verify database connectivity
- Test core functionality

## Troubleshooting

### Common Issues

**Application Won't Start:**
- Check DATABASE_URL is properly configured
- Verify build files exist in `dist/` directory
- Check Node.js version compatibility

**AI Features Not Working:**
- Verify OPENAI_API_KEY is configured
- Check rate limiting hasn't been exceeded
- Review server logs for OpenAI API errors

**Email Features Not Working:**
- Verify SENDGRID_API_KEY is configured
- Check from email address is verified in SendGrid
- Review server logs for SendGrid API errors

### Debug Commands

**Check Environment:**
```bash
node -e "console.log(process.env.DATABASE_URL ? 'DB configured' : 'DB missing')"
```

**Test Database Connection:**
```bash
curl https://your-app.replit.app/health
```

**View Server Logs:**
Check the deployment logs in Replit for detailed error messages.

## Environment Variable Examples

### Development
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ugga_dev
NODE_ENV=development
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
```

### Production
```bash
DATABASE_URL=postgresql://user:pass@production-db:5432/ugga_prod
NODE_ENV=production
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
JWT_SECRET=your-production-secret
```

## Security Considerations

1. **Never commit API keys** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** for all production deployments
4. **Regularly rotate API keys** and secrets
5. **Monitor rate limits** and usage

## Monitoring

The application provides several monitoring endpoints:
- `/health` - Application health status
- Server logs include startup environment checks
- Error handling provides detailed logging for troubleshooting

## Support

For deployment issues:
1. Check the health endpoint first
2. Review server logs for specific errors
3. Verify all required environment variables
4. Test database connectivity
5. Contact support with specific error messages and logs