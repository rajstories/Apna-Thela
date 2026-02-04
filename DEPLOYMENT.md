# 🚀 Apna Thela - Deployment Guide

## Project Overview
Apna Thela is a full-stack multilingual business management application for Indian street food vendors.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (Neon serverless)
- Features: PWA, Voice Recognition, 6 Languages Support

---

## 🎯 Recommended Deployment: Vercel

### Why Vercel?
✅ Zero-config deployment for full-stack apps
✅ Automatic HTTPS and global CDN
✅ Perfect PostgreSQL integration
✅ Free tier with generous limits
✅ Excellent PWA support

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Neon PostgreSQL)

1. **Create Neon Account**: Visit [neon.tech](https://neon.tech)
2. **Create New Project**: Name it "apna-thela"
3. **Get Connection String**: Copy the DATABASE_URL
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb
   ```

### 2. Environment Variables

Create a `.env` file in `/BhashaBazaar` directory:

```bash
DATABASE_URL=your_neon_database_url_here
NODE_ENV=production
PORT=5000
```

### 3. Test Local Build

```bash
cd BhashaBazaar
npm install
npm run build
npm start
```

---

## 🚀 Deployment Steps - Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from BhashaBazaar directory:**
   ```bash
   cd BhashaBazaar
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   # Paste your Neon DATABASE_URL when prompted
   
   vercel env add NODE_ENV
   # Enter: production
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard (GitHub Integration)

1. **Push to GitHub:**
   ```bash
   cd /Users/vishal/Downloads/Apna-Thela-master
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/apna-thela.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set **Root Directory** to: `BhashaBazaar`
   - Add environment variables:
     - `DATABASE_URL`: Your Neon connection string
     - `NODE_ENV`: production

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

---

## 🔧 Alternative Deployment Options

### Option 2: Railway

**Pros:** Built-in PostgreSQL, simple deployment
**Cons:** Limited free tier

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd BhashaBazaar
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

### Option 3: Render

**Pros:** Free PostgreSQL, easy setup
**Cons:** Slower cold starts

1. Create account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Set:
   - **Root Directory**: `BhashaBazaar`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add PostgreSQL database
6. Deploy

### Option 4: DigitalOcean App Platform

**Pros:** Full control, scalable
**Cons:** Paid service

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create App from GitHub
3. Configure build settings
4. Add managed PostgreSQL database
5. Deploy

---

## 🔐 Environment Variables Configuration

### Required Variables:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
```

### Optional Variables (if using OpenAI features):
```bash
OPENAI_API_KEY=your_openai_api_key
```

---

## 🧪 Post-Deployment Testing

1. **Check API Health:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test Database Connection:**
   - Visit your deployed URL
   - Try creating an inventory item
   - Check if data persists

3. **PWA Installation:**
   - Open app on mobile browser
   - Check for "Install App" prompt
   - Test offline functionality

4. **Voice Features:**
   - Test voice input in different languages
   - Verify language auto-detection

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** TypeScript compilation errors
**Solution:**
```bash
cd BhashaBazaar
npm run check
# Fix any TypeScript errors
```

### Database Connection Issues

**Issue:** Cannot connect to database
**Solution:**
1. Verify DATABASE_URL is correct
2. Check Neon database is active
3. Ensure IP allowlist includes Vercel IPs (usually 0.0.0.0/0)

### API Routes Not Working

**Issue:** 404 on /api/* routes
**Solution:**
1. Check `vercel.json` routing configuration
2. Ensure build completed successfully
3. Verify `dist/index.js` exists

### PWA Not Installing

**Issue:** Install prompt doesn't appear
**Solution:**
1. Ensure HTTPS is enabled (automatic on Vercel)
2. Check `manifest.json` is accessible
3. Verify Service Worker registration

---

## 📊 Performance Optimization

### 1. Enable Caching
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Database Connection Pooling
Already configured in `server/db.ts` with Neon serverless driver

### 3. CDN for Static Assets
Automatically handled by Vercel

---

## 🔄 Continuous Deployment

### Automatic Deployments (GitHub + Vercel)

1. **Main Branch → Production:**
   - Push to `main` branch
   - Vercel automatically deploys to production

2. **Feature Branches → Preview:**
   - Push to any branch
   - Vercel creates preview deployment
   - Test before merging

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Create preview deployment
vercel
```

---

## 📱 Domain Configuration

### Custom Domain Setup (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `apnathela.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## 💰 Cost Estimation

### Free Tier (Recommended for MVP)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **Neon PostgreSQL**: Free (0.5GB storage, 100 hours compute)
- **Total**: $0/month

### Paid Tier (For Production Scale)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Neon Scale**: $19/month (10GB storage, unlimited compute)
- **Total**: ~$39/month

---

## 🎉 Quick Start Commands

```bash
# 1. Navigate to project
cd /Users/vishal/Downloads/Apna-Thela-master/BhashaBazaar

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Test build locally
npm run build
npm start

# 5. Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Vite Docs**: https://vitejs.dev
- **Drizzle ORM**: https://orm.drizzle.team

---

## ✅ Deployment Checklist

- [ ] Database created on Neon
- [ ] Environment variables configured
- [ ] Local build tested successfully
- [ ] GitHub repository created (if using Git deployment)
- [ ] Vercel project created and connected
- [ ] Environment variables added to Vercel
- [ ] First deployment successful
- [ ] API endpoints tested
- [ ] PWA installation tested
- [ ] Voice features verified
- [ ] Custom domain configured (optional)

---

**Need Help?** Check the troubleshooting section or contact support.
