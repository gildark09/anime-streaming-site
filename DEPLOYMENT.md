# YumeStream Deployment Guide

## 1. Frontend Deployment (Vercel/Netlify)

### Prepare Frontend
1. Update environment variables
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

2. Build the project
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy to Vercel (Recommended)
   - Create account on [Vercel](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel login`
   - In project directory run: `vercel`
   - Follow the prompts
   - Set environment variables in Vercel dashboard

Alternative: Deploy to Netlify
- Create account on [Netlify](https://netlify.com)
- Connect your GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Set environment variables

## 2. Backend Deployment (Railway/Render)

### Prepare Backend
1. Update environment variables
   ```env
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.com
   ```

2. Deploy to Railway (Recommended)
   - Create account on [Railway](https://railway.app)
   - Install Railway CLI: `npm i -g @railway/cli`
   - Run: `railway login`
   - Initialize: `railway init`
   - Deploy: `railway up`
   - Set environment variables in Railway dashboard

Alternative: Deploy to Render
- Create account on [Render](https://render.com)
- Create new Web Service
- Connect GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`
- Set environment variables

## 3. Domain Setup (Optional)

### Free Domain Options:
1. Use provided subdomain:
   - yourapp.vercel.app (Frontend)
   - yourapp.up.railway.app (Backend)

### Custom Domain (Paid):
1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Configure DNS settings
3. Add domain in Vercel/Railway dashboard

## 4. Final Steps

1. Test Production Build
   - Test all features
   - Check API connections
   - Verify CORS settings
   - Test video streaming

2. Update API URLs
   - Update frontend API_URL to production backend URL
   - Verify all API calls are using HTTPS

3. Security Checks
   - Enable CORS protection
   - Set rate limiting
   - Configure security headers

## Free Tier Limitations

### Vercel (Frontend)
- 100GB bandwidth/month
- Automatic HTTPS
- Unlimited personal projects
- Serverless functions included

### Railway (Backend)
- $5 credit monthly
- 512MB RAM
- Shared CPU
- 1GB disk

## Monitoring

1. Set up free monitoring:
   - Uptime Robot for uptime monitoring
   - Vercel Analytics (included)
   - Railway Metrics (included)

## Recommended Free Stack

Frontend:
- Vercel (Hosting)
- Cloudflare (CDN/Cache)

Backend:
- Railway (Hosting)
- MongoDB Atlas (Free tier database if needed)

## Post-Deployment

1. Monitor error logs
2. Set up backup strategy
3. Document deployment process
4. Set up CI/CD (GitHub Actions - free for public repos)

## Maintenance

1. Regular updates
2. Monitor usage/quotas
3. Check error logs
4. Update dependencies 